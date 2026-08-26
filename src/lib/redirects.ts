import { supabase } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';

export interface RedirectRecord {
  id?: string;
  source_path: string;
  destination_path: string;
  redirect_type: number;
  is_active: boolean;
  hit_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RedirectAuditResult {
  total: number;
  activeCount: number;
  chainsCount: number;
  loopsCount: number;
  selfRedirectsCount: number;
  chains: Array<{ originalSource: string; intermediate: string; finalDestination: string }>;
  loops: Array<{ source: string; targets: string[] }>;
  selfRedirects: string[];
}

/**
 * Normalizes a URL path for redirect matching
 * Ensures starting slash, no trailing slash (except root), lowercase, and strips host/queries
 */
export function normalizeRedirectPath(path: string): string {
  if (!path) return '';
  let clean = path.trim();
  // Strip protocol and host
  clean = clean.replace(/^https?:\/\/[^\/]+/, '');
  // Strip query parameters and hash fragments
  clean = clean.split('?')[0].split('#')[0];
  // Collapse duplicate consecutive slashes
  clean = clean.replace(/\/+/g, '/');
  // Ensure leading slash
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }
  // Strip trailing slash (except root '/')
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean.toLowerCase();
}

/**
 * Resolves a requested path to its final direct canonical destination in 1 hop.
 * Follows intermediate redirect chains up to maxDepth and detects circular loops.
 */
export async function resolveDirectDestination(
  initialPath: string,
  maxDepth = 10
): Promise<{ destination_path: string; redirect_type: number; hops: number } | null> {
  try {
    const cleanInitial = normalizeRedirectPath(initialPath);
    if (!cleanInitial) return null;

    const serverClient = createServerClient();
    const visited = new Set<string>();
    let currentPath = cleanInitial;
    let finalType = 301;
    let hops = 0;

    while (hops < maxDepth) {
      if (visited.has(currentPath)) {
        // Circular redirect loop detected! Abort to prevent browser hang
        console.warn(`Redirect loop detected for path: ${initialPath} at ${currentPath}`);
        break;
      }
      visited.add(currentPath);

      const { data } = await serverClient
        .from('redirects')
        .select('id, destination_path, redirect_type, hit_count')
        .eq('source_path', currentPath)
        .eq('is_active', true)
        .maybeSingle();

      if (!data || !data.destination_path) {
        break;
      }

      finalType = data.redirect_type || 301;
      const nextDest = normalizeRedirectPath(data.destination_path);

      if (nextDest === currentPath) {
        // Self-referencing redirect rule
        break;
      }

      currentPath = nextDest;
      hops++;

      // Async increment hit count on initial matching rule
      if (hops === 1 && data.id) {
        serverClient
          .from('redirects')
          .update({ hit_count: (data.hit_count || 0) + 1 })
          .eq('id', data.id)
          .then(() => {}, () => {});
      }
    }

    if (hops > 0 && currentPath !== cleanInitial) {
      return {
        destination_path: currentPath,
        redirect_type: finalType,
        hops,
      };
    }

    return null;
  } catch (err) {
    console.warn('Error resolving direct redirect destination:', err);
    return null;
  }
}

/**
 * Automatically records a 301 redirect when a content slug changes
 * Proactively collapses redirect chains (if A->B existed and B->C is created, A->C is updated)
 */
export async function recordSlugChangeRedirect(
  sourcePath: string,
  destinationPath: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const src = normalizeRedirectPath(sourcePath);
    const dest = normalizeRedirectPath(destinationPath);

    if (!src || !dest || src === dest) {
      return { success: true };
    }

    // 1. Insert or update redirect for source -> destination
    const { error } = await supabase
      .from('redirects')
      .upsert(
        {
          source_path: src,
          destination_path: dest,
          redirect_type: 301,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'source_path' }
      );

    if (error) {
      console.warn('Error recording slug change redirect:', error.message);
      return { success: false, message: error.message };
    }

    // 2. Prevent multi-hop chains: Collapse any existing redirects pointing to `src` directly to `dest`
    try {
      await supabase
        .from('redirects')
        .update({ destination_path: dest, updated_at: new Date().toISOString() })
        .eq('destination_path', src)
        .neq('source_path', dest);
    } catch {}

    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    console.warn('Redirect record notice:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Server-side check for an active redirect matching the requested path.
 * Guaranteed to return the direct, 1-hop final destination.
 */
export async function getRedirectForPath(
  path: string
): Promise<{ destination_path: string; redirect_type: number } | null> {
  const direct = await resolveDirectDestination(path);
  if (direct) {
    return {
      destination_path: direct.destination_path,
      redirect_type: direct.redirect_type,
    };
  }
  return null;
}

/**
 * Scans all database redirect records and audits for chains, loops, and self-redirects.
 */
export async function auditRedirectIntegrity(): Promise<RedirectAuditResult> {
  const serverClient = createServerClient();
  const { data: allRedirects } = await serverClient
    .from('redirects')
    .select('source_path, destination_path, is_active');

  const records = allRedirects || [];
  const activeRecords = records.filter((r) => r.is_active);
  const redirectMap = new Map<string, string>();

  activeRecords.forEach((r) => {
    redirectMap.set(normalizeRedirectPath(r.source_path), normalizeRedirectPath(r.destination_path));
  });

  const chains: Array<{ originalSource: string; intermediate: string; finalDestination: string }> = [];
  const loops: Array<{ source: string; targets: string[] }> = [];
  const selfRedirects: string[] = [];

  for (const [src, dest] of redirectMap.entries()) {
    if (src === dest) {
      selfRedirects.push(src);
      continue;
    }

    // Trace path
    let curr = dest;
    const visited = [src];

    while (redirectMap.has(curr)) {
      if (visited.includes(curr)) {
        loops.push({ source: src, targets: [...visited, curr] });
        break;
      }
      visited.push(curr);
      curr = redirectMap.get(curr)!;
    }

    if (visited.length > 2 && !loops.some((l) => l.source === src)) {
      chains.push({
        originalSource: src,
        intermediate: visited[1],
        finalDestination: curr,
      });
    }
  }

  return {
    total: records.length,
    activeCount: activeRecords.length,
    chainsCount: chains.length,
    loopsCount: loops.length,
    selfRedirectsCount: selfRedirects.length,
    chains,
    loops,
    selfRedirects,
  };
}

/**
 * Removes a redirect record by source path
 */
export async function deleteRedirect(sourcePath: string): Promise<boolean> {
  try {
    const cleanPath = normalizeRedirectPath(sourcePath);
    const { error } = await supabase.from('redirects').delete().eq('source_path', cleanPath);
    return !error;
  } catch {
    return false;
  }
}


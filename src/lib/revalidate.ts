export async function triggerRevalidation() {
  try {
    if (typeof window !== 'undefined') {
      await fetch('/api/revalidate', { method: 'POST' }).catch(() => {});
    }
  } catch (err) {
    console.warn('Revalidation trigger notice:', err);
  }
}

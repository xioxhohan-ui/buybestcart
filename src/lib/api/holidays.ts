// Nager.Date Global Holiday API for Seasonal Shopping Campaigns
import { fetchWithCache } from './manager';

export interface ShoppingCampaign {
  eventName: string;
  date: string;
  tagline: string;
  badge: string;
  categoryFilter?: string;
}

export async function getUpcomingShoppingCampaigns(
  countryCode: string = 'US'
): Promise<ShoppingCampaign[]> {
  const currentYear = new Date().getFullYear();
  const cacheKey = `holidays_${countryCode}_${currentYear}`;

  return fetchWithCache<ShoppingCampaign[]>(
    cacheKey,
    async () => {
      try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode}`);
        if (!res.ok) throw new Error(`Nager.Date API HTTP ${res.status}`);
        const holidays = await res.json();

        const campaignKeywords: Record<string, { tagline: string; badge: string; category?: string }> = {
          'Black Friday': { tagline: 'Unbeatable Annual Tech & Appliance Flash Sales', badge: 'FLASHSALE', category: 'deals' },
          'Cyber Monday': { tagline: 'Lowest Prices of the Season on MacBooks & OLEDs', badge: 'CYBERDEALS', category: 'electronics' },
          'Christmas Day': { tagline: 'Top Gift Edit & Holiday Express Amazon Delivery', badge: 'HOLIDAYGIFTS', category: 'home-kitchen' },
          'New Year\'s Day': { tagline: 'New Year Health, Fitness & Productivity Edit', badge: 'NEWYEAR2026', category: 'sports' },
          'Labor Day': { tagline: 'End of Summer Home & Kitchen Clearout Sales', badge: 'SUMMEREND', category: 'outdoors' },
        };

        const activeCampaigns: ShoppingCampaign[] = [];

        if (Array.isArray(holidays)) {
          holidays.forEach((h: { name: string; date: string }) => {
            const meta = campaignKeywords[h.name];
            if (meta) {
              activeCampaigns.push({
                eventName: h.name,
                date: h.date,
                tagline: meta.tagline,
                badge: meta.badge,
                categoryFilter: meta.category,
              });
            }
          });
        }

        if (activeCampaigns.length === 0) {
          activeCampaigns.push(
            {
              eventName: '2026 Tech & Lifestyle Edit',
              date: new Date().toISOString().split('T')[0],
              tagline: '100% Verified Regional Amazon Pricing & Instant In-Stock Checks',
              badge: 'FEATURED',
              categoryFilter: 'electronics',
            },
            {
              eventName: 'Flagship Comparison Matrix',
              date: new Date().toISOString().split('T')[0],
              tagline: 'Side-by-Side Performance Scores, Pros, Cons & Value Rankings',
              badge: 'VERIFIED',
              categoryFilter: 'compare',
            }
          );
        }

        return activeCampaigns;
      } catch (err) {
        console.warn('Using default holiday campaign fallback:', err);
        return [
          {
            eventName: '2026 Tech & Lifestyle Edit',
            date: new Date().toISOString().split('T')[0],
            tagline: '100% Verified Regional Amazon Pricing & Instant In-Stock Checks',
            badge: 'FEATURED',
            categoryFilter: 'electronics',
          },
        ];
      }
    },
    1000 * 60 * 60 * 24 // 24-hour TTL
  );
}

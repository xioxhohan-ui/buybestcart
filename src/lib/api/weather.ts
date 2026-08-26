// Open-Meteo Weather Service for Weather-Based Seasonal Product Recommendations
import { fetchWithCache } from './manager';

export interface WeatherRecommendation {
  condition: string;
  temperatureC: number;
  temperatureF: number;
  recommendationTag: string;
  headline: string;
  suggestedCategories: string[];
}

export async function getWeatherRecommendations(
  lat: number = 40.7128,
  lon: number = -74.006
): Promise<WeatherRecommendation> {
  const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;

  return fetchWithCache<WeatherRecommendation>(
    cacheKey,
    async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Open-Meteo API HTTP ${res.status}`);
        const json = await res.json();
        const current = json.current_weather || {};
        const tempC = Math.round(current.temperature || 20);
        const tempF = Math.round((tempC * 9) / 5 + 32);
        const code = current.weathercode || 0;

        let condition = 'Clear & Pleasant';
        let headline = 'Sunny Day Outdoor & Mobility Deals';
        let recommendationTag = 'Outdoor & Travel';
        let suggestedCategories = ['outdoors', 'fitness', 'smart-home'];

        if (code >= 51 && code <= 67) {
          condition = 'Rain & Drizzle';
          headline = 'Rainy Day Waterproof Tech & Indoor Essentials';
          recommendationTag = 'Waterproof & Cozy';
          suggestedCategories = ['home-kitchen', 'electronics', 'beauty'];
        } else if (code >= 71 && code <= 86) {
          condition = 'Snow & Frost';
          headline = 'Cold Weather Heating & Smart Home Comfort';
          recommendationTag = 'Winter Warmth';
          suggestedCategories = ['home-kitchen', 'smart-home', 'health-wellness'];
        } else if (tempC > 28) {
          condition = 'Summer Heat';
          headline = 'High Temperature Cooling & Portable Hydration';
          recommendationTag = 'Summer Chill';
          suggestedCategories = ['outdoors', 'sports', 'beauty'];
        }

        return {
          condition,
          temperatureC: tempC,
          temperatureF: tempF,
          recommendationTag,
          headline,
          suggestedCategories,
        };
      } catch (err) {
        console.warn('Using default weather recommendation fallback:', err);
        return {
          condition: 'Seasonal Clear',
          temperatureC: 22,
          temperatureF: 72,
          recommendationTag: 'Featured Selection',
          headline: 'Top Rated Everyday Tech & Home Essentials',
          suggestedCategories: ['electronics', 'computers-laptops', 'gaming'],
        };
      }
    },
    1000 * 60 * 60 * 3 // 3-hour TTL
  );
}

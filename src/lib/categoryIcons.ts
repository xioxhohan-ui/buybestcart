import React from 'react';
import {
  Headphones,
  Laptop,
  Gamepad2,
  Cpu,
  Home,
  ShieldCheck,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Tent,
  Smartphone,
  Tv,
  Camera,
  Watch,
  Speaker,
  Layers,
  Folder,
  Tag,
  ShoppingBag,
  Zap,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; color?: string; className?: string; style?: React.CSSProperties }>> = {
  headphones: Headphones,
  audio: Headphones,
  laptop: Laptop,
  computers: Laptop,
  computer: Laptop,
  laptops: Laptop,
  gaming: Gamepad2,
  gamepad: Gamepad2,
  cpu: Cpu,
  electronics: Cpu,
  home: Home,
  kitchen: Home,
  shield: ShieldCheck,
  security: ShieldCheck,
  smarthome: ShieldCheck,
  'smart-home': ShieldCheck,
  sparkles: Sparkles,
  beauty: Sparkles,
  heart: HeartPulse,
  wellness: HeartPulse,
  health: HeartPulse,
  dumbbell: Dumbbell,
  fitness: Dumbbell,
  sports: Dumbbell,
  tent: Tent,
  outdoors: Tent,
  outdoor: Tent,
  smartphone: Smartphone,
  phone: Smartphone,
  mobile: Smartphone,
  tv: Tv,
  video: Tv,
  camera: Camera,
  photo: Camera,
  watch: Watch,
  wearables: Watch,
  speaker: Speaker,
  bag: ShoppingBag,
  tag: Tag,
  zap: Zap,
  folder: Folder,
  layers: Layers,
};

export function getCategoryIcon(
  iconKey?: string,
  slugOrName?: string
): React.ComponentType<{ size?: number | string; color?: string; className?: string; style?: React.CSSProperties }> {
  if (iconKey) {
    const cleanKey = iconKey.toLowerCase().trim();
    if (ICON_MAP[cleanKey]) {
      return ICON_MAP[cleanKey];
    }
  }

  if (slugOrName) {
    const cleanSlug = slugOrName.toLowerCase().trim();
    for (const [key, icon] of Object.entries(ICON_MAP)) {
      if (cleanSlug.includes(key)) {
        return icon;
      }
    }
  }

  return Layers;
}

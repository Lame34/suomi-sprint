import { createElement } from 'react';
import {
  Sliders,
  PawPrint,
  HeartPulse,
  Palette,
  Smile,
  Users,
  Utensils,
  HandMetal,
  Home,
  Hash,
  User,
  ShoppingBag,
  Calendar,
  Train,
  Compass,
  Zap,
  CloudSun,
  Briefcase,
  MessageCircle,
  Sun,
  MapPin,
  Siren,
  UtensilsCrossed,
  LifeBuoy,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

/**
 * Map from kebab-case icon names (stored in JSON data) to Lucide React components.
 */
const iconMap: Record<string, LucideIcon> = {
  sliders: Sliders,
  'paw-print': PawPrint,
  'heart-pulse': HeartPulse,
  palette: Palette,
  smile: Smile,
  users: Users,
  utensils: Utensils,
  'hand-metal': HandMetal,
  home: Home,
  hash: Hash,
  user: User,
  'shopping-bag': ShoppingBag,
  calendar: Calendar,
  train: Train,
  compass: Compass,
  zap: Zap,
  'cloud-sun': CloudSun,
  briefcase: Briefcase,
  'message-circle': MessageCircle,
  sun: Sun,
  'map-pin': MapPin,
  siren: Siren,
  'utensils-crossed': UtensilsCrossed,
  'life-buoy': LifeBuoy,
};

/**
 * Resolve a kebab-case icon name to a Lucide React component.
 * Falls back to BookOpen if the name is not found.
 */
export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? BookOpen;
}

/**
 * Static component that renders a dynamic icon by name.
 * Use this instead of calling getIcon() during render to satisfy
 * the react-hooks/static-components rule.
 */
export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const icon = iconMap[name] ?? BookOpen;
  return createElement(icon, { className });
}

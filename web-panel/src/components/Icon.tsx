import type { SVGProps } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock,
  Download,
  FileText,
  Filter,
  Globe2,
  Inbox,
  Laptop,
  LayoutDashboard,
  Leaf,
  List,
  LogOut,
  Map,
  MapPin,
  Menu,
  Music,
  Pencil,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Sparkles,
  Star,
  Tablet,
  Trash2,
  Tv,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  globe: Globe2,
  list: List,
  chart: BarChart3,
  leaf: Leaf,
  scan: ScanLine,
  qr: QrCode,
  location: MapPin,
  download: Download,
  search: Search,
  logout: LogOut,
  menu: Menu,
  bell: Bell,
  tv: Tv,
  tablet: Tablet,
  phone: Smartphone,
  music: Music,
  laptop: Laptop,
  snow: Snowflake,
  print: Printer,
  bolt: Zap,
  check: Check,
  checkCircle: CircleCheck,
  clock: Clock,
  alert: AlertTriangle,
  x: X,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  calendar: Calendar,
  building: Building2,
  users: Users,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  trash: Trash2,
  plus: Plus,
  edit: Pencil,
  refresh: RefreshCw,
  filter: Filter,
  map: Map,
  star: Star,
  file: FileText,
  inbox: Inbox,
  shield: ShieldCheck,
  sparkles: Sparkles,
};

type IconProps = {
  name: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
} & Omit<SVGProps<SVGSVGElement>, 'name' | 'color'>;

export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  color = 'currentColor',
  style,
  ...rest
}: IconProps) {
  const Glyph = ICONS[name] || Leaf;
  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

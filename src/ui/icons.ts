import {
  Activity,
  BookOpen,
  Bus,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code,
  GraduationCap,
  Heart,
  Home,
  ListTodo,
  Moon,
  MoreHorizontal,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Utensils,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const iconProps: { size: number; strokeWidth: number } = { size: 20, strokeWidth: 1.75 }

export const icons: Record<string, LucideIcon> = {
  // Domains
  book: BookOpen,
  code: Code,
  shield: Shield,
  moon: Moon,
  heart: Heart,
  home: Home,
  // Navigation
  sun: Sun,
  calendar: Calendar,
  tasks: ListTodo,
  more: MoreHorizontal,
  // Room kinds
  sleep: Moon,
  school: GraduationCap,
  travel: Bus,
  meal: Utensils,
  worship: Sparkles,
  // Misc
  streak: Activity,
  settings: Settings,
  plus: Plus,
  check: Check,
  close: X,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
}

export function iconFor(key: string): LucideIcon {
  return icons[key] ?? Activity
}

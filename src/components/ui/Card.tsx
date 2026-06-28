import { cn } from '@/lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/5 p-6', className)}>
      {children}
    </div>
  )
}

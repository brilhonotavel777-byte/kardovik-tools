import { cn } from '@/lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-sm',
        hover && [
          'transition-all duration-300',
          'hover:border-white/[0.14] hover:bg-slate-900',
          'hover:shadow-[0_0_40px_rgba(37,99,235,0.07)]',
        ],
        className,
      )}
    >
      {children}
    </div>
  )
}

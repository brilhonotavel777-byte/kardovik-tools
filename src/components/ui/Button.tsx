import { cn } from '@/lib/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]',
        'disabled:pointer-events-none disabled:opacity-40',
        variant === 'primary' && [
          'bg-blue-600 text-white',
          'hover:bg-blue-500 active:scale-[0.97]',
        ],
        variant === 'secondary' && [
          'border border-white/[0.1] bg-white/[0.04] text-slate-50',
          'hover:border-white/[0.18] hover:bg-white/[0.08]',
        ],
        variant === 'ghost' && [
          'text-slate-400',
          'hover:bg-white/[0.05] hover:text-slate-50',
        ],
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-5 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

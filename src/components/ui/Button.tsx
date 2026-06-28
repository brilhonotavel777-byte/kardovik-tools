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
        'inline-flex items-center justify-center rounded-full font-semibold transition-colors',
        variant === 'primary' && 'bg-cyan-400 text-black hover:bg-cyan-300',
        variant === 'secondary' && 'border border-white/20 text-white hover:bg-white/10',
        variant === 'ghost' && 'text-white hover:bg-white/10',
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3 text-base',
        size === 'lg' && 'px-8 py-4 text-lg',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

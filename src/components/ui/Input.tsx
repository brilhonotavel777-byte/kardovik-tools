import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'h-10 w-full rounded-xl border border-white/[0.08] bg-slate-900/60 px-4 text-sm text-slate-50',
          'placeholder:text-slate-500',
          'transition-all duration-200',
          'focus:border-blue-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

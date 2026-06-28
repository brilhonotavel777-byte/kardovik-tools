import { cn } from '@/lib/cn'
import { Container } from '@/components/layout/Container'

interface SectionProps {
  children: React.ReactNode
  id?: string
  className?: string
}

export function Section({ children, id, className }: SectionProps) {
  return (
    <section id={id} className={cn('py-16', className)}>
      <Container>{children}</Container>
    </section>
  )
}

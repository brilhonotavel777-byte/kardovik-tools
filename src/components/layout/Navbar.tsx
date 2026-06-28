import { APP_NAME } from '@/lib/constants'
import { Container } from '@/components/layout/Container'

export function Navbar() {
  return (
    <header className="border-b border-white/10 bg-black">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          <span className="font-bold text-white">{APP_NAME}</span>
        </nav>
      </Container>
    </header>
  )
}

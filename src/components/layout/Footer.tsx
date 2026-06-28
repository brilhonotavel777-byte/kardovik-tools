import { APP_NAME } from '@/lib/constants'
import { Container } from '@/components/layout/Container'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-8">
      <Container>
        <p className="text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </Container>
    </footer>
  )
}

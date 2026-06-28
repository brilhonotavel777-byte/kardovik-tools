import Link from 'next/link'
import { APP_NAME, APP_URL } from '@/lib/constants'
import { Container } from '@/components/layout/Container'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#020617]/80 backdrop-blur-xl">
      <Container>
        <nav
          aria-label="Navegação principal"
          className="flex h-16 items-center justify-between gap-6"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <span className="text-[11px] font-bold text-white">K</span>
            </div>
            <span className="text-sm font-semibold text-slate-50">{APP_NAME}</span>
          </Link>

          {/* Nav links — desktop only */}
          <div className="hidden flex-1 items-center gap-1 md:flex">
            <a
              href="#ferramentas"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-50"
            >
              Ferramentas
            </a>
            <a
              href={APP_URL}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-50"
            >
              Sobre
            </a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <a
              href={APP_URL}
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-50 md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Entrar
            </a>
            <a
              href="#ferramentas"
              className="inline-flex h-9 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
            >
              Começar agora
            </a>
          </div>
        </nav>
      </Container>
    </header>
  )
}

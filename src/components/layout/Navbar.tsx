import Link from 'next/link'
import { APP_NAME, APP_URL } from '@/lib/constants'
import { Container } from '@/components/layout/Container'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#020617]/85 backdrop-blur-xl">
      <Container>
        <nav
          aria-label="Navegação principal"
          className="flex h-[60px] items-center justify-between gap-6"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_16px_rgba(59,130,246,0.4)]">
              <span className="text-[13px] font-bold text-white">K</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-slate-50">
              {APP_NAME}
            </span>
          </Link>

          {/* Nav links — desktop only */}
          <div className="hidden flex-1 items-center gap-1 md:flex">
            <a
              href="#ferramentas"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors duration-200 hover:bg-white/[0.05] hover:text-slate-50"
            >
              Ferramentas
            </a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            {/* Secondary — Conhecer Kardovik, desktop only, opens in new tab */}
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-xl border border-white/[0.1] px-4 py-2 text-sm font-medium text-slate-400 transition-all duration-200 hover:border-white/[0.18] hover:text-slate-200 md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Conhecer Kardovik
            </a>

            {/* Primary CTA */}
            <a
              href="#ferramentas"
              className="inline-flex h-9 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(59,130,246,0)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.35)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
            >
              Começar agora
            </a>
          </div>
        </nav>
      </Container>
    </header>
  )
}

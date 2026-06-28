import Link from 'next/link'
import { APP_DESCRIPTION, APP_NAME, PRODUCT_LINKS, TOOLS } from '@/lib/constants'
import { Container } from '@/components/layout/Container'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#020617]">
      <Container>
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 py-14 md:grid-cols-3">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-cyan-500">
                <span className="text-[10px] font-bold text-white">K</span>
              </div>
              <span className="text-sm font-semibold text-slate-50">{APP_NAME}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
              {APP_DESCRIPTION}
            </p>
          </div>

          {/* Ferramentas — internal routes use Link */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">
              Ferramentas
            </h3>
            <ul className="space-y-3">
              {TOOLS.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={tool.href}
                    className="text-sm text-slate-400 transition-colors hover:text-slate-50"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Produto — external links use <a> */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">
              Produto
            </h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-slate-50"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-6 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Kardovik. Todos os direitos reservados.
          </p>
          <p className="text-xs text-slate-700">
            Feito com foco em odontologia inteligente.
          </p>
        </div>
      </Container>
    </footer>
  )
}

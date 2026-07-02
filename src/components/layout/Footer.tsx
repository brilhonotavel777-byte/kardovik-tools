import Link from 'next/link'
import { APP_DESCRIPTION, APP_NAME, APP_URL, TOOLS } from '@/lib/constants'
import { IconExternalLink } from '@/components/icons'
import { Container } from '@/components/layout/Container'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#020617]">
      <Container>
        <div className="grid grid-cols-1 gap-12 py-14 md:grid-cols-3">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_14px_rgba(59,130,246,0.35)]">
                <span className="text-[11px] font-bold text-white">K</span>
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-slate-50">
                {APP_NAME}
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
              {APP_DESCRIPTION}
            </p>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-600">
              Parte do ecossistema{' '}
              <a
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 underline-offset-2 transition-colors duration-200 hover:text-slate-300 hover:underline"
              >
                Kardovik
              </a>
              {' '}— soluções para clínicas odontológicas.
            </p>
          </div>

          {/* Ferramentas — internal routes use Link */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">
              Ferramentas
            </h3>
            <ul className="space-y-3">
              {TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="text-sm text-slate-400 transition-colors duration-200 hover:text-slate-50"
                  >
                    {tool.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kardovik — external, opens in new tab */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">
              Kardovik
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 transition-colors duration-200 hover:text-slate-50"
                >
                  Conheça o Kardovik Software
                </a>
              </li>
              <li>
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-600 transition-colors duration-200 hover:text-slate-400"
                >
                  www.kardovik.com.br
                  <IconExternalLink size={10} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-6 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Kardovik. Todos os direitos reservados.
          </p>
          <p className="text-xs text-slate-700">
            Kisten Tools é gratuito e sempre será.
          </p>
        </div>
      </Container>
    </footer>
  )
}

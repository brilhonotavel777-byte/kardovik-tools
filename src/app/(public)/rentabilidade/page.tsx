import { IconPieChart } from '@/components/icons'

export default function RentabilidadePage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="text-center">
        <div className="mb-6 inline-flex rounded-2xl bg-green-500/10 p-4">
          <IconPieChart className="text-green-400" size={32} />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
          Kardovik Tools
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Rentabilidade
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">
          O Kardovik Tools evolui continuamente. Novas ferramentas e recursos
          especializados serão disponibilizados regularmente para apoiar
          profissionais e estudantes de odontologia.
        </p>
      </div>
    </div>
  )
}

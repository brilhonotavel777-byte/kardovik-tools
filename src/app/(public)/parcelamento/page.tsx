import { IconCreditCard } from '@/components/icons'

export default function ParcelamentoPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="text-center">
        <div className="mb-6 inline-flex rounded-2xl bg-cyan-500/10 p-4">
          <IconCreditCard className="text-cyan-400" size={32} />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Kardovik Tools
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Parcelamento
        </h1>
        <p className="mt-4 text-slate-400">Em breve.</p>
      </div>
    </div>
  )
}

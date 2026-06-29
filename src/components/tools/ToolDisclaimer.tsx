export function ToolDisclaimer() {
  return (
    <aside
      aria-label="Aviso sobre estimativas"
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
    >
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600">
        Importante
      </p>
      <p className="text-sm leading-relaxed text-slate-500">
        Os resultados são estimativas baseadas nas informações fornecidas pelo usuário
        e têm finalidade educativa e de apoio à decisão. Não substituem orientação
        contábil, tributária ou jurídica quando aplicável.
      </p>
    </aside>
  )
}

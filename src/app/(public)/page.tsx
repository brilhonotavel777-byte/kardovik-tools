export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <section className="max-w-4xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-cyan-400">
          Kardovik Tools
        </p>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Ferramentas gratuitas para clínicas odontológicas,
          dentistas e estudantes.
        </h1>

        <p className="mt-6 text-lg text-zinc-300">
          Calculadoras inteligentes para ROI, parcelamento e rentabilidade de
          procedimentos odontológicos.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#ferramentas"
            className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-black hover:bg-cyan-300"
          >
            Ver ferramentas
          </a>

          <a
            href="https://kardovik.com"
            className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            Conhecer Kardovik
          </a>
        </div>

        <div
          id="ferramentas"
          className="mt-16 grid gap-4 md:grid-cols-3 text-left"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Calculadora de ROI</h2>
            <p className="mt-3 text-zinc-400">
              Simule retorno financeiro para campanhas e tratamentos.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Parcelamento</h2>
            <p className="mt-3 text-zinc-400">
              Calcule parcelas de tratamentos com clareza para o paciente.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold">Rentabilidade</h2>
            <p className="mt-3 text-zinc-400">
              Entenda margem, custo e lucro por procedimento.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

import type { Metadata } from 'next'
import { TOOL_PARCELAMENTO } from '@/lib/constants'
import { ToolPageShell } from '@/components/tools/ToolPageShell'
import { IconCreditCard } from '@/components/icons'
import { ParcelamentoSimulator } from '@/features/parcelamento/ParcelamentoSimulator'

const TITLE = 'Simulador de Parcelamento Odontológico — Kisten Tools'
const DESCRIPTION =
  'Simule parcelas, taxas e recebimento líquido para vender tratamentos odontológicos sem comprometer sua margem. Gratuito e sem cadastro.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/parcelamento',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/parcelamento',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function ParcelamentoPage() {
  return (
    <ToolPageShell
      title={TOOL_PARCELAMENTO.title}
      question={TOOL_PARCELAMENTO.question}
      description={TOOL_PARCELAMENTO.description}
      icon={IconCreditCard}
      iconColor="text-cyan-400"
      iconBg="bg-cyan-500/10"
      bulletBg="bg-cyan-400"
      accentText="text-cyan-400"
      accentBorder="border-cyan-500/20"
      accentBadgeBg="bg-cyan-500/[0.07]"
      glowRgba="rgba(6,182,212,0.07)"
      answers={TOOL_PARCELAMENTO.answers}
      interpretation={TOOL_PARCELAMENTO.interpretation}
      action={TOOL_PARCELAMENTO.action}
      calculatorSlot={<ParcelamentoSimulator />}
    />
  )
}

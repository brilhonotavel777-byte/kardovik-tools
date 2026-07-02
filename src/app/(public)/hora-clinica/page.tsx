import type { Metadata } from 'next'
import { TOOL_HORA_CLINICA } from '@/lib/constants'
import { ToolPageShell } from '@/components/tools/ToolPageShell'
import { IconClock } from '@/components/icons'
import { HoraClinicaSimulator } from '@/features/hora-clinica/HoraClinicaSimulator'

const TITLE = 'Calculadora de Hora Clínica — Kisten Tools'
const DESCRIPTION =
  'Descubra quanto custa cada hora de atendimento na sua clínica odontológica e entenda o impacto real do tempo ocioso. Gratuito e sem cadastro.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/hora-clinica',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/hora-clinica',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function HoraClinicaPage() {
  return (
    <ToolPageShell
      title={TOOL_HORA_CLINICA.title}
      question={TOOL_HORA_CLINICA.question}
      description={TOOL_HORA_CLINICA.description}
      icon={IconClock}
      iconColor="text-violet-400"
      iconBg="bg-violet-500/10"
      bulletBg="bg-violet-400"
      accentText="text-violet-400"
      accentBorder="border-violet-500/20"
      accentBadgeBg="bg-violet-500/[0.07]"
      glowRgba="rgba(139,92,246,0.07)"
      answers={TOOL_HORA_CLINICA.answers}
      interpretation={TOOL_HORA_CLINICA.interpretation}
      action={TOOL_HORA_CLINICA.action}
      calculatorSlot={<HoraClinicaSimulator />}
    />
  )
}

import { TOOL_TONE_LABEL, TOOL_TONE_STYLE } from '@/components/tools/tones'
import type { ToolTone } from '@/components/tools/tones'

interface ToolSectionBlockProps {
  title: string
  body: string
  tone: ToolTone
}

export function ToolSectionBlock({ title, body, tone }: ToolSectionBlockProps) {
  const style = TOOL_TONE_STYLE[tone]
  return (
    <div className={`rounded-xl border p-5 ${style.border} ${style.bg}`}>
      <div className="mb-2.5 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
        <span
          className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${style.textColor}`}
        >
          {TOOL_TONE_LABEL[tone]}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  )
}

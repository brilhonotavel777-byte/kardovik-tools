import type {
  RentabilidadeProcedimentoCalculationResult,
  RentabilidadeProcedimentoDiagnosticResult,
  RentabilidadeProcedimentoPlaybook,
  RentabilidadeProcedimentoPlaybookPriority,
  RentabilidadeProcedimentoPlaybookResult,
} from './types'

// ── Helpers ────────────────────────────────────────────────────────────

function getVariableCostWeight(c: RentabilidadeProcedimentoCalculationResult): number {
  return c.procedurePrice > 0 ? (c.procedureVariableCost / c.procedurePrice) * 100 : 0
}

function getProfitPerHourRatio(c: RentabilidadeProcedimentoCalculationResult): number {
  return c.hourlyClinicalCost > 0 ? c.profitPerHour / c.hourlyClinicalCost : 0
}

const PRIORITY_WEIGHT: Record<RentabilidadeProcedimentoPlaybookPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function deduplicateById(
  playbooks: RentabilidadeProcedimentoPlaybook[],
): RentabilidadeProcedimentoPlaybook[] {
  const seen = new Set<string>()
  return playbooks.filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

function sortByPriority(
  playbooks: RentabilidadeProcedimentoPlaybook[],
): RentabilidadeProcedimentoPlaybook[] {
  return [...playbooks].sort(
    (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
  )
}

// ── Definições dos playbooks ───────────────────────────────────────────

interface PlaybookDefinition {
  condition: (
    c: RentabilidadeProcedimentoCalculationResult,
    d: RentabilidadeProcedimentoDiagnosticResult,
  ) => boolean
  playbook: RentabilidadeProcedimentoPlaybook
}

const PLAYBOOK_DEFINITIONS: PlaybookDefinition[] = [

  // ═══ BASE (18) ════════════════════════════════════════════════════════

  // ─── 1. margem_saudavel ───────────────────────────────────────────────
  {
    condition: (c) => c.profitMarginPercent >= 35,
    playbook: {
      id: 'margem_saudavel',
      title: 'Margem de lucro saudável',
      subtitle: 'Acima de 35% — procedimento com boa rentabilidade líquida',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A margem líquida do procedimento está acima de 35%.',
      objective: 'Confirmar a solidez financeira do procedimento e usar como referência de precificação.',
      whyItMatters: 'Uma margem acima de 35% oferece boa capacidade de absorver variações de custo sem comprometer a rentabilidade.',
      recommendedAction: 'Manter a precificação atual e registrar este procedimento como referência de margem para o mix clínico.',
      expectedImpact: 'Previsibilidade financeira e base de comparação para outros procedimentos da tabela.',
      checklist: [
        'Registrar a margem atual como referência interna',
        'Monitorar variações nos custos de materiais',
        'Usar este procedimento como parâmetro ao avaliar novos serviços',
      ],
    },
  },

  // ─── 2. margem_adequada ───────────────────────────────────────────────
  {
    condition: (c) => c.profitMarginPercent >= 20 && c.profitMarginPercent < 35,
    playbook: {
      id: 'margem_adequada',
      title: 'Margem de lucro adequada',
      subtitle: 'Entre 20% e 35% — administrável com atenção',
      category: 'margin',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A margem líquida está entre 20% e 35%.',
      objective: 'Avaliar se há espaço para ampliar a margem sem comprometer o volume do procedimento.',
      whyItMatters: 'Com margem entre 20% e 35%, o procedimento é viável, mas pode ser sensível a aumentos de custo ou reduções de volume.',
      recommendedAction: 'Revisar os custos variáveis e verificar se o tempo clínico informado reflete a prática real.',
      expectedImpact: 'Potencial aumento de margem sem necessidade de reajuste imediato de preço.',
      checklist: [
        'Confirmar que o custo variável informado está atualizado',
        'Verificar se o tempo clínico reflete o real',
        'Calcular o impacto de reduzir o custo variável em 10%',
      ],
    },
  },

  // ─── 3. margem_pressionada ────────────────────────────────────────────
  {
    condition: (c) => c.profitMarginPercent >= 10 && c.profitMarginPercent < 20,
    playbook: {
      id: 'margem_pressionada',
      title: 'Margem de lucro pressionada',
      subtitle: 'Entre 10% e 20% — revisão necessária',
      category: 'margin',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'A margem líquida está entre 10% e 20%.',
      objective: 'Identificar os principais fatores de compressão de margem e agir antes que o procedimento se torne inviável.',
      whyItMatters: 'Com margem entre 10% e 20%, qualquer variação de custo ou tempo pode levar o procedimento abaixo do sustentável.',
      recommendedAction: 'Revisar custo variável, tempo clínico e avaliar reajuste de preço moderado.',
      expectedImpact: 'Ampliação da margem e redução do risco de tornar o procedimento deficitário.',
      checklist: [
        'Mapear os itens de maior peso no custo variável',
        'Verificar se o tempo clínico pode ser otimizado',
        'Calcular o preço necessário para atingir 25% de margem',
        'Avaliar reajuste gradual de preço',
      ],
    },
  },

  // ─── 4. margem_critica ────────────────────────────────────────────────
  {
    condition: (c) => c.profitMarginPercent < 10,
    playbook: {
      id: 'margem_critica',
      title: 'Margem de lucro crítica',
      subtitle: 'Abaixo de 10% — procedimento com baixa sustentabilidade',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'A margem líquida está abaixo de 10%.',
      objective: 'Reverter urgentemente a situação de margem crítica antes que o procedimento gere prejuízo sistemático.',
      whyItMatters: 'Com margem abaixo de 10%, o procedimento não oferece colchão suficiente para variações e pode gerar prejuízo real.',
      recommendedAction: 'Revisar imediatamente preço, custo variável e tempo clínico. Avaliar a manutenção do procedimento na tabela.',
      expectedImpact: 'Eliminação do risco de prejuízo e recuperação da viabilidade financeira.',
      checklist: [
        'Calcular o preço mínimo sustentável e o preço sugerido',
        'Identificar possibilidades de redução do custo variável',
        'Avaliar se o procedimento deve ser mantido ou suspenso',
        'Definir prazo para reajuste de preço',
        'Monitorar a margem mensalmente até estabilização',
      ],
    },
  },

  // ─── 5. rentabilidade_hora_saudavel ──────────────────────────────────
  {
    condition: (c) => getProfitPerHourRatio(c) >= 1,
    playbook: {
      id: 'rentabilidade_hora_saudavel',
      title: 'Rentabilidade por hora saudável',
      subtitle: 'Lucro por hora superior ao custo da hora clínica',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O lucro por hora clínica supera o custo da hora clínica informado.',
      objective: 'Confirmar que o uso do tempo clínico está gerando retorno adequado.',
      whyItMatters: 'Quando o lucro por hora supera o custo da hora, o procedimento está remunerando o tempo clínico com margem positiva.',
      recommendedAction: 'Manter o procedimento na tabela e avaliar se pode ser priorizado no mix para maximizar o uso do tempo clínico.',
      expectedImpact: 'Otimização do mix de procedimentos e maximização do retorno por hora de cadeira.',
      checklist: [
        'Registrar a rentabilidade por hora como referência',
        'Avaliar se o procedimento pode ser priorizado na agenda',
        'Comparar com outros procedimentos da tabela',
      ],
    },
  },

  // ─── 6. rentabilidade_hora_administravel ─────────────────────────────
  {
    condition: (c) => {
      const r = getProfitPerHourRatio(c)
      return r >= 0.5 && r < 1
    },
    playbook: {
      id: 'rentabilidade_hora_administravel',
      title: 'Rentabilidade por hora administrável',
      subtitle: 'Entre 50% e 100% do custo da hora clínica',
      category: 'profit',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O lucro por hora clínica está entre 50% e 100% do custo da hora informado.',
      objective: 'Ampliar a rentabilidade por hora reduzindo tempo clínico ou aumentando preço.',
      whyItMatters: 'A rentabilidade por hora está positiva mas abaixo do custo da hora, indicando que o tempo clínico não está sendo plenamente remunerado.',
      recommendedAction: 'Avaliar otimização do tempo clínico e possibilidade de reajuste de preço.',
      expectedImpact: 'Melhora da rentabilidade por hora e uso mais eficiente do tempo de cadeira.',
      checklist: [
        'Verificar se o tempo clínico informado pode ser reduzido com processos',
        'Calcular o impacto de um reajuste de preço de 10% na rentabilidade por hora',
        'Comparar a rentabilidade por hora com outros procedimentos',
      ],
    },
  },

  // ─── 7. rentabilidade_hora_baixa ─────────────────────────────────────
  {
    condition: (c) => {
      const r = getProfitPerHourRatio(c)
      return r >= 0 && r < 0.5
    },
    playbook: {
      id: 'rentabilidade_hora_baixa',
      title: 'Rentabilidade por hora baixa',
      subtitle: 'Abaixo de 50% do custo da hora clínica',
      category: 'time',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O lucro por hora clínica está abaixo de 50% do custo da hora informado.',
      objective: 'Identificar o que está comprimindo a rentabilidade por hora e agir antes que se torne negativa.',
      whyItMatters: 'Com rentabilidade por hora abaixo de 50% do custo, o procedimento remunera mal o tempo clínico e pode não justificar sua posição no mix.',
      recommendedAction: 'Revisar preço, reduzir custo variável ou otimizar o tempo clínico para ampliar o retorno por hora.',
      expectedImpact: 'Aumento do lucro por hora clínica e melhora da eficiência do tempo de cadeira.',
      checklist: [
        'Calcular quantos minutos podem ser reduzidos sem perda de qualidade',
        'Avaliar reajuste de preço com base no preço sugerido',
        'Identificar materiais que podem ser substituídos sem comprometer o resultado',
        'Verificar se o procedimento compete bem no mix em relação ao tempo utilizado',
      ],
    },
  },

  // ─── 8. rentabilidade_hora_negativa ──────────────────────────────────
  {
    condition: (c) => getProfitPerHourRatio(c) < 0,
    playbook: {
      id: 'rentabilidade_hora_negativa',
      title: 'Rentabilidade por hora negativa',
      subtitle: 'Procedimento gera prejuízo por hora clínica utilizada',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'O lucro por hora clínica é negativo — o procedimento gera prejuízo por hora de cadeira.',
      objective: 'Reverter urgentemente a condição de prejuízo por hora clínica.',
      whyItMatters: 'Cada hora investida neste procedimento gera perda financeira. Isso compromete o resultado do período proporcional ao volume executado.',
      recommendedAction: 'Suspender ou repreci­ficar urgentemente o procedimento. O preço atual está abaixo do custo total.',
      expectedImpact: 'Eliminação do prejuízo por hora e recuperação da eficiência do tempo de cadeira.',
      checklist: [
        'Calcular o prejuízo total gerado pelo volume mensal do procedimento',
        'Comparar o preço atual com o preço mínimo sustentável',
        'Avaliar suspensão temporária até reprecificação',
        'Definir novo preço com base no preço sugerido',
        'Comunicar o reajuste à equipe e pacientes',
      ],
    },
  },

  // ─── 9. custo_variavel_controlado ────────────────────────────────────
  {
    condition: (c) => getVariableCostWeight(c) <= 25,
    playbook: {
      id: 'custo_variavel_controlado',
      title: 'Custo variável controlado',
      subtitle: 'Até 25% do preço — estrutura de custo eficiente',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O custo variável representa até 25% do preço do procedimento.',
      objective: 'Confirmar que a estrutura de custo variável está bem dimensionada e usar como referência.',
      whyItMatters: 'Custo variável controlado preserva mais margem para cobrir o tempo clínico e gerar lucro.',
      recommendedAction: 'Manter o controle atual de custos variáveis e monitorar variações de fornecedores.',
      expectedImpact: 'Preservação da margem e maior resistência a variações externas de custo.',
      checklist: [
        'Registrar o peso do custo variável como referência',
        'Monitorar variações de preço de insumos',
        'Revisar este indicador ao negociar com fornecedores',
      ],
    },
  },

  // ─── 10. custo_variavel_administravel ────────────────────────────────
  {
    condition: (c) => {
      const w = getVariableCostWeight(c)
      return w > 25 && w <= 40
    },
    playbook: {
      id: 'custo_variavel_administravel',
      title: 'Custo variável administrável',
      subtitle: 'Entre 25% e 40% do preço — monitoramento necessário',
      category: 'costs',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O custo variável representa entre 25% e 40% do preço do procedimento.',
      objective: 'Monitorar o peso do custo variável e identificar oportunidades de redução.',
      whyItMatters: 'Com custo variável entre 25% e 40%, qualquer aumento nos insumos pode comprimir significativamente a margem.',
      recommendedAction: 'Acompanhar a evolução dos custos variáveis e negociar com fornecedores quando possível.',
      expectedImpact: 'Estabilidade da margem e menor vulnerabilidade a variações de custo.',
      checklist: [
        'Identificar os itens de maior peso no custo variável',
        'Verificar alternativas de fornecimento sem perda de qualidade',
        'Calcular o impacto de uma redução de 10% no custo variável',
      ],
    },
  },

  // ─── 11. custo_variavel_elevado ───────────────────────────────────────
  {
    condition: (c) => {
      const w = getVariableCostWeight(c)
      return w > 40 && w <= 60
    },
    playbook: {
      id: 'custo_variavel_elevado',
      title: 'Custo variável elevado',
      subtitle: 'Entre 40% e 60% do preço — pressão sobre a margem',
      category: 'costs',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O custo variável representa entre 40% e 60% do preço do procedimento.',
      objective: 'Reduzir o peso do custo variável para ampliar a margem disponível.',
      whyItMatters: 'Com custo variável acima de 40%, pouco sobra para cobrir o tempo clínico e gerar lucro. A margem fica estruturalmente pressionada.',
      recommendedAction: 'Auditar os insumos, buscar alternativas de menor custo e avaliar reajuste de preço.',
      expectedImpact: 'Redução do peso do custo variável e melhora da margem líquida.',
      checklist: [
        'Auditar cada item do custo variável do procedimento',
        'Negociar com fornecedores ou buscar alternativas equivalentes',
        'Avaliar reajuste de preço para compensar o custo elevado',
        'Calcular a nova margem após redução do custo variável em 15%',
      ],
    },
  },

  // ─── 12. custo_variavel_critico ───────────────────────────────────────
  {
    condition: (c) => getVariableCostWeight(c) > 60,
    playbook: {
      id: 'custo_variavel_critico',
      title: 'Custo variável crítico',
      subtitle: 'Acima de 60% do preço — comprometimento severo da margem',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'O custo variável representa mais de 60% do preço do procedimento.',
      objective: 'Reduzir urgentemente o peso do custo variável para viabilizar o procedimento.',
      whyItMatters: 'Com custo variável acima de 60%, menos de 40% do preço está disponível para cobrir o tempo clínico, custos fixos e gerar lucro. O procedimento é estruturalmente frágil.',
      recommendedAction: 'Revisar urgentemente insumos, fornecedores e preço. Considerar se o procedimento é viável no mix atual.',
      expectedImpact: 'Redução significativa do risco de prejuízo e melhora da estrutura financeira do procedimento.',
      checklist: [
        'Decompor o custo variável por item e identificar os mais relevantes',
        'Buscar fornecedores alternativos ou renegociar contratos',
        'Calcular o preço necessário para tornar o procedimento viável',
        'Avaliar suspensão até encontrar estrutura de custo viável',
        'Definir meta de custo variável máximo de 40% do preço',
      ],
    },
  },

  // ─── 13. roi_operacional_saudavel ────────────────────────────────────
  {
    condition: (c) => c.operationalRoiPercent >= 50,
    playbook: {
      id: 'roi_operacional_saudavel',
      title: 'ROI operacional saudável',
      subtitle: 'Retorno acima de 50% sobre o custo total',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O retorno operacional sobre o custo total está acima de 50%.',
      objective: 'Confirmar a eficiência operacional do procedimento e registrar como referência.',
      whyItMatters: 'Um ROI operacional acima de 50% indica que o procedimento gera retorno substancial sobre o investimento de custo.',
      recommendedAction: 'Manter a estrutura atual e usar este procedimento como benchmark de eficiência para o mix.',
      expectedImpact: 'Previsibilidade do retorno operacional e base para decisões de mix clínico.',
      checklist: [
        'Registrar o ROI como indicador de eficiência do procedimento',
        'Comparar com outros procedimentos da tabela',
        'Usar como referência ao avaliar novos procedimentos',
      ],
    },
  },

  // ─── 14. roi_operacional_adequado ────────────────────────────────────
  {
    condition: (c) => c.operationalRoiPercent >= 25 && c.operationalRoiPercent < 50,
    playbook: {
      id: 'roi_operacional_adequado',
      title: 'ROI operacional adequado',
      subtitle: 'Entre 25% e 50% — positivo e administrável',
      category: 'roi',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O retorno operacional sobre o custo total está entre 25% e 50%.',
      objective: 'Avaliar se há espaço para ampliar o ROI sem comprometer o volume do procedimento.',
      whyItMatters: 'ROI entre 25% e 50% é positivo mas pode ser ampliado com ajustes moderados de preço ou custo.',
      recommendedAction: 'Identificar o principal limitador do ROI — custo variável, tempo clínico ou preço — e agir no de maior impacto.',
      expectedImpact: 'Potencial ampliação do ROI com ajustes pontuais.',
      checklist: [
        'Identificar qual componente de custo tem maior peso no custo total',
        'Calcular o ROI após redução do custo variável em 10%',
        'Avaliar impacto de reajuste de preço no ROI',
      ],
    },
  },

  // ─── 15. roi_operacional_baixo ────────────────────────────────────────
  {
    condition: (c) => c.operationalRoiPercent >= 0 && c.operationalRoiPercent < 25,
    playbook: {
      id: 'roi_operacional_baixo',
      title: 'ROI operacional baixo',
      subtitle: 'Entre 0% e 25% — retorno pouco justificável',
      category: 'roi',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O retorno operacional sobre o custo total está entre 0% e 25%.',
      objective: 'Ampliar o ROI antes que o procedimento passe a operar com retorno negativo.',
      whyItMatters: 'Com ROI entre 0% e 25%, o procedimento retorna pouco sobre o custo total e qualquer variação pode torná-lo deficitário.',
      recommendedAction: 'Revisar custo variável e preço para ampliar o retorno operacional.',
      expectedImpact: 'Melhora do ROI e maior sustentabilidade financeira do procedimento.',
      checklist: [
        'Calcular a estrutura de custo que resultaria em ROI de 30%',
        'Identificar o ajuste de preço necessário para atingir ROI de 30%',
        'Avaliar redução de custo variável como alternativa ao reajuste',
        'Definir prazo para ação corretiva',
      ],
    },
  },

  // ─── 16. roi_operacional_negativo ────────────────────────────────────
  {
    condition: (c) => c.operationalRoiPercent < 0,
    playbook: {
      id: 'roi_operacional_negativo',
      title: 'ROI operacional negativo',
      subtitle: 'O procedimento apresenta retorno negativo sobre o custo total',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'O retorno operacional sobre o custo total é negativo.',
      objective: 'Reverter o ROI negativo reestruturando preço, custo ou tempo do procedimento.',
      whyItMatters: 'ROI negativo significa que o procedimento está gerando prejuízo operacional real. Cada execução aumenta o deficit.',
      recommendedAction: 'Repreci­ficar urgentemente o procedimento com base no preço mínimo sustentável e no preço sugerido.',
      expectedImpact: 'Eliminação do prejuízo operacional e recuperação do retorno sobre o custo.',
      checklist: [
        'Calcular o prejuízo total gerado no último período',
        'Comparar o preço atual com o preço mínimo sustentável',
        'Definir novo preço com base no preço sugerido',
        'Avaliar possibilidade de redução do custo variável',
        'Estabelecer data de vigência do novo preço',
      ],
    },
  },

  // ─── 17. margem_meta_atingida ────────────────────────────────────────
  {
    condition: (c) => c.marginGapPercent >= 0,
    playbook: {
      id: 'margem_meta_atingida',
      title: 'Margem desejada atingida',
      subtitle: 'O procedimento supera ou atinge a meta de margem informada',
      category: 'standardization',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A margem atual está acima ou igual à margem desejada informada.',
      objective: 'Confirmar que a meta de margem está sendo atingida e registrar como referência.',
      whyItMatters: 'Atingir a margem desejada confirma que o preço e a estrutura de custo estão alinhados com o objetivo financeiro definido.',
      recommendedAction: 'Manter o preço e a estrutura de custo atuais. Revisar periodicamente para garantir que a meta continue sendo atingida.',
      expectedImpact: 'Previsibilidade financeira e confirmação do alinhamento com a meta de rentabilidade.',
      checklist: [
        'Registrar a margem atual como referência de acompanhamento',
        'Monitorar o gap de margem ao longo do tempo',
        'Revisitar a meta de margem anualmente',
      ],
    },
  },

  // ─── 18. margem_meta_distante ────────────────────────────────────────
  {
    condition: (c) => c.marginGapPercent < 0,
    playbook: {
      id: 'margem_meta_distante',
      title: 'Margem abaixo da meta desejada',
      subtitle: 'O preço atual não atinge a margem informada',
      category: 'pricing',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'A margem atual está abaixo da margem desejada informada.',
      objective: 'Definir as ações necessárias para atingir a meta de margem por meio de reajuste de preço ou redução de custo.',
      whyItMatters: 'Operar abaixo da meta de margem significa que o procedimento não está gerando o retorno esperado na estrutura atual.',
      recommendedAction: 'Avaliar o preço sugerido calculado e definir prazo para adequação.',
      expectedImpact: 'Alinhamento do preço com a meta de margem e melhora do retorno financeiro do procedimento.',
      checklist: [
        'Verificar o preço sugerido e o ajuste necessário',
        'Avaliar se é possível reduzir custos antes de reajustar preço',
        'Definir cronograma de reajuste gradual se necessário',
        'Calcular a nova margem após o ajuste planejado',
      ],
    },
  },

  // ═══ COMPOSTOS (8) ════════════════════════════════════════════════════

  // ─── 19. margem_baixa_mais_custo_alto ────────────────────────────────
  {
    condition: (c) => c.profitMarginPercent < 20 && getVariableCostWeight(c) > 40,
    playbook: {
      id: 'margem_baixa_mais_custo_alto',
      title: 'Margem baixa com custo variável elevado',
      subtitle: 'Dois fatores de compressão simultâneos — risco alto',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'A margem está abaixo de 20% e o custo variável representa mais de 40% do preço.',
      objective: 'Resolver simultaneamente a pressão de margem e o peso elevado do custo variável.',
      whyItMatters: 'Margem baixa com custo variável alto é a combinação mais difícil de reverter: o custo consome a receita antes do tempo clínico e dos custos fixos.',
      recommendedAction: 'Priorizar a redução do custo variável como ponto de maior alavancagem, seguida de reajuste de preço.',
      expectedImpact: 'Redução do peso do custo variável e ampliação da margem por duas vias simultâneas.',
      checklist: [
        'Decompor o custo variável e identificar os maiores componentes',
        'Calcular o impacto de reduzir o custo variável em 20% na margem',
        'Avaliar reajuste de preço após auditoria de custos',
        'Definir meta de margem mínima de 25%',
      ],
    },
  },

  // ─── 20. lucro_negativo_mais_tempo_alto ──────────────────────────────
  {
    condition: (c) => c.netProfit < 0 && c.procedureDurationMinutes > 60,
    playbook: {
      id: 'lucro_negativo_mais_tempo_alto',
      title: 'Prejuízo com tempo clínico elevado',
      subtitle: 'Procedimento longo gerando prejuízo — impacto amplificado',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'O procedimento gera prejuízo líquido e tem duração superior a 60 minutos.',
      objective: 'Reverter o prejuízo em procedimento de alto consumo de tempo clínico.',
      whyItMatters: 'Procedimentos longos com prejuízo têm custo de oportunidade ainda maior: cada hora de cadeira usada neste procedimento custa mais do que gera.',
      recommendedAction: 'Avaliar urgentemente o preço mínimo sustentável e o impacto de otimizar o tempo clínico.',
      expectedImpact: 'Eliminação do prejuízo e recuperação do custo de oportunidade do tempo de cadeira.',
      checklist: [
        'Calcular o prejuízo total gerado por volume mensal',
        'Verificar se o tempo pode ser reduzido sem perda de qualidade',
        'Calcular o novo preço mínimo sustentável',
        'Avaliar suspensão do procedimento até reprecificação',
        'Definir cronograma de ação corretiva',
      ],
    },
  },

  // ─── 21. preco_baixo_mais_margem_desejada_alta ───────────────────────
  {
    condition: (c) => c.priceAdjustmentNeeded > 0 && c.desiredProfitMarginPercent >= 30,
    playbook: {
      id: 'preco_baixo_mais_margem_desejada_alta',
      title: 'Preço insuficiente para a meta de margem desejada',
      subtitle: 'Reajuste necessário para atingir a margem alvo',
      category: 'pricing',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O preço atual está abaixo do preço sugerido e a margem desejada é de 30% ou mais.',
      objective: 'Definir o reajuste de preço necessário para atingir a margem desejada.',
      whyItMatters: 'Com meta de margem de 30% ou mais e preço atual insuficiente, o procedimento está operando abaixo da expectativa financeira do gestor.',
      recommendedAction: 'Implementar o reajuste de preço indicado, de forma gradual se necessário, com base no preço sugerido calculado.',
      expectedImpact: 'Alinhamento do preço com a meta de margem e melhora do retorno do procedimento.',
      checklist: [
        'Verificar o valor exato do ajuste necessário',
        'Avaliar reajuste gradual em 2 ou 3 etapas',
        'Comunicar o reajuste à equipe com antecedência',
        'Recalcular a margem após o reajuste planejado',
      ],
    },
  },

  // ─── 22. custo_variavel_alto_mais_roi_baixo ──────────────────────────
  {
    condition: (c) => getVariableCostWeight(c) > 40 && c.operationalRoiPercent < 25,
    playbook: {
      id: 'custo_variavel_alto_mais_roi_baixo',
      title: 'Custo variável alto com ROI operacional baixo',
      subtitle: 'Custo elevado comprimindo o retorno — dupla pressão',
      category: 'costs',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O custo variável representa mais de 40% do preço e o ROI operacional está abaixo de 25%.',
      objective: 'Reduzir o custo variável como ponto de maior alavancagem para ampliar o ROI.',
      whyItMatters: 'Custo variável alto com ROI baixo indica que os insumos estão consumindo boa parte da receita, limitando o retorno operacional.',
      recommendedAction: 'Auditar e reduzir custo variável antes de considerar reajuste de preço.',
      expectedImpact: 'Melhora do ROI operacional e redução da vulnerabilidade a variações de insumo.',
      checklist: [
        'Auditar cada item do custo variável por custo unitário',
        'Buscar alternativas de fornecimento para os 2 maiores itens',
        'Calcular o ROI esperado após redução de custo variável',
        'Avaliar reajuste de preço como medida complementar',
      ],
    },
  },

  // ─── 23. procedimento_inviavel_sem_reajuste ───────────────────────────
  {
    condition: (c) => c.netProfit < 0 || c.totalCost >= c.procedurePrice,
    playbook: {
      id: 'procedimento_inviavel_sem_reajuste',
      title: 'Procedimento inviável sem reajuste imediato',
      subtitle: 'O preço atual não cobre o custo total — prejuízo estrutural',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'O lucro líquido é negativo ou o custo total é maior ou igual ao preço do procedimento.',
      objective: 'Reverter urgentemente a condição de inviabilidade financeira do procedimento.',
      whyItMatters: 'Quando o preço não cobre o custo total, cada execução do procedimento gera um deficit real. Não há margem positiva a ser gerenciada.',
      recommendedAction: 'Repreci­ficar imediatamente com base no preço mínimo sustentável calculado. Não aguardar o próximo ciclo de revisão.',
      expectedImpact: 'Eliminação do prejuízo estrutural e recuperação da viabilidade financeira do procedimento.',
      checklist: [
        'Identificar qual componente de custo tornou o procedimento inviável',
        'Aplicar o preço mínimo sustentável imediatamente',
        'Definir prazo para atingir o preço sugerido com margem desejada',
        'Avaliar se há possibilidade de redução de custo paralela ao reajuste',
        'Monitorar a margem após a reprecificação',
      ],
    },
  },

  // ─── 24. procedimento_saudavel_para_escala ───────────────────────────
  {
    condition: (_c, d) =>
      d.status === 'excellent' || d.status === 'healthy',
    playbook: {
      id: 'procedimento_saudavel_para_escala',
      title: 'Procedimento saudável — potencial de escala',
      subtitle: 'Bom momento para priorizar no mix clínico',
      category: 'standardization',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O diagnóstico geral do procedimento é excelente ou saudável.',
      objective: 'Documentar os parâmetros atuais como referência e avaliar priorização no mix clínico.',
      whyItMatters: 'Procedimentos com boa rentabilidade e ROI são os melhores candidatos a receber mais slots na agenda para maximizar o resultado.',
      recommendedAction: 'Registrar os parâmetros atuais e avaliar se o procedimento pode receber mais espaço na agenda.',
      expectedImpact: 'Maximização do resultado financeiro por meio de mix clínico orientado por rentabilidade.',
      checklist: [
        'Registrar os indicadores atuais: margem, ROI, rentabilidade por hora',
        'Avaliar a participação atual do procedimento no volume mensal',
        'Definir meta de volume para o próximo período',
        'Comparar com outros procedimentos da tabela',
      ],
    },
  },

  // ─── 25. tempo_alto_mais_profit_por_hora_baixo ───────────────────────
  {
    condition: (c) =>
      c.procedureDurationMinutes > 60 && getProfitPerHourRatio(c) < 0.5,
    playbook: {
      id: 'tempo_alto_mais_profit_por_hora_baixo',
      title: 'Procedimento longo com baixa rentabilidade por hora',
      subtitle: 'Tempo elevado e pouco retorno por hora — revisão estratégica',
      category: 'time',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O procedimento tem duração superior a 60 minutos e rentabilidade por hora abaixo de 50% do custo da hora clínica.',
      objective: 'Avaliar se o tempo clínico pode ser reduzido ou se o preço precisa ser reajustado para compensar a duração.',
      whyItMatters: 'Procedimentos longos com baixa rentabilidade por hora ocupam tempo valioso de cadeira com retorno insuficiente.',
      recommendedAction: 'Avaliar otimização do tempo clínico e calcular o preço necessário para justificar a duração atual.',
      expectedImpact: 'Melhora do retorno por hora e uso mais eficiente do tempo de cadeira.',
      checklist: [
        'Verificar se o tempo pode ser reduzido com ajustes de protocolo',
        'Calcular a rentabilidade por hora com o tempo reduzido',
        'Avaliar o preço necessário para rentabilidade por hora de 100% do custo clínico',
        'Comparar com outros procedimentos de duração similar',
      ],
    },
  },

  // ─── 26. reprecificacao_prioritaria ──────────────────────────────────
  {
    condition: (c) => c.priceAdjustmentNeeded > 0 && c.marginGapPercent < -10,
    playbook: {
      id: 'reprecificacao_prioritaria',
      title: 'Reprecificação prioritária',
      subtitle: 'Gap de margem relevante exige reajuste estruturado',
      category: 'pricing',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O preço atual está abaixo do sugerido e a margem está mais de 10 pontos percentuais abaixo da meta desejada.',
      objective: 'Implementar reajuste de preço estruturado para recuperar a margem e alinhar com a meta financeira.',
      whyItMatters: 'Com gap de margem acima de 10 pontos e preço abaixo do sugerido, o procedimento está operando significativamente abaixo do potencial financeiro.',
      recommendedAction: 'Implementar o reajuste indicado pelo preço sugerido, em etapas se necessário, para minimizar impacto no volume.',
      expectedImpact: 'Recuperação da margem e alinhamento do procedimento com a meta financeira definida.',
      checklist: [
        'Confirmar o valor exato do ajuste necessário',
        'Definir se o reajuste será imediato ou escalonado',
        'Comunicar o reajuste com antecedência mínima de 30 dias',
        'Monitorar o impacto no volume após o reajuste',
        'Recalcular a margem após cada etapa de reajuste',
      ],
    },
  },
]

// ── Função principal ───────────────────────────────────────────────────

export function getRentabilidadeProcedimentoPlaybooks(
  calculation: RentabilidadeProcedimentoCalculationResult,
  diagnostic: RentabilidadeProcedimentoDiagnosticResult,
): RentabilidadeProcedimentoPlaybookResult {
  const applicable = PLAYBOOK_DEFINITIONS.filter(({ condition }) =>
    condition(calculation, diagnostic),
  ).map(({ playbook }) => playbook)

  const deduplicated = deduplicateById(applicable)

  return { playbooks: sortByPriority(deduplicated) }
}

import type {
  PontoEquilibrioCalculationResult,
  PontoEquilibrioDiagnosticResult,
  PontoEquilibrioPlaybook,
  PontoEquilibrioPlaybookPriority,
  PontoEquilibrioPlaybookResult,
} from './types'

// ── Helpers ────────────────────────────────────────────────────────────

function getFixedCostTicketRatio(c: PontoEquilibrioCalculationResult): number {
  return c.monthlyFixedCosts / c.averageTicket
}

function hasCurrentRevenue(c: PontoEquilibrioCalculationResult): boolean {
  return c.currentMonthlyRevenue !== undefined
}

const PRIORITY_WEIGHT: Record<PontoEquilibrioPlaybookPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function sortByPriority(playbooks: PontoEquilibrioPlaybook[]): PontoEquilibrioPlaybook[] {
  return [...playbooks].sort(
    (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
  )
}

function deduplicateById(playbooks: PontoEquilibrioPlaybook[]): PontoEquilibrioPlaybook[] {
  const seen = new Set<string>()
  return playbooks.filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

// ── Definições dos playbooks ───────────────────────────────────────────

interface PlaybookDefinition {
  condition: (
    c: PontoEquilibrioCalculationResult,
    d: PontoEquilibrioDiagnosticResult,
  ) => boolean
  playbook: PontoEquilibrioPlaybook
}

const PLAYBOOK_DEFINITIONS: PlaybookDefinition[] = [
  // ═══ BASE (18) ════════════════════════════════════════════════════════

  // ─── 1. margem_contribuicao_saudavel ──────────────────────────────────
  {
    condition: (c) => c.contributionMarginPercent >= 75,
    playbook: {
      id: 'margem_contribuicao_saudavel',
      title: 'Margem de contribuição saudável',
      subtitle: 'Acima de 75% — excelente capacidade para cobrir custos fixos',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A margem de contribuição está acima de 75%.',
      objective: 'Confirmar a solidez da margem e usar como referência de precificação.',
      whyItMatters:
        'Uma margem alta permite absorver custos fixos com menor volume de atendimentos, dando mais flexibilidade operacional.',
      recommendedAction:
        'Manter a estrutura de preços e custos variáveis atual, revisando periodicamente o mix de procedimentos.',
      expectedImpact:
        'Ponto de equilíbrio mais baixo e maior capacidade de gerar lucro com o volume atual.',
      checklist: [
        'Registrar a margem atual como referência de precificação',
        'Monitorar qualquer aumento nos custos variáveis',
        'Usar esta margem como base ao avaliar novos procedimentos',
      ],
    },
  },

  // ─── 2. margem_contribuicao_adequada ─────────────────────────────────
  {
    condition: (c) =>
      c.contributionMarginPercent >= 60 && c.contributionMarginPercent < 75,
    playbook: {
      id: 'margem_contribuicao_adequada',
      title: 'Margem de contribuição adequada',
      subtitle: 'Entre 60% e 75% — administrável, mas com espaço para melhora',
      category: 'margin',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A margem de contribuição está entre 60% e 75%.',
      objective:
        'Avaliar se é possível ampliar a margem reduzindo custos variáveis ou ajustando preços.',
      whyItMatters:
        'Com margem entre 60% e 75%, a clínica precisa de volume moderado para atingir o equilíbrio. Elevar a margem reduziria essa exigência.',
      recommendedAction:
        'Revisar os principais custos variáveis e verificar se há possibilidade de reprecificação de procedimentos.',
      expectedImpact:
        'Redução do ponto de equilíbrio e aumento da margem de segurança operacional.',
      checklist: [
        'Mapear os itens de maior peso no custo variável',
        'Avaliar oportunidade de reajuste de preços em procedimentos-chave',
        'Comparar o mix atual com procedimentos de maior margem',
      ],
    },
  },

  // ─── 3. margem_contribuicao_pressionada ──────────────────────────────
  {
    condition: (c) =>
      c.contributionMarginPercent >= 40 && c.contributionMarginPercent < 60,
    playbook: {
      id: 'margem_contribuicao_pressionada',
      title: 'Margem de contribuição pressionada',
      subtitle: 'Entre 40% e 60% — exige revisão de custos e preços',
      category: 'margin',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'A margem de contribuição está entre 40% e 60%.',
      objective:
        'Elevar a margem de contribuição para reduzir a pressão sobre o volume necessário.',
      whyItMatters:
        'Com margem abaixo de 60%, o ponto de equilíbrio exige volume elevado. Qualquer queda no faturamento tem impacto direto e relevante.',
      recommendedAction:
        'Revisar preços, negociar custos variáveis e avaliar o mix de procedimentos para aumentar a margem.',
      expectedImpact:
        'Redução do volume necessário para empatar e melhora da sustentabilidade financeira.',
      checklist: [
        'Identificar os procedimentos com menor margem de contribuição individual',
        'Negociar com fornecedores para reduzir custos de materiais',
        'Avaliar reajuste de preços nos procedimentos mais frequentes',
        'Calcular o impacto de elevar a margem em 5 pontos percentuais',
      ],
    },
  },

  // ─── 4. margem_contribuicao_critica ──────────────────────────────────
  {
    condition: (c) => c.contributionMarginPercent < 40,
    playbook: {
      id: 'margem_contribuicao_critica',
      title: 'Margem de contribuição crítica',
      subtitle: 'Abaixo de 40% — sustentabilidade financeira comprometida',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'A margem de contribuição está abaixo de 40%.',
      objective:
        'Elevar urgentemente a margem revisando preços, custos variáveis e mix de procedimentos.',
      whyItMatters:
        'Com menos de 40% de margem, a clínica precisa de volume muito alto para se sustentar, tornando a operação vulnerável a qualquer variação de demanda.',
      recommendedAction:
        'Revisar imediatamente a estrutura de preços e custos variáveis. Priorizar procedimentos com maior margem.',
      expectedImpact:
        'Redução significativa do ponto de equilíbrio e melhora urgente da rentabilidade.',
      checklist: [
        'Mapear os custos variáveis por procedimento',
        'Identificar procedimentos deficitários e avaliar sua continuidade',
        'Revisar tabela de preços com foco em procedimentos de alta margem',
        'Negociar custos de materiais e insumos com fornecedores',
        'Definir prazo e meta de margem a atingir',
      ],
    },
  },

  // ─── 5. volume_equilibrio_confortavel ────────────────────────────────
  {
    condition: (c) => c.breakEvenProcedures <= 80,
    playbook: {
      id: 'volume_equilibrio_confortavel',
      title: 'Volume para equilíbrio confortável',
      subtitle: 'Até 80 procedimentos/mês — operacionalmente viável',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O número de procedimentos para atingir o equilíbrio é de até 80 por mês.',
      objective:
        'Confirmar que o volume mínimo necessário é operacionalmente confortável.',
      whyItMatters:
        'Um volume de equilíbrio baixo dá à clínica maior flexibilidade para períodos de menor demanda sem risco de prejuízo.',
      recommendedAction:
        'Manter a estrutura atual e usar o volume de equilíbrio como meta mínima de acompanhamento mensal.',
      expectedImpact:
        'Operação resiliente mesmo em meses de menor demanda.',
      checklist: [
        'Registrar o volume de equilíbrio como meta mínima mensal',
        'Monitorar mensalmente o número real de procedimentos realizados',
        'Usar como base para calcular a meta de crescimento',
      ],
    },
  },

  // ─── 6. volume_equilibrio_administravel ──────────────────────────────
  {
    condition: (c) =>
      c.breakEvenProcedures > 80 && c.breakEvenProcedures <= 140,
    playbook: {
      id: 'volume_equilibrio_administravel',
      title: 'Volume para equilíbrio administrável',
      subtitle: 'Entre 80 e 140 procedimentos/mês — exige boa gestão de agenda',
      category: 'volume',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O volume necessário para o equilíbrio é entre 80 e 140 procedimentos/mês.',
      objective:
        'Garantir que a agenda seja gerida para atingir e superar o volume de equilíbrio consistentemente.',
      whyItMatters:
        'Com 80 a 140 procedimentos necessários, a clínica depende de uma agenda bem preenchida. Quedas de demanda têm impacto direto no resultado.',
      recommendedAction:
        'Acompanhar o volume mensal e implementar ações de agenda para garantir o atingimento do mínimo.',
      expectedImpact:
        'Previsibilidade do resultado mensal e redução do risco operacional.',
      checklist: [
        'Definir meta semanal de procedimentos com base no volume de equilíbrio',
        'Monitorar o percentual de agenda preenchida semanalmente',
        'Criar estratégia de reativação de pacientes para meses de menor demanda',
      ],
    },
  },

  // ─── 7. volume_equilibrio_elevado ─────────────────────────────────────
  {
    condition: (c) =>
      c.breakEvenProcedures > 140 && c.breakEvenProcedures <= 220,
    playbook: {
      id: 'volume_equilibrio_elevado',
      title: 'Volume para equilíbrio elevado',
      subtitle: 'Entre 140 e 220 procedimentos/mês — pressão comercial relevante',
      category: 'volume',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O volume necessário para o equilíbrio é entre 140 e 220 procedimentos/mês.',
      objective:
        'Reduzir o volume necessário para o equilíbrio ou garantir consistentemente esse volume.',
      whyItMatters:
        'Exigir mais de 140 procedimentos por mês para empatar coloca pressão relevante sobre agenda, equipe e captação.',
      recommendedAction:
        'Agir em duas frentes: aumentar o ticket médio para reduzir o volume necessário e ampliar a captação para garantir o volume.',
      expectedImpact:
        'Redução da pressão operacional e maior resiliência financeira.',
      checklist: [
        'Calcular o impacto de elevar o ticket médio em 10% no volume necessário',
        'Avaliar estratégias de captação para garantir o volume mínimo',
        'Revisar custos fixos para reduzir o ponto de equilíbrio',
        'Definir meta semanal e acompanhar o volume em tempo real',
      ],
    },
  },

  // ─── 8. volume_equilibrio_critico ─────────────────────────────────────
  {
    condition: (c) => c.breakEvenProcedures > 220,
    playbook: {
      id: 'volume_equilibrio_critico',
      title: 'Volume para equilíbrio crítico',
      subtitle: 'Mais de 220 procedimentos/mês — estrutura incompatível com a operação',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'O volume necessário para atingir o equilíbrio supera 220 procedimentos/mês.',
      objective:
        'Reestruturar a operação para reduzir urgentemente o volume mínimo necessário.',
      whyItMatters:
        'Mais de 220 procedimentos mensais para apenas empatar indica que a estrutura de custos e/ou ticket é incompatível com a operação.',
      recommendedAction:
        'Revisar urgentemente custos fixos, ticket médio e margem de contribuição. Reestruturar o modelo financeiro.',
      expectedImpact:
        'Redução do ponto de equilíbrio e melhora da viabilidade da operação.',
      checklist: [
        'Mapear e cortar custos fixos desnecessários',
        'Revisar tabela de preços com foco em aumento de ticket',
        'Avaliar o mix de procedimentos para priorizar os de maior margem',
        'Verificar se a estrutura atual é compatível com a capacidade operacional',
        'Definir um plano de ação com prazo para reduzir o breakeven',
      ],
    },
  },

  // ─── 9. faturamento_sem_comparacao ───────────────────────────────────
  {
    condition: (c) => !hasCurrentRevenue(c),
    playbook: {
      id: 'faturamento_sem_comparacao',
      title: 'Sem faturamento atual para comparação',
      subtitle: 'Informe o faturamento atual para diagnóstico completo',
      category: 'standardization',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'low',
      trigger: 'O faturamento mensal atual não foi informado.',
      objective:
        'Orientar sobre a importância de informar o faturamento atual para diagnóstico completo.',
      whyItMatters:
        'Sem o faturamento atual, não é possível saber se a clínica está acima ou abaixo do ponto de equilíbrio.',
      recommendedAction:
        'Informar o faturamento médio mensal atual na próxima simulação para obter comparação com o ponto de equilíbrio.',
      expectedImpact:
        'Diagnóstico completo com margem de segurança e gap financeiro calculados.',
      checklist: [
        'Levantar o faturamento médio dos últimos 3 meses',
        'Inserir o faturamento atual na próxima simulação',
        'Usar o ponto de equilíbrio calculado como referência mínima de meta',
      ],
    },
  },

  // ─── 10. faturamento_acima_equilibrio ────────────────────────────────
  {
    condition: (c) =>
      c.revenueGapPercent !== undefined && c.revenueGapPercent >= 25,
    playbook: {
      id: 'faturamento_acima_equilibrio',
      title: 'Faturamento com boa folga acima do equilíbrio',
      subtitle: 'Mais de 25% acima do breakeven — operação com margem de segurança',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O faturamento atual está mais de 25% acima do ponto de equilíbrio.',
      objective:
        'Confirmar a solidez da operação e usar como referência para metas de crescimento.',
      whyItMatters:
        'Uma folga de mais de 25% acima do equilíbrio indica que a clínica tem colchão financeiro para absorver variações sem entrar em prejuízo.',
      recommendedAction:
        'Manter o nível de faturamento atual e definir metas de crescimento com base no gap positivo.',
      expectedImpact:
        'Manutenção da saúde financeira e base para planejamento de expansão.',
      checklist: [
        'Documentar o gap atual como indicador de saúde mensal',
        'Definir meta de gap mínimo de 20% para os próximos meses',
        'Usar a folga para investir em melhorias operacionais ou captação',
      ],
    },
  },

  // ─── 11. faturamento_acima_minimo ─────────────────────────────────────
  {
    condition: (c) =>
      c.revenueGapPercent !== undefined &&
      c.revenueGapPercent >= 0 &&
      c.revenueGapPercent < 25,
    playbook: {
      id: 'faturamento_acima_minimo',
      title: 'Faturamento acima do equilíbrio, mas com folga estreita',
      subtitle: 'Entre 0% e 25% acima do breakeven — zona de atenção',
      category: 'revenue',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O faturamento atual está entre 0% e 25% acima do ponto de equilíbrio.',
      objective:
        'Ampliar a folga acima do ponto de equilíbrio para aumentar a resiliência financeira.',
      whyItMatters:
        'Com folga abaixo de 25%, qualquer queda de demanda pode rapidamente levar a operação abaixo do ponto de equilíbrio.',
      recommendedAction:
        'Implementar ações para ampliar o faturamento ou reduzir o ponto de equilíbrio nos próximos meses.',
      expectedImpact:
        'Aumento da margem de segurança e maior resiliência operacional.',
      checklist: [
        'Calcular quanto o faturamento pode cair antes de atingir o breakeven',
        'Implementar uma ação de captação ou retenção de pacientes',
        'Avaliar redução de custos fixos para diminuir o ponto de equilíbrio',
        'Monitorar o gap mensalmente como indicador de saúde',
      ],
    },
  },

  // ─── 12. faturamento_abaixo_equilibrio ───────────────────────────────
  {
    condition: (c) =>
      c.revenueGapPercent !== undefined &&
      c.revenueGapPercent < 0 &&
      c.revenueGapPercent >= -20,
    playbook: {
      id: 'faturamento_abaixo_equilibrio',
      title: 'Faturamento abaixo do ponto de equilíbrio',
      subtitle: 'Entre 0% e 20% abaixo do breakeven — ação necessária',
      category: 'revenue',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O faturamento atual está entre 0% e 20% abaixo do ponto de equilíbrio.',
      objective:
        'Elevar o faturamento acima do ponto de equilíbrio no menor prazo possível.',
      whyItMatters:
        'Operar abaixo do ponto de equilíbrio significa prejuízo mensal. Cada mês nessa condição consome o caixa da clínica.',
      recommendedAction:
        'Tomar ações imediatas de captação, reativação de pacientes e revisão de custos para reverter o deficit.',
      expectedImpact:
        'Eliminação do prejuízo mensal e recuperação da sustentabilidade operacional.',
      checklist: [
        'Calcular o valor exato do deficit mensal atual',
        'Identificar ações de captação de resultado rápido',
        'Revisar custos fixos para reduzir o ponto de equilíbrio',
        'Definir prazo e meta de faturamento para superação do breakeven',
        'Acompanhar semanalmente a evolução do faturamento',
      ],
    },
  },

  // ─── 13. faturamento_criticamente_abaixo ─────────────────────────────
  {
    condition: (c) =>
      c.revenueGapPercent !== undefined && c.revenueGapPercent < -20,
    playbook: {
      id: 'faturamento_criticamente_abaixo',
      title: 'Faturamento criticamente abaixo do equilíbrio',
      subtitle: 'Mais de 20% abaixo do breakeven — risco financeiro imediato',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'O faturamento atual está mais de 20% abaixo do ponto de equilíbrio.',
      objective:
        'Reverter urgentemente a situação de prejuízo relevante antes que comprometa o caixa.',
      whyItMatters:
        'Estar mais de 20% abaixo do breakeven indica prejuízo operacional relevante. Sem reversão rápida, a operação pode entrar em crise de caixa.',
      recommendedAction:
        'Reestruturar urgentemente custos e faturamento. Considerar redução de custos fixos enquanto implementa captação acelerada.',
      expectedImpact:
        'Redução do prejuízo e início da recuperação financeira da clínica.',
      checklist: [
        'Fazer o levantamento do caixa disponível e do tempo de sustentação',
        'Identificar e eliminar custos fixos não essenciais imediatamente',
        'Lançar campanha de captação e reativação de pacientes',
        'Revisar preços e mix de procedimentos para aumentar ticket e margem',
        'Definir plano de ação semanal com acompanhamento do faturamento',
      ],
    },
  },

  // ─── 14. margem_seguranca_saudavel ───────────────────────────────────
  {
    condition: (c) =>
      c.safetyMarginPercent !== undefined && c.safetyMarginPercent >= 20,
    playbook: {
      id: 'margem_seguranca_saudavel',
      title: 'Margem de segurança saudável',
      subtitle: 'Acima de 20% — boa folga financeira operacional',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'A margem de segurança está acima de 20% do faturamento atual.',
      objective:
        'Confirmar que a clínica opera com boa folga e usar como referência para decisões de crescimento.',
      whyItMatters:
        'Uma margem de segurança acima de 20% significa que o faturamento pode cair até 20% antes de atingir o ponto de equilíbrio.',
      recommendedAction:
        'Manter a gestão atual e considerar usar a folga para investimentos ou expansão controlada.',
      expectedImpact:
        'Operação resiliente e base sólida para crescimento sustentável.',
      checklist: [
        'Documentar a margem de segurança como indicador mensal de saúde',
        'Definir meta de não deixar a margem cair abaixo de 15%',
        'Avaliar oportunidades de crescimento com base na folga disponível',
      ],
    },
  },

  // ─── 15. margem_seguranca_moderada ───────────────────────────────────
  {
    condition: (c) =>
      c.safetyMarginPercent !== undefined &&
      c.safetyMarginPercent >= 5 &&
      c.safetyMarginPercent < 20,
    playbook: {
      id: 'margem_seguranca_moderada',
      title: 'Margem de segurança moderada',
      subtitle: 'Entre 5% e 20% — sensível a variações de demanda',
      category: 'strategy',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A margem de segurança está entre 5% e 20% do faturamento atual.',
      objective:
        'Ampliar a margem de segurança para reduzir a vulnerabilidade a quedas de faturamento.',
      whyItMatters:
        'Com margem entre 5% e 20%, uma queda de demanda de apenas 10% pode colocar a operação no limite do equilíbrio.',
      recommendedAction:
        'Implementar ações de retenção e captação para ampliar a folga antes que o cenário piore.',
      expectedImpact:
        'Maior resiliência operacional e menor risco em períodos de menor demanda.',
      checklist: [
        'Monitorar a margem de segurança mensalmente',
        'Implementar ações de reativação de pacientes para elevar faturamento',
        'Avaliar redução de custos fixos para baixar o ponto de equilíbrio',
        'Definir meta de margem de segurança de ao menos 20%',
      ],
    },
  },

  // ─── 16. margem_seguranca_estreita ───────────────────────────────────
  {
    condition: (c) =>
      c.safetyMarginPercent !== undefined &&
      c.safetyMarginPercent >= 0 &&
      c.safetyMarginPercent < 5,
    playbook: {
      id: 'margem_seguranca_estreita',
      title: 'Margem de segurança muito estreita',
      subtitle: 'Entre 0% e 5% — qualquer variação pode gerar prejuízo',
      category: 'strategy',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'A margem de segurança está entre 0% e 5% do faturamento atual.',
      objective:
        'Ampliar urgentemente a margem de segurança para proteger a operação de variações.',
      whyItMatters:
        'Com menos de 5% de margem, qualquer cancelamento, feriado ou queda de demanda leva a operação ao prejuízo.',
      recommendedAction:
        'Agir imediatamente para elevar o faturamento ou reduzir o ponto de equilíbrio.',
      expectedImpact:
        'Redução do risco operacional e criação de folga financeira mínima.',
      checklist: [
        'Identificar ações de resultado rápido para elevar o faturamento',
        'Revisar custos fixos e eliminar os desnecessários',
        'Calcular quanto o faturamento pode cair antes de atingir prejuízo',
        'Definir meta de margem de segurança de ao menos 15% em 90 dias',
        'Acompanhar o faturamento semanalmente',
      ],
    },
  },

  // ─── 17. custo_fixo_pesado_ticket ────────────────────────────────────
  {
    condition: (c) => {
      const r = getFixedCostTicketRatio(c)
      return r > 140 && r <= 220
    },
    playbook: {
      id: 'custo_fixo_pesado_ticket',
      title: 'Custo fixo pesado em relação ao ticket',
      subtitle: 'Razão entre 140 e 220 — pressão sobre o volume necessário',
      category: 'costs',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'A razão entre custo fixo e ticket médio está entre 140 e 220.',
      objective:
        'Reduzir a pressão sobre o volume necessário aumentando o ticket ou reduzindo custos fixos.',
      whyItMatters:
        'Quando os custos fixos equivalem a mais de 140 vezes o ticket, a clínica precisa de alto volume para empatar.',
      recommendedAction:
        'Revisar preços para elevar o ticket médio e avaliar cortes em custos fixos de menor impacto.',
      expectedImpact:
        'Redução do ponto de equilíbrio em procedimentos e menor pressão operacional.',
      checklist: [
        'Calcular o impacto de elevar o ticket médio em R$50 no volume necessário',
        'Mapear custos fixos que podem ser reduzidos sem impacto na operação',
        'Avaliar o mix de procedimentos para priorizar os de maior ticket',
        'Verificar possibilidade de renegociação de contratos fixos',
      ],
    },
  },

  // ─── 18. custo_fixo_critico_ticket ───────────────────────────────────
  {
    condition: (c) => getFixedCostTicketRatio(c) > 220,
    playbook: {
      id: 'custo_fixo_critico_ticket',
      title: 'Custo fixo crítico em relação ao ticket',
      subtitle: 'Razão acima de 220 — desequilíbrio estrutural grave',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'A razão entre custo fixo e ticket médio está acima de 220.',
      objective:
        'Reestruturar a relação entre custo fixo e ticket para tornar o ponto de equilíbrio operacionalmente viável.',
      whyItMatters:
        'Com essa razão, o volume necessário para empatar tende a ultrapassar a capacidade operacional da clínica.',
      recommendedAction:
        'Agir em duas frentes: redução de custos fixos e aumento do ticket médio. Ambas são necessárias simultaneamente.',
      expectedImpact:
        'Redução significativa do ponto de equilíbrio e melhora da viabilidade financeira.',
      checklist: [
        'Auditar todos os custos fixos e identificar os de menor valor agregado',
        'Definir meta de corte de custos fixos de ao menos 15%',
        'Revisar tabela de preços com foco em aumento de ticket',
        'Avaliar a composição do mix de procedimentos',
        'Calcular o novo ponto de equilíbrio após cortes e reajustes',
      ],
    },
  },

  // ═══ COMPOSTOS (8) ════════════════════════════════════════════════════

  // ─── 19. margem_baixa_mais_volume_alto ───────────────────────────────
  {
    condition: (c) =>
      c.contributionMarginPercent < 60 && c.breakEvenProcedures > 140,
    playbook: {
      id: 'margem_baixa_mais_volume_alto',
      title: 'Margem baixa combinada com alto volume necessário',
      subtitle: 'Dois fatores de pressão simultâneos — risco elevado',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'A margem de contribuição está abaixo de 60% e o volume necessário para o equilíbrio supera 140 procedimentos.',
      objective:
        'Resolver simultaneamente a compressão de margem e o alto volume exigido.',
      whyItMatters:
        'Margem baixa com alto volume necessário é a combinação mais perigosa: qualquer queda de demanda tem impacto amplificado.',
      recommendedAction:
        'Priorizar o aumento do ticket médio (melhora margem e reduz volume) e revisar custos variáveis.',
      expectedImpact:
        'Redução do ponto de equilíbrio por duas vias simultâneas.',
      checklist: [
        'Revisar o ticket médio e identificar procedimentos com maior margem',
        'Mapear e reduzir custos variáveis desnecessários',
        'Calcular o impacto de elevar o ticket em 15% e a margem em 5 pontos',
        'Definir plano de ação com prazos para cada melhoria',
      ],
    },
  },

  // ─── 20. faturamento_baixo_mais_margem_baixa ─────────────────────────
  {
    condition: (c) =>
      c.revenueGapPercent !== undefined &&
      c.revenueGapPercent < 0 &&
      c.contributionMarginPercent < 60,
    playbook: {
      id: 'faturamento_baixo_mais_margem_baixa',
      title: 'Faturamento abaixo do equilíbrio com margem baixa',
      subtitle: 'Prejuízo operacional agravado por baixa margem',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'O faturamento está abaixo do ponto de equilíbrio e a margem de contribuição está abaixo de 60%.',
      objective:
        'Reverter o prejuízo de forma estruturada, atuando simultaneamente em margem e faturamento.',
      whyItMatters:
        'Prejuízo com margem baixa é especialmente difícil de reverter apenas com aumento de volume. É necessário elevar a margem primeiro.',
      recommendedAction:
        'Priorizar aumento de ticket e margem antes de ampliar volume. A combinação é mais eficiente que apenas buscar mais atendimentos.',
      expectedImpact:
        'Reversão do prejuízo com base mais sustentável de margem.',
      checklist: [
        'Identificar os procedimentos de maior margem e priorizá-los na agenda',
        'Avaliar reajuste imediato de preços em procedimentos mais frequentes',
        'Revisar custos variáveis para elevar a margem de contribuição',
        'Definir meta de faturamento mínimo para os próximos 30 dias',
        'Acompanhar semanalmente margem e faturamento',
      ],
    },
  },

  // ─── 21. custo_fixo_alto_mais_ticket_baixo ───────────────────────────
  {
    condition: (c) => {
      const r = getFixedCostTicketRatio(c)
      return r > 220 && c.breakEvenProcedures > 220
    },
    playbook: {
      id: 'custo_fixo_alto_mais_ticket_baixo',
      title: 'Custo fixo alto com ticket baixo e alto volume necessário',
      subtitle: 'Desequilíbrio estrutural triplo — reestruturação urgente',
      category: 'costs',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'A razão custo fixo/ticket está acima de 220 e o volume necessário para empatar também supera 220 procedimentos.',
      objective:
        'Reestruturar a base financeira da operação de forma urgente e abrangente.',
      whyItMatters:
        'Essa combinação indica que o modelo financeiro atual pode não ser viável sem mudanças estruturais significativas.',
      recommendedAction:
        'Revisar simultaneamente custos fixos, ticket médio e mix de procedimentos. Nenhuma ação isolada é suficiente.',
      expectedImpact:
        'Redução do ponto de equilíbrio e melhora da viabilidade operacional de forma abrangente.',
      checklist: [
        'Realizar revisão completa da estrutura de custos fixos',
        'Revisar tabela de preços de todos os procedimentos',
        'Avaliar o modelo operacional atual para identificar ineficiências',
        'Definir cenário-alvo com breakeven abaixo de 150 procedimentos',
        'Criar plano de 90 dias com metas mensais de redução',
      ],
    },
  },

  // ─── 22. meta_lucro_aumenta_pressao ──────────────────────────────────
  {
    condition: (c) =>
      c.desiredMonthlyProfit > 0 &&
      c.targetRevenue > c.breakEvenRevenue * 1.25,
    playbook: {
      id: 'meta_lucro_aumenta_pressao',
      title: 'Meta de lucro amplia significativamente a receita necessária',
      subtitle: 'Receita alvo mais de 25% acima do breakeven — pressão adicional',
      category: 'pricing',
      priority: 'high',
      urgency: 'medium',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'A receita necessária para atingir a meta de lucro está mais de 25% acima do ponto de equilíbrio.',
      objective:
        'Avaliar se a meta de lucro é realista e qual a estratégia mais eficiente para atingi-la.',
      whyItMatters:
        'Quando a meta de lucro exige receita muito acima do breakeven, a clínica precisa de estratégia clara para não depender apenas de volume.',
      recommendedAction:
        'Combinar aumento de ticket médio com captação de novos pacientes para atingir a receita alvo sem depender apenas de volume.',
      expectedImpact:
        'Maior probabilidade de atingir a meta de lucro com abordagem diversificada.',
      checklist: [
        'Calcular quantos procedimentos adicionais seriam necessários acima do breakeven',
        'Avaliar se o aumento de ticket pode reduzir o número de procedimentos necessários',
        'Definir estratégia mista de ticket e volume para atingir a meta',
        'Monitorar a receita alvo mensalmente',
      ],
    },
  },

  // ─── 23. operacao_saudavel_para_padronizar ────────────────────────────
  {
    condition: (_c, d) =>
      d.status === 'excellent' || d.status === 'healthy',
    playbook: {
      id: 'operacao_saudavel_para_padronizar',
      title: 'Operação saudável — use como referência',
      subtitle: 'Diagnóstico positivo — bom momento para padronizar e crescer',
      category: 'standardization',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O diagnóstico geral do ponto de equilíbrio é excelente ou saudável.',
      objective:
        'Documentar os parâmetros atuais como referência interna e planejar crescimento sustentável.',
      whyItMatters:
        'Momentos de saúde financeira são ideais para padronizar processos e criar metas com base em dados reais.',
      recommendedAction:
        'Registrar os parâmetros atuais (margem, ticket, custos) como benchmark interno e usá-los para definir metas de crescimento.',
      expectedImpact:
        'Base sólida para crescimento planejado e previsibilidade financeira.',
      checklist: [
        'Documentar os parâmetros atuais: margem, ticket, custos e ponto de equilíbrio',
        'Definir meta de manutenção dos indicadores atuais',
        'Planejar crescimento com base no excedente acima do breakeven',
        'Revisitar os parâmetros trimestralmente',
      ],
    },
  },

  // ─── 24. oportunidade_meta_diaria ────────────────────────────────────
  {
    condition: (c) => c.dailyBreakEvenRevenue > 0,
    playbook: {
      id: 'oportunidade_meta_diaria',
      title: 'Definir meta diária de faturamento',
      subtitle: 'Use o breakeven diário como referência de produtividade',
      category: 'operations',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O ponto de equilíbrio pode ser convertido em meta diária de faturamento.',
      objective:
        'Transformar o ponto de equilíbrio mensal em uma referência operacional diária.',
      whyItMatters:
        'Metas diárias são mais fáceis de acompanhar e permitem correções rápidas antes que um mês deficitário se consolide.',
      recommendedAction:
        'Comunicar a meta diária de faturamento para a equipe e acompanhar semanalmente a evolução.',
      expectedImpact:
        'Maior controle operacional e reações mais rápidas a desvios de faturamento.',
      checklist: [
        'Informar a equipe sobre a meta diária de faturamento',
        'Acompanhar o faturamento semanal em relação à meta diária × dias trabalhados',
        'Criar alerta quando o faturamento acumulado estiver abaixo da projeção',
      ],
    },
  },

  // ─── 25. reestruturacao_do_ponto_equilibrio ───────────────────────────
  {
    condition: (_c, d) => d.status === 'critical',
    playbook: {
      id: 'reestruturacao_do_ponto_equilibrio',
      title: 'Reestruturação urgente do ponto de equilíbrio',
      subtitle: 'Diagnóstico crítico — ação imediata necessária',
      category: 'strategy',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'O diagnóstico geral do ponto de equilíbrio é crítico.',
      objective:
        'Reverter a condição crítica reestruturando os fundamentos financeiros da operação.',
      whyItMatters:
        'Situação crítica significa que a operação está em risco e não pode continuar sem mudanças estruturais.',
      recommendedAction:
        'Iniciar imediatamente um plano de reestruturação cobrindo custos, preços, margem e faturamento.',
      expectedImpact:
        'Reversão da condição crítica e recuperação da viabilidade financeira.',
      checklist: [
        'Fazer levantamento completo de caixa disponível',
        'Identificar e eliminar custos fixos não essenciais imediatamente',
        'Revisar tabela de preços e mix de procedimentos',
        'Implementar ações de captação de resultado rápido',
        'Definir marcos semanais de acompanhamento do plano de recuperação',
      ],
    },
  },

  // ─── 26. aumento_ticket_para_reduzir_volume ───────────────────────────
  {
    condition: (c) => c.breakEvenProcedures > 140,
    playbook: {
      id: 'aumento_ticket_para_reduzir_volume',
      title: 'Aumentar ticket médio para reduzir volume necessário',
      subtitle: 'Estratégia de eficiência: menos atendimentos com maior retorno',
      category: 'pricing',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O volume necessário para atingir o equilíbrio supera 140 procedimentos.',
      objective:
        'Reduzir o número de procedimentos necessários para empatar aumentando o ticket médio.',
      whyItMatters:
        'Elevar o ticket médio é mais eficiente que buscar volume: cada R$1 de aumento no ticket reduz o número de atendimentos necessários.',
      recommendedAction:
        'Avaliar reprecificação de procedimentos, inclusão de serviços complementares e foco em procedimentos de maior valor.',
      expectedImpact:
        'Redução do ponto de equilíbrio em número de procedimentos sem necessidade de ampliar a agenda.',
      checklist: [
        'Calcular o impacto de elevar o ticket em 10%, 15% e 20% no volume necessário',
        'Identificar procedimentos que podem ser reprecificados',
        'Avaliar inclusão de produtos ou serviços complementares por atendimento',
        'Verificar qual é o perfil de procedimentos da carteira atual',
        'Definir meta de ticket médio e acompanhar mensalmente',
      ],
    },
  },
]

// ── Função principal ───────────────────────────────────────────────────

export function getPontoEquilibrioPlaybooks(
  calculation: PontoEquilibrioCalculationResult,
  diagnostic: PontoEquilibrioDiagnosticResult,
): PontoEquilibrioPlaybookResult {
  const applicable = PLAYBOOK_DEFINITIONS.filter(({ condition }) =>
    condition(calculation, diagnostic),
  ).map(({ playbook }) => playbook)

  const deduplicated = deduplicateById(applicable)

  return { playbooks: sortByPriority(deduplicated) }
}

import type {
  HoraClinicaCalculationResult,
  HoraClinicaDiagnosticResult,
  HoraClinicaPlaybook,
  HoraClinicaPlaybookPriority,
  HoraClinicaPlaybookResult,
} from './types'

// ── Helpers ────────────────────────────────────────────────────────────

function getIdleCostRatio(c: HoraClinicaCalculationResult): number {
  return c.totalMonthlyCost > 0 ? c.idleHoursCost / c.totalMonthlyCost : 0
}

const PRIORITY_WEIGHT: Record<HoraClinicaPlaybookPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function sortByPriority(playbooks: HoraClinicaPlaybook[]): HoraClinicaPlaybook[] {
  return [...playbooks].sort(
    (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
  )
}

function deduplicateById(playbooks: HoraClinicaPlaybook[]): HoraClinicaPlaybook[] {
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
    c: HoraClinicaCalculationResult,
    d: HoraClinicaDiagnosticResult,
  ) => boolean
  playbook: HoraClinicaPlaybook
}

const PLAYBOOK_DEFINITIONS: PlaybookDefinition[] = [
  // ═══ PLAYBOOKS BASE ═══════════════════════════════════════════════════

  // ─── 1. ocupacao_alta_saudavel ────────────────────────────────────────
  {
    condition: (c) => c.occupancyRatePercent >= 80,
    playbook: {
      id: 'ocupacao_alta_saudavel',
      title: 'Agenda bem ocupada',
      subtitle: 'Ocupação acima de 80% — excelente aproveitamento da capacidade',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A taxa de ocupação da agenda está acima de 80%.',
      objective: 'Confirmar que a agenda está bem aproveitada e usar esse cenário como referência.',
      whyItMatters:
        'Alta ocupação distribui os custos fixos sobre mais horas produtivas, reduzindo o custo por hora e aumentando a rentabilidade da operação.',
      recommendedAction:
        'Manter a estratégia atual e monitorar para evitar sobrecarga e queda na qualidade do atendimento.',
      expectedImpact:
        'Custo da hora clínica sustentável e maior capacidade de faturamento mensal.',
      checklist: [
        'Confirmar que a ocupação não está causando sobrecarga para a equipe',
        'Monitorar taxa de cancelamentos e faltas',
        'Revisar periodicamente se o intervalo entre consultas é adequado',
        'Usar este cenário como referência para novas metas de agenda',
      ],
    },
  },

  // ─── 2. ocupacao_saudavel_com_melhoria ───────────────────────────────
  {
    condition: (c) => c.occupancyRatePercent >= 65 && c.occupancyRatePercent < 80,
    playbook: {
      id: 'ocupacao_saudavel_com_melhoria',
      title: 'Ocupação saudável com espaço para crescer',
      subtitle: 'Ocupação entre 65% e 80% — boa base, mas com margem de melhoria',
      category: 'occupancy',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'medium',
      financialImpactLevel: 'medium',
      trigger: 'A taxa de ocupação está entre 65% e 80%.',
      objective:
        'Aumentar gradualmente a ocupação para reduzir o custo da hora clínica.',
      whyItMatters:
        'Cada hora produtiva adicional dilui os custos fixos sobre mais atendimentos, reduzindo o custo unitário e melhorando a margem.',
      recommendedAction:
        'Implementar ações de captação, reativação de pacientes e melhoria na confirmação de consultas.',
      expectedImpact:
        'Redução do custo da hora clínica e aumento do faturamento potencial sem acréscimo de custos fixos.',
      checklist: [
        'Mapear horários e dias com maior ociosidade',
        'Criar estratégia de reativação de pacientes inativos',
        'Avaliar política de confirmação de consultas por mensagem ou ligação',
        'Analisar se o mix de procedimentos permite encaixar mais atendimentos',
      ],
    },
  },

  // ─── 3. ocupacao_pressionada ──────────────────────────────────────────
  {
    condition: (c) => c.occupancyRatePercent >= 50 && c.occupancyRatePercent < 65,
    playbook: {
      id: 'ocupacao_pressionada',
      title: 'Ocupação pressionada',
      subtitle: 'Ocupação entre 50% e 65% — custo da hora clínica elevado',
      category: 'occupancy',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'A taxa de ocupação da agenda está entre 50% e 65%.',
      objective:
        'Identificar e corrigir as causas da baixa ocupação para reduzir o custo da hora.',
      whyItMatters:
        'Com menos de 65% de ocupação, os custos fixos são distribuídos sobre poucas horas, elevando o custo por atendimento e pressionando os preços.',
      recommendedAction:
        'Revisar estratégia comercial, fluxo de agendamento e ações de marketing para ampliar a base de pacientes ativos.',
      expectedImpact:
        'Redução relevante do custo da hora clínica e melhora da margem operacional.',
      checklist: [
        'Analisar o motivo dos cancelamentos e ausências',
        'Revisar a política de confirmação de consultas',
        'Avaliar estratégias de marketing local ou digital',
        'Verificar se o horário de atendimento está alinhado com a demanda dos pacientes',
        'Considerar convênios ou parcerias para ampliar a captação',
      ],
    },
  },

  // ─── 4. ocupacao_critica ──────────────────────────────────────────────
  {
    condition: (c) => c.occupancyRatePercent < 50,
    playbook: {
      id: 'ocupacao_critica',
      title: 'Ocupação crítica — intervenção necessária',
      subtitle: 'Menos de 50% da agenda preenchida — risco financeiro relevante',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'A taxa de ocupação está abaixo de 50%.',
      objective:
        'Reverter urgentemente a baixa ocupação para evitar comprometer a sustentabilidade financeira.',
      whyItMatters:
        'Abaixo de 50%, os custos fixos são diluídos em poucas horas, tornando o custo da hora clínica muito elevado e dificultando qualquer precificação competitiva.',
      recommendedAction:
        'Tomar ações imediatas de captação, reativação e revisão da estratégia comercial antes de continuar operando nesse nível.',
      expectedImpact:
        'Aumento da ocupação e redução significativa do custo da hora clínica.',
      checklist: [
        'Mapear a taxa de ocupação por turno e dia da semana',
        'Contatar ativamente pacientes inativos nos últimos 6 meses',
        'Revisar precificação para verificar se está competitiva no mercado local',
        'Avaliar estratégias de marketing de curto prazo',
        'Considerar redução temporária de horas disponíveis para concentrar a demanda',
      ],
    },
  },

  // ─── 5. custo_hora_controlado ─────────────────────────────────────────
  {
    condition: (c) => c.clinicalHourCost <= 250,
    playbook: {
      id: 'custo_hora_controlado',
      title: 'Custo da hora clínica controlado',
      subtitle: 'Abaixo de R$250/h — estrutura financeira eficiente',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O custo da hora clínica está abaixo de R$250.',
      objective:
        'Confirmar que a estrutura de custos é eficiente e usar como referência de precificação.',
      whyItMatters:
        'Um custo de hora baixo oferece maior margem para precificação competitiva e lucro, além de maior resiliência a períodos de menor demanda.',
      recommendedAction:
        'Manter a estrutura atual e usar o custo da hora como base para precificar procedimentos com clareza.',
      expectedImpact:
        'Precificação com margem adequada e boa competitividade de mercado.',
      checklist: [
        'Registrar o custo da hora como referência interna',
        'Usar este valor na Calculadora de Precificação',
        'Revisar anualmente os custos fixos para manter a eficiência',
      ],
    },
  },

  // ─── 6. custo_hora_moderado ───────────────────────────────────────────
  {
    condition: (c) => c.clinicalHourCost > 250 && c.clinicalHourCost <= 400,
    playbook: {
      id: 'custo_hora_moderado',
      title: 'Custo da hora moderado',
      subtitle: 'Entre R$250 e R$400/h — acompanhamento recomendado',
      category: 'costs',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O custo da hora clínica está entre R$250 e R$400.',
      objective:
        'Acompanhar o custo da hora e verificar se existe oportunidade de redução sem comprometer a operação.',
      whyItMatters:
        'Com custo moderado, a precificação ainda é viável, mas reduzir o custo da hora pode melhorar a margem ou a competitividade dos preços.',
      recommendedAction:
        'Revisar os custos fixos e variáveis para identificar oportunidades de redução e avaliar se a ocupação pode ser aumentada.',
      expectedImpact:
        'Redução do custo da hora e melhora da margem operacional.',
      checklist: [
        'Revisar os principais itens de custo fixo',
        'Verificar se há contratos ou assinaturas que podem ser renegociados',
        'Avaliar se o aumento da ocupação reduziria o custo da hora',
        'Usar este valor como base para precificação de procedimentos',
      ],
    },
  },

  // ─── 7. custo_hora_elevado ────────────────────────────────────────────
  {
    condition: (c) => c.clinicalHourCost > 400 && c.clinicalHourCost <= 700,
    playbook: {
      id: 'custo_hora_elevado',
      title: 'Custo da hora clínica elevado',
      subtitle: 'Entre R$400 e R$700/h — pressão sobre a precificação',
      category: 'costs',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O custo da hora clínica está entre R$400 e R$700.',
      objective:
        'Reduzir o custo da hora clínica para viabilizar precificação competitiva e margens adequadas.',
      whyItMatters:
        'Com custo acima de R$400/hora, manter preços competitivos e ainda gerar lucro pode ser difícil, especialmente em especialidades com tickets mais baixos.',
      recommendedAction:
        'Revisar estrutura de custos fixos, avaliar aumento de ocupação e verificar se a jornada de trabalho está dimensionada adequadamente.',
      expectedImpact:
        'Redução do custo da hora e ampliação da margem disponível para precificação.',
      checklist: [
        'Listar os maiores itens de custo fixo e verificar renegociação',
        'Calcular o impacto de um aumento de 10% na taxa de ocupação',
        'Avaliar se há custos que podem ser eliminados ou reduzidos',
        'Verificar se o número de horas disponíveis está alinhado com a demanda real',
        'Usar a Calculadora de Precificação com este custo de hora para revisar tabela de preços',
      ],
    },
  },

  // ─── 8. custo_hora_critico ────────────────────────────────────────────
  {
    condition: (c) => c.clinicalHourCost > 700,
    playbook: {
      id: 'custo_hora_critico',
      title: 'Custo da hora clínica crítico',
      subtitle: 'Acima de R$700/h — sustentabilidade em risco',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'O custo da hora clínica está acima de R$700.',
      objective:
        'Identificar e corrigir urgentemente as causas do custo elevado para evitar prejuízo operacional.',
      whyItMatters:
        'Com custo acima de R$700/hora, qualquer precificação competitiva tende a gerar margem insuficiente ou prejuízo, comprometendo a continuidade da operação.',
      recommendedAction:
        'Revisar estrutura completa de custos, redimensionar a operação e aumentar a ocupação antes de continuar precificando.',
      expectedImpact:
        'Redução significativa do custo da hora e recuperação da viabilidade financeira.',
      checklist: [
        'Mapear todos os custos fixos e identificar os de maior impacto',
        'Avaliar redução de horas disponíveis para concentrar a demanda',
        'Negociar redução de aluguel, contratos de serviços e fornecedores',
        'Aumentar a taxa de ocupação como prioridade imediata',
        'Revisar urgentemente a tabela de preços à luz do novo custo de hora',
      ],
    },
  },

  // ─── 9. ociosidade_controlada ─────────────────────────────────────────
  {
    condition: (c) => getIdleCostRatio(c) <= 0.15,
    playbook: {
      id: 'ociosidade_controlada',
      title: 'Ociosidade em nível controlado',
      subtitle: 'Menos de 15% dos custos em horas ociosas — operação eficiente',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'low',
      trigger: 'O custo de ociosidade representa menos de 15% dos custos totais.',
      objective:
        'Confirmar que as horas ociosas têm impacto financeiro baixo na operação.',
      whyItMatters:
        'Baixa ociosidade significa que os custos fixos estão bem distribuídos sobre as horas produtivas, contribuindo para um custo de hora menor.',
      recommendedAction:
        'Manter a estratégia atual e monitorar para não deixar a ociosidade crescer.',
      expectedImpact:
        'Manutenção da eficiência operacional e custo de hora controlado.',
      checklist: [
        'Monitorar a taxa de ocupação mensalmente',
        'Manter política de confirmação de consultas ativa',
        'Revisar se há sazonalidades que podem aumentar a ociosidade',
      ],
    },
  },

  // ─── 10. ociosidade_moderada ──────────────────────────────────────────
  {
    condition: (c) => {
      const r = getIdleCostRatio(c)
      return r > 0.15 && r <= 0.3
    },
    playbook: {
      id: 'ociosidade_moderada',
      title: 'Ociosidade moderada',
      subtitle: 'Entre 15% e 30% dos custos em horas ociosas',
      category: 'idle_time',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O custo de ociosidade representa entre 15% e 30% dos custos totais.',
      objective:
        'Reduzir as horas ociosas para melhorar a eficiência e baixar o custo da hora clínica.',
      whyItMatters:
        'Com 15% a 30% dos custos em horas ociosas, há uma oportunidade real de melhora sem grandes mudanças estruturais.',
      recommendedAction:
        'Implementar ações de ocupação nos horários ociosos, como encaixes, retornos e campanhas de saúde.',
      expectedImpact:
        'Redução do custo da hora clínica e melhora da rentabilidade.',
      checklist: [
        'Identificar os horários com maior ociosidade',
        'Criar estratégia de encaixes e retornos nos horários vagos',
        'Avaliar campanhas de saúde para atrair pacientes em horários específicos',
        'Analisar se ajustes na jornada de trabalho poderiam concentrar a demanda',
      ],
    },
  },

  // ─── 11. ociosidade_relevante ─────────────────────────────────────────
  {
    condition: (c) => {
      const r = getIdleCostRatio(c)
      return r > 0.3 && r <= 0.5
    },
    playbook: {
      id: 'ociosidade_relevante',
      title: 'Ociosidade relevante',
      subtitle: 'Entre 30% e 50% dos custos em horas ociosas',
      category: 'idle_time',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O custo de ociosidade representa entre 30% e 50% dos custos totais.',
      objective:
        'Reduzir significativamente as horas ociosas para recuperar eficiência operacional.',
      whyItMatters:
        'Nível acima de 30% indica que uma parcela considerável da estrutura financeira está sendo desperdiçada em horas sem atendimento.',
      recommendedAction:
        'Revisar agenda, estratégia de captação e se a estrutura de dias e horas está dimensionada corretamente para a demanda real.',
      expectedImpact:
        'Redução relevante do custo da hora e melhora expressiva da rentabilidade.',
      checklist: [
        'Analisar o número ideal de horas disponíveis por dia e ajustar se necessário',
        'Criar programa ativo de reativação de pacientes',
        'Revisar estratégia de marketing e visibilidade local',
        'Avaliar se reduzir o número de dias trabalhados concentraria melhor a demanda',
        'Monitorar mensalmente a evolução da ociosidade',
      ],
    },
  },

  // ─── 12. ociosidade_critica ───────────────────────────────────────────
  {
    condition: (c) => getIdleCostRatio(c) > 0.5,
    playbook: {
      id: 'ociosidade_critica',
      title: 'Ociosidade crítica — custos elevados sem produção',
      subtitle: 'Mais de 50% dos custos em horas ociosas — risco operacional',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'O custo de ociosidade representa mais de 50% dos custos totais mensais.',
      objective:
        'Corrigir urgentemente a estrutura de agenda e captação para reduzir o desperdício financeiro.',
      whyItMatters:
        'Com mais da metade dos custos associados a horas ociosas, a operação está muito ineficiente e qualquer solução de precificação torna-se difícil de sustentar.',
      recommendedAction:
        'Redimensionar imediatamente a estrutura de horas disponíveis e intensificar ações de captação e reativação de pacientes.',
      expectedImpact:
        'Redução drástica do custo da hora e melhora urgente da viabilidade financeira.',
      checklist: [
        'Reduzir temporariamente as horas disponíveis para concentrar a demanda',
        'Intensificar ações de captação e reativação com urgência',
        'Revisar estrutura de custos fixos para reduzir o impacto da ociosidade',
        'Avaliar se o modelo de operação atual é sustentável no médio prazo',
        'Definir meta mensal de redução da ociosidade e acompanhar semanalmente',
      ],
    },
  },

  // ─── 13. capacidade_produtiva_boa ─────────────────────────────────────
  {
    condition: (c) => c.productiveHours >= 140,
    playbook: {
      id: 'capacidade_produtiva_boa',
      title: 'Boa capacidade produtiva mensal',
      subtitle: 'Acima de 140 horas produtivas — sólida base de atendimentos',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A clínica possui 140 ou mais horas produtivas por mês.',
      objective:
        'Confirmar que a capacidade produtiva é sólida e aproveitar esse volume para diluir os custos de forma eficiente.',
      whyItMatters:
        'Com mais de 140 horas produtivas, os custos fixos são distribuídos sobre um volume alto de atendimentos, tendendo a reduzir o custo por hora.',
      recommendedAction:
        'Manter o volume de horas e garantir que a qualidade dos atendimentos e a precificação estejam compatíveis com essa capacidade.',
      expectedImpact:
        'Custo da hora clínica mais baixo e maior faturamento potencial mensal.',
      checklist: [
        'Confirmar que a equipe consegue manter a qualidade com esse volume',
        'Revisar se a precificação está capturando adequadamente o volume produzido',
        'Monitorar indicadores de satisfação dos pacientes',
      ],
    },
  },

  // ─── 14. capacidade_produtiva_suficiente ──────────────────────────────
  {
    condition: (c) => c.productiveHours >= 90 && c.productiveHours < 140,
    playbook: {
      id: 'capacidade_produtiva_suficiente',
      title: 'Capacidade produtiva suficiente',
      subtitle: 'Entre 90 e 140 horas produtivas — base sólida com espaço para crescer',
      category: 'capacity',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A clínica possui entre 90 e 140 horas produtivas por mês.',
      objective:
        'Aumentar gradualmente o volume de horas produtivas para melhorar a diluição dos custos.',
      whyItMatters:
        'Com 90 a 140 horas, a operação é viável, mas ainda há margem para crescer sem adicionar custos fixos relevantes.',
      recommendedAction:
        'Ampliar a captação e otimizar o uso do tempo disponível para aumentar as horas produtivas mensais.',
      expectedImpact:
        'Redução do custo da hora clínica e aumento do faturamento potencial.',
      checklist: [
        'Mapear os horários com maior potencial de crescimento',
        'Verificar se há encaixes possíveis nos horários menos ocupados',
        'Avaliar expansão de serviços ou especialidades para atrair mais pacientes',
        'Definir meta de horas produtivas para o próximo trimestre',
      ],
    },
  },

  // ─── 15. capacidade_produtiva_limitada ────────────────────────────────
  {
    condition: (c) => c.productiveHours >= 50 && c.productiveHours < 90,
    playbook: {
      id: 'capacidade_produtiva_limitada',
      title: 'Capacidade produtiva limitada',
      subtitle: 'Entre 50 e 90 horas produtivas — custo da hora mais sensível',
      category: 'capacity',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'A clínica possui entre 50 e 90 horas produtivas por mês.',
      objective:
        'Ampliar o volume de horas produtivas para reduzir o custo da hora e melhorar a rentabilidade.',
      whyItMatters:
        'Com poucas horas produtivas, qualquer variação na agenda tem impacto direto e relevante no custo da hora clínica.',
      recommendedAction:
        'Implementar ações focadas em aumentar o volume de atendimentos, seja por captação de pacientes, ampliação de serviços ou ajuste do modelo operacional.',
      expectedImpact:
        'Redução relevante do custo da hora e melhora da sustentabilidade financeira.',
      checklist: [
        'Avaliar ampliação do número de dias ou horas de atendimento',
        'Intensificar ações de captação de novos pacientes',
        'Revisar o mix de procedimentos para incluir atendimentos mais frequentes',
        'Verificar se o modelo de operação é adequado para a demanda da região',
        'Definir meta clara de horas produtivas e acompanhar mensalmente',
      ],
    },
  },

  // ─── 16. capacidade_produtiva_critica ─────────────────────────────────
  {
    condition: (c) => c.productiveHours < 50,
    playbook: {
      id: 'capacidade_produtiva_critica',
      title: 'Baixa capacidade produtiva — custo da hora pressionado',
      subtitle: 'Menos de 50 horas produtivas por mês',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger: 'A clínica possui menos de 50 horas produtivas por mês.',
      objective:
        'Aumentar urgentemente o volume de horas produtivas para tornar a operação financeiramente viável.',
      whyItMatters:
        'Com menos de 50 horas produtivas, os custos fixos são diluídos em pouquíssimos atendimentos, tornando o custo da hora muito elevado e inviabilizando a precificação competitiva.',
      recommendedAction:
        'Reestruturar urgentemente o modelo de captação e operação para ampliar os atendimentos mensais.',
      expectedImpact:
        'Redução significativa do custo da hora e melhora urgente da viabilidade financeira.',
      checklist: [
        'Avaliar se a estrutura de dias e horas disponíveis está compatível com a demanda local',
        'Intensificar captação ativa de pacientes imediatamente',
        'Verificar se há parceiros ou convênios que possam aumentar o volume rapidamente',
        'Considerar revisão do modelo de operação para maior eficiência',
        'Acompanhar semanalmente a evolução do volume de atendimentos',
      ],
    },
  },

  // ─── 17. meta_lucro_moderada ──────────────────────────────────────────
  {
    condition: (c) => c.revenueGapPercent > 0 && c.revenueGapPercent <= 25,
    playbook: {
      id: 'meta_lucro_moderada',
      title: 'Meta de lucro moderada e alcançável',
      subtitle: 'Gap de receita abaixo de 25% — meta compatível com a operação',
      category: 'profit',
      priority: 'medium',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A diferença entre receita mínima e recomendada está entre 0 e 25%.',
      objective:
        'Confirmar que a meta de lucro é realista e usar a receita recomendada como referência de precificação.',
      whyItMatters:
        'Com um gap moderado, os preços praticados precisam ser apenas ligeiramente acima do custo mínimo para atingir a meta — tornando a estratégia de precificação mais simples.',
      recommendedAction:
        'Usar a receita recomendada por hora como base para revisar a tabela de procedimentos.',
      expectedImpact:
        'Precificação alinhada com a meta de lucro sem necessidade de preços muito acima do mercado.',
      checklist: [
        'Usar a receita recomendada por hora na Calculadora de Precificação',
        'Verificar se os procedimentos praticados cobrem a receita recomendada em média',
        'Monitorar mensalmente se a meta de lucro está sendo atingida',
      ],
    },
  },

  // ─── 18. meta_lucro_exigente ──────────────────────────────────────────
  {
    condition: (c) => c.revenueGapPercent > 25,
    playbook: {
      id: 'meta_lucro_exigente',
      title: 'Meta de lucro exigente',
      subtitle: 'Gap de receita acima de 25% — precificação mais desafiadora',
      category: 'pricing',
      priority: 'high',
      urgency: 'medium',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'A diferença entre receita mínima e recomendada supera 25%.',
      objective:
        'Avaliar se a meta de lucro é compatível com a realidade do mercado e ajustar a estratégia de precificação.',
      whyItMatters:
        'Um gap alto exige preços significativamente acima do custo mínimo, o que pode ser difícil de sustentar em mercados competitivos ou com ticket médio limitado.',
      recommendedAction:
        'Revisar a meta de lucro, a estrutura de custos ou a mix de procedimentos para tornar a meta mais alcançável.',
      expectedImpact:
        'Alinhamento entre a meta de lucro, os preços praticados e a realidade do mercado.',
      checklist: [
        'Verificar se a meta de lucro está adequada ao perfil da clínica',
        'Avaliar se uma redução de custos fixos permitiria manter o mesmo lucro com gap menor',
        'Usar a receita recomendada como base para revisão de tabela de preços',
        'Analisar o ticket médio atual dos procedimentos realizados',
        'Considerar incluir procedimentos de maior valor agregado na carteira',
      ],
    },
  },

  // ═══ PLAYBOOKS COMPOSTOS ══════════════════════════════════════════════

  // ─── 19. ocupacao_baixa_mais_custo_alto ──────────────────────────────
  {
    condition: (c) => c.occupancyRatePercent < 65 && c.clinicalHourCost > 400,
    playbook: {
      id: 'ocupacao_baixa_mais_custo_alto',
      title: 'Baixa ocupação combinada com custo alto da hora',
      subtitle: 'Dois fatores de risco simultâneos — situação financeira crítica',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'A taxa de ocupação está abaixo de 65% e o custo da hora clínica supera R$400.',
      objective:
        'Reverter simultaneamente a baixa ocupação e o alto custo da hora para recuperar a viabilidade da operação.',
      whyItMatters:
        'A combinação de pouca agenda preenchida com custo de hora elevado cria um risco duplo: menos faturamento e mais custo por atendimento.',
      recommendedAction:
        'Agir em duas frentes: aumentar urgentemente a ocupação E revisar os custos fixos para reduzir o custo da hora.',
      expectedImpact:
        'Melhora simultânea da receita e do custo, recuperando a rentabilidade da operação.',
      checklist: [
        'Intensificar captação de pacientes como prioridade imediata',
        'Identificar e reduzir os maiores custos fixos sem impactar a qualidade',
        'Avaliar redimensionamento da jornada de trabalho',
        'Calcular o impacto de atingir 75% de ocupação no custo da hora',
        'Definir prazo para revisão e nova simulação',
      ],
    },
  },

  // ─── 20. ociosidade_alta_mais_capacidade_limitada ────────────────────
  {
    condition: (c) => getIdleCostRatio(c) > 0.3 && c.productiveHours < 90,
    playbook: {
      id: 'ociosidade_alta_mais_capacidade_limitada',
      title: 'Ociosidade alta com baixa capacidade produtiva',
      subtitle: 'Estrutura superdimensionada para a demanda atual',
      category: 'idle_time',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'O custo de ociosidade supera 30% dos custos totais e as horas produtivas estão abaixo de 90.',
      objective:
        'Redimensionar a operação para que a estrutura de custos seja compatível com o volume real de atendimentos.',
      whyItMatters:
        'Manter uma estrutura superdimensionada para a demanda atual resulta em custo de hora muito alto e dificulta qualquer estratégia de precificação.',
      recommendedAction:
        'Revisar o tamanho da operação — número de horas disponíveis, dias trabalhados e custos fixos — para adequar à demanda real.',
      expectedImpact:
        'Redução drástica do custo da hora e melhora urgente da eficiência operacional.',
      checklist: [
        'Avaliar reduzir dias ou horas de atendimento para concentrar a demanda',
        'Renegociar custos fixos proporcionais à nova estrutura',
        'Criar plano de captação para aumentar as horas produtivas',
        'Definir um número mínimo de horas produtivas para a sustentabilidade e perseguir essa meta',
      ],
    },
  },

  // ─── 21. custo_critico_mais_meta_exigente ─────────────────────────────
  {
    condition: (c) => c.clinicalHourCost > 700 && c.revenueGapPercent > 25,
    playbook: {
      id: 'custo_critico_mais_meta_exigente',
      title: 'Custo crítico combinado com meta de lucro exigente',
      subtitle: 'Hora cara e margem alta — pressão extrema sobre os preços',
      category: 'pricing',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'O custo da hora clínica está acima de R$700 e o gap de receita para atingir o lucro desejado supera 25%.',
      objective:
        'Resolver simultaneamente o alto custo da hora e a exigência de lucro para tornar a operação viável.',
      whyItMatters:
        'Com custo crítico e meta de lucro exigente, a receita necessária por hora torna-se muito difícil de atingir com preços de mercado competitivos.',
      recommendedAction:
        'Revisar imediatamente a estrutura de custos e calibrar a meta de lucro para um nível compatível com a realidade da operação.',
      expectedImpact:
        'Redução da pressão sobre os preços e recuperação da viabilidade financeira.',
      checklist: [
        'Reduzir os custos fixos como prioridade máxima',
        'Recalibrar a meta de lucro para um nível mais realista no curto prazo',
        'Aumentar a ocupação para diluir o custo sobre mais horas',
        'Verificar se a tabela de preços atual cobre ao menos o custo mínimo',
        'Definir um plano de ação com metas claras e prazos para revisão',
      ],
    },
  },

  // ─── 22. baixa_ocupacao_mais_meta_lucro ───────────────────────────────
  {
    condition: (c) => c.occupancyRatePercent < 65 && c.revenueGapPercent > 25,
    playbook: {
      id: 'baixa_ocupacao_mais_meta_lucro',
      title: 'Baixa ocupação com meta de lucro exigente',
      subtitle: 'Agenda ociosa e expectativa alta — combinação difícil de sustentar',
      category: 'profit',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'A ocupação está abaixo de 65% e a meta de lucro eleva o gap de receita acima de 25%.',
      objective:
        'Alinhar a meta de lucro com a ocupação real da clínica ou aumentar a ocupação para suportar a meta.',
      whyItMatters:
        'Perseguir uma meta de lucro exigente com baixa ocupação exige preços muito altos, o que pode dificultar ainda mais a captação de novos pacientes.',
      recommendedAction:
        'Aumentar a ocupação como prioridade principal. Alternativamente, revisar a meta de lucro para um nível mais compatível com o volume atual.',
      expectedImpact:
        'Maior alinhamento entre ocupação, custo da hora e meta de lucro.',
      checklist: [
        'Definir a meta de ocupação como prioridade de curto prazo',
        'Avaliar se a meta de lucro pode ser reduzida temporariamente até a ocupação crescer',
        'Identificar os procedimentos com maior potencial de atrair novos pacientes',
        'Calcular quanto a receita recomendada mudaria com 75% de ocupação',
      ],
    },
  },

  // ─── 23. capacidade_boa_com_ocupacao_alta ─────────────────────────────
  {
    condition: (c) => c.productiveHours >= 140 && c.occupancyRatePercent >= 80,
    playbook: {
      id: 'capacidade_boa_com_ocupacao_alta',
      title: 'Alta capacidade produtiva e boa ocupação',
      subtitle: 'Operação em nível ótimo — referência para padronização',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'A clínica possui mais de 140 horas produtivas e ocupa mais de 80% da agenda.',
      objective:
        'Confirmar que a operação está em nível ótimo e usar como referência para metas e benchmarks.',
      whyItMatters:
        'Alta capacidade produtiva com boa ocupação é a combinação ideal para diluir custos e maximizar o faturamento potencial.',
      recommendedAction:
        'Registrar este cenário como benchmark e monitorar para mantê-lo sustentável.',
      expectedImpact:
        'Manutenção da eficiência operacional e base sólida para crescimento.',
      checklist: [
        'Documentar os parâmetros atuais como benchmark interno',
        'Monitorar qualidade e satisfação dos pacientes nesse volume',
        'Avaliar se há capacidade para crescer ainda mais sem comprometer a qualidade',
        'Usar este cenário na Calculadora de Precificação como referência',
      ],
    },
  },

  // ─── 24. hora_clinica_saudavel_para_padronizar ────────────────────────
  {
    condition: (_c, d) =>
      d.status === 'excellent' || d.status === 'healthy',
    playbook: {
      id: 'hora_clinica_saudavel_para_padronizar',
      title: 'Hora clínica saudável — use como referência',
      subtitle: 'Cenário equilibrado, bom para padronizar parâmetros operacionais',
      category: 'standardization',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O diagnóstico geral da hora clínica é excelente ou saudável.',
      objective:
        'Padronizar os parâmetros atuais como referência interna para metas e precificação.',
      whyItMatters:
        'Cenários saudáveis são raros e merecem ser documentados para que possam ser replicados ou mantidos ao longo do tempo.',
      recommendedAction:
        'Registrar os parâmetros de jornada, ocupação e custos como modelo de referência e integrá-los à Calculadora de Precificação.',
      expectedImpact:
        'Maior consistência nas decisões operacionais e financeiras da clínica.',
      checklist: [
        'Registrar os parâmetros atuais: dias, horas, ocupação, custos',
        'Usar o custo da hora como referência na tabela de procedimentos',
        'Revisitar este cenário trimestralmente para verificar se se mantém',
      ],
    },
  },

  // ─── 25. agenda_precisa_reestruturacao ────────────────────────────────
  {
    condition: (c) =>
      c.occupancyRatePercent < 50 || getIdleCostRatio(c) > 0.5,
    playbook: {
      id: 'agenda_precisa_reestruturacao',
      title: 'Agenda precisa de reestruturação',
      subtitle: 'Ociosidade crítica ou ocupação muito baixa — modelo atual não sustentável',
      category: 'schedule',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'A taxa de ocupação está abaixo de 50% ou mais de 50% dos custos é gerado por horas ociosas.',
      objective:
        'Reestruturar a agenda para que seja financeiramente sustentável no curto prazo.',
      whyItMatters:
        'O modelo atual de agenda não é capaz de absorver os custos operacionais de forma eficiente, gerando prejuízo ou risco de inviabilidade.',
      recommendedAction:
        'Revisitar a estrutura de dias e horas disponíveis, reduzindo onde necessário e intensificando captação para concentrar a demanda.',
      expectedImpact:
        'Redução da ociosidade e do custo da hora, tornando a operação mais sustentável.',
      checklist: [
        'Avaliar quais dias e horários têm maior e menor demanda',
        'Considerar concentrar atendimentos em menos dias com maior ocupação',
        'Definir um número mínimo de horas produtivas por dia para abrir a agenda',
        'Criar plano de captação com metas e prazos para recuperação da ocupação',
        'Renegociar ou reduzir custos fixos que não se justificam no volume atual',
      ],
    },
  },

  // ─── 26. reprecificacao_por_hora_clinica ──────────────────────────────
  {
    condition: (c) => c.clinicalHourCost > 400 || c.revenueGapPercent > 25,
    playbook: {
      id: 'reprecificacao_por_hora_clinica',
      title: 'Revisar precificação com base na hora clínica',
      subtitle: 'Custo alto ou meta exigente exigem revisão da tabela de procedimentos',
      category: 'pricing',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O custo da hora clínica supera R$400 ou o gap de receita para o lucro desejado é acima de 25%.',
      objective:
        'Revisar a tabela de preços dos procedimentos considerando o custo real da hora clínica.',
      whyItMatters:
        'Precificar sem considerar o custo real da hora pode resultar em procedimentos deficitários mesmo quando o preço parece competitivo.',
      recommendedAction:
        'Usar a receita recomendada por hora como base para revisar a tabela de preços na Calculadora de Precificação Odontológica.',
      expectedImpact:
        'Precificação alinhada ao custo real da hora e aumento da margem por procedimento.',
      checklist: [
        'Usar a receita recomendada por hora calculada aqui na Calculadora de Precificação',
        'Revisar os procedimentos com maior tempo clínico — são os mais impactados pelo custo da hora',
        'Verificar se o ticket médio atual cobre a receita mínima por hora',
        'Planejar comunicação de eventuais reajustes com antecedência',
        'Monitorar o impacto na demanda após qualquer ajuste de preços',
      ],
    },
  },
]

// ── Função principal ───────────────────────────────────────────────────

export function getHoraClinicaPlaybooks(
  calculation: HoraClinicaCalculationResult,
  diagnostic: HoraClinicaDiagnosticResult,
): HoraClinicaPlaybookResult {
  const applicable = PLAYBOOK_DEFINITIONS.filter(({ condition }) =>
    condition(calculation, diagnostic),
  ).map(({ playbook }) => playbook)

  const deduplicated = deduplicateById(applicable)

  return { playbooks: sortByPriority(deduplicated) }
}

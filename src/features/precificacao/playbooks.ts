import type {
  PrecificacaoCalculationResult,
  PrecificacaoDiagnosticResult,
  PrecificacaoPlaybook,
  PrecificacaoPlaybookPriority,
  PrecificacaoPlaybookResult,
} from './types'

// ── Ordenação ──────────────────────────────────────────────────────────

const PRIORITY_WEIGHT: Record<PrecificacaoPlaybookPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function sortByPriority(playbooks: PrecificacaoPlaybook[]): PrecificacaoPlaybook[] {
  return [...playbooks].sort(
    (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
  )
}

function deduplicateById(playbooks: PrecificacaoPlaybook[]): PrecificacaoPlaybook[] {
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
    c: PrecificacaoCalculationResult,
    d: PrecificacaoDiagnosticResult,
  ) => boolean
  playbook: PrecificacaoPlaybook
}

const PLAYBOOK_DEFINITIONS: PlaybookDefinition[] = [
  // ─── 1. preco_sugerido_saudavel ─────────────────────────────────────
  {
    condition: (_c, d) => d.status === 'excellent',
    playbook: {
      id: 'preco_sugerido_saudavel',
      title: 'Preço sugerido saudável',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O diagnóstico geral indica que o preço sugerido está bem estruturado.',
      objective:
        'Confirmar que o preço sugerido está alinhado com os custos e a margem desejada.',
      whyItMatters:
        'Um preço bem calculado tende a preservar a margem e sustentar a operação financeira ao longo do tempo.',
      recommendedAction:
        'Usar este preço como referência para o procedimento e revisá-lo periodicamente conforme os custos mudarem.',
      expectedImpact:
        'Preço estável, previsível e alinhado com a meta de margem informada.',
      checklist: [
        'Confirmar que os custos informados refletem a realidade atual',
        'Revisar o valor da hora clínica ao menos uma vez por semestre',
        'Registrar este preço como referência na tabela da clínica',
      ],
    },
  },

  // ─── 2. preco_viavel_com_acompanhamento ─────────────────────────────
  {
    condition: (_c, d) => d.status === 'healthy',
    playbook: {
      id: 'preco_viavel_com_acompanhamento',
      title: 'Preço viável, com acompanhamento',
      category: 'pricing',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O cenário é financeiramente viável, mas há pontos que merecem acompanhamento.',
      objective:
        'Manter o preço com atenção aos fatores que podem pressionar a margem.',
      whyItMatters:
        'Cenários viáveis podem se deteriorar quando custos sobem sem revisão de preço.',
      recommendedAction:
        'Revisar os custos informados e verificar se há ajuste possível para melhorar a margem.',
      expectedImpact:
        'Preço sustentável com margem protegida após pequenos ajustes.',
      checklist: [
        'Verificar se o custo de material está atualizado',
        'Confirmar o valor da hora clínica',
        'Avaliar se uma revisão de 5% a 10% no preço final é viável',
      ],
    },
  },

  // ─── 3. preco_exige_revisao ─────────────────────────────────────────
  {
    condition: (_c, d) => d.status === 'attention',
    playbook: {
      id: 'preco_exige_revisao',
      title: 'Preço exige revisão',
      category: 'pricing',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O cenário indica que o preço atual ou sugerido exige revisão antes de ser mantido ou apresentado.',
      objective:
        'Corrigir o desequilíbrio antes de fechar um orçamento ou reforçar uma tabela.',
      whyItMatters:
        'Manter um preço abaixo do necessário prejudica a rentabilidade de cada procedimento realizado.',
      recommendedAction:
        'Revisar o preço atual, comparar com o mínimo calculado e ajustar para preservar a margem.',
      expectedImpact:
        'Redução do risco de operar no prejuízo e melhora gradual da rentabilidade.',
      checklist: [
        'Comparar o preço atual com o preço mínimo calculado',
        'Identificar qual custo é o maior responsável pela pressão na margem',
        'Simular um reajuste gradual de 10% a 20% e verificar viabilidade',
        'Comunicar o ajuste de forma profissional ao paciente quando necessário',
      ],
    },
  },

  // ─── 4. preco_critico ───────────────────────────────────────────────
  {
    condition: (_c, d) => d.status === 'critical',
    playbook: {
      id: 'preco_critico',
      title: 'Risco crítico na precificação',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O diagnóstico indica risco financeiro relevante na formação do preço deste procedimento.',
      objective:
        'Evitar que o procedimento seja praticado com preço que compromete a margem ou gera prejuízo.',
      whyItMatters:
        'Procedimentos precificados de forma crítica drenam a rentabilidade da clínica com cada atendimento.',
      recommendedAction:
        'Revisar imediatamente o preço praticado. Comparar com o preço mínimo e sugerido antes de qualquer orçamento.',
      expectedImpact:
        'Eliminação do risco de prejuízo e retomada do controle financeiro sobre o procedimento.',
      checklist: [
        'Não apresentar orçamento sem revisar o preço calculado',
        'Garantir que o valor praticado está acima do preço mínimo calculado',
        'Identificar o principal driver de custo: material, laboratório ou tempo',
        'Simular redução de custo ou reajuste de preço antes de decidir',
        'Comunicar reajuste com antecedência quando necessário',
      ],
    },
  },

  // ─── 5. preco_atual_abaixo_do_minimo ────────────────────────────────
  {
    condition: (c) => c.currentPriceStatus === 'belowMinimum',
    playbook: {
      id: 'preco_atual_abaixo_do_minimo',
      title: 'Preço atual abaixo do mínimo',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O preço atual informado está abaixo do preço mínimo calculado para cobrir os custos estimados.',
      objective:
        'Alertar que o preço praticado pode não cobrir os custos diretos e as deduções estimadas.',
      whyItMatters:
        'Praticar um preço abaixo do mínimo significa operar com prejuízo em cada procedimento realizado.',
      recommendedAction:
        'Revisar o preço imediatamente. Verificar se os custos informados estão corretos antes de confirmar o ajuste necessário.',
      expectedImpact:
        'Eliminação de prejuízo direto por procedimento e proteção da saúde financeira da clínica.',
      checklist: [
        'Confirmar que os custos de material e laboratório estão corretos',
        'Comparar o preço atual com o preço mínimo calculado',
        'Planejar um reajuste gradual se o preço atual estiver muito defasado',
        'Considerar comunicar o ajuste antecipadamente ao paciente',
      ],
    },
  },

  // ─── 6. preco_atual_abaixo_do_sugerido ──────────────────────────────
  {
    condition: (c) => c.currentPriceStatus === 'belowSuggested',
    playbook: {
      id: 'preco_atual_abaixo_do_sugerido',
      title: 'Preço atual abaixo do sugerido',
      category: 'pricing',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'low',
      financialImpactLevel: 'high',
      trigger:
        'O preço atual cobre os custos estimados, mas fica abaixo do preço sugerido para a margem desejada.',
      objective:
        'Identificar a diferença entre o preço praticado e o ideal para a rentabilidade desejada.',
      whyItMatters:
        'Cobrir os custos sem preservar a margem significa trabalhar com retorno menor do que o planejado.',
      recommendedAction:
        'Avaliar um reajuste gradual em direção ao preço sugerido, considerando o perfil dos pacientes e o mercado local.',
      expectedImpact:
        'Melhora progressiva da margem por procedimento sem ruptura na relação com o paciente.',
      checklist: [
        'Calcular a diferença percentual entre o preço atual e o sugerido',
        'Planejar um reajuste de 5% a 15% nas próximas revisões de tabela',
        'Comunicar o ajuste de forma antecipada e profissional',
        'Verificar se o mercado local suporta o preço sugerido',
      ],
    },
  },

  // ─── 7. preco_atual_saudavel ────────────────────────────────────────
  {
    condition: (c) => c.currentPriceStatus === 'healthy',
    playbook: {
      id: 'preco_atual_saudavel',
      title: 'Preço atual saudável',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O preço atual informado está igual ou acima do preço sugerido.',
      objective:
        'Confirmar que o preço praticado preserva ou supera a margem desejada.',
      whyItMatters:
        'Praticar um preço acima ou igual ao sugerido indica que a rentabilidade do procedimento está protegida.',
      recommendedAction:
        'Manter o preço atual e usar como referência para procedimentos semelhantes.',
      expectedImpact:
        'Margem preservada e operação financeiramente equilibrada para este procedimento.',
      checklist: [
        'Registrar este cenário como referência de precificação saudável',
        'Revisar o preço periodicamente conforme os custos mudarem',
        'Usar como base para a tabela de procedimentos da clínica',
      ],
    },
  },

  // ─── 8. sem_preco_atual_para_comparar ───────────────────────────────
  {
    condition: (c) => c.currentPriceStatus === undefined,
    playbook: {
      id: 'sem_preco_atual_para_comparar',
      title: 'Sem preço atual para comparação',
      category: 'standardization',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'low',
      trigger:
        'Nenhum preço atual foi informado para comparação com o preço sugerido.',
      objective:
        'Orientar o dentista a identificar e registrar o preço praticado para análise futura.',
      whyItMatters:
        'Sem o preço atual, não é possível saber se o procedimento está gerando a margem esperada.',
      recommendedAction:
        'Informar o preço atual praticado na próxima simulação para obter a comparação completa.',
      expectedImpact:
        'Diagnóstico mais preciso e decisões de precificação com base em dados reais.',
      checklist: [
        'Verificar qual valor está sendo cobrado atualmente pelo procedimento',
        'Registrar o preço praticado na tabela da clínica',
        'Usar o preço mínimo calculado como piso de referência imediata',
      ],
    },
  },

  // ─── 9. custo_material_elevado ──────────────────────────────────────
  {
    condition: (c) => c.materialCost / c.directCost > 0.35,
    playbook: {
      id: 'custo_material_elevado',
      title: 'Custo de material elevado',
      category: 'costs',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O custo de materiais representa mais de 35% do custo direto do procedimento.',
      objective:
        'Identificar se o custo de materiais está pressionando o preço final de forma relevante.',
      whyItMatters:
        'Materiais com peso elevado podem exigir preços finais mais altos ou reduzir a margem disponível.',
      recommendedAction:
        'Revisar os materiais utilizados, verificar alternativas equivalentes e avaliar o impacto no preço.',
      expectedImpact:
        'Redução do custo de material ou ajuste consciente do preço para preservar a margem.',
      checklist: [
        'Listar os materiais incluídos no custo informado',
        'Verificar se há fornecedores alternativos com preço menor',
        'Avaliar se o material pode ser substituído sem impacto na qualidade',
        'Recalcular o preço após qualquer redução no custo de material',
      ],
    },
  },

  // ─── 10. custo_material_critico ─────────────────────────────────────
  {
    condition: (c) => c.materialCost / c.directCost > 0.5,
    playbook: {
      id: 'custo_material_critico',
      title: 'Custo de material crítico',
      category: 'costs',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O custo de materiais representa mais de 50% do custo direto do procedimento.',
      objective:
        'Corrigir o peso excessivo do custo de materiais antes de definir o preço final.',
      whyItMatters:
        'Quando materiais dominam mais da metade do custo, qualquer variação de fornecedor ou preço tem impacto direto na margem.',
      recommendedAction:
        'Revisar e negociar o custo de materiais. Se não for possível reduzir, reajustar o preço final para preservar a margem.',
      expectedImpact:
        'Redução do risco de margem insuficiente por variação no custo de insumos.',
      checklist: [
        'Identificar quais materiais representam o maior custo',
        'Negociar com fornecedores ou consolidar compras para desconto por volume',
        'Avaliar substituição por alternativas equivalentes de menor custo',
        'Recalcular o preço sugerido após a revisão dos materiais',
      ],
    },
  },

  // ─── 11. laboratorio_pesando_no_preco ───────────────────────────────
  {
    condition: (c) =>
      c.labCost > 0 && c.labCost / c.directCost > 0.25,
    playbook: {
      id: 'laboratorio_pesando_no_preco',
      title: 'Laboratório pesando no preço',
      category: 'lab',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'low',
      financialImpactLevel: 'high',
      trigger:
        'O custo de laboratório representa mais de 25% do custo direto do procedimento.',
      objective:
        'Identificar se o laboratório está exercendo pressão relevante sobre o preço final.',
      whyItMatters:
        'O laboratório é um custo externo com menos controle direto e deve ser monitorado com atenção.',
      recommendedAction:
        'Verificar se o custo de laboratório está compatível com o mercado e se o preço final está adequado para cobri-lo.',
      expectedImpact:
        'Preço ajustado que absorve o custo de laboratório sem comprometer a margem.',
      checklist: [
        'Comparar o custo do laboratório atual com pelo menos dois fornecedores alternativos',
        'Verificar se o valor repassado ao laboratório está correto',
        'Avaliar se o preço final do procedimento reflete adequadamente o custo do laboratório',
      ],
    },
  },

  // ─── 12. laboratorio_critico ────────────────────────────────────────
  {
    condition: (c) =>
      c.labCost > 0 && c.labCost / c.directCost > 0.4,
    playbook: {
      id: 'laboratorio_critico',
      title: 'Laboratório em nível crítico',
      category: 'lab',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O custo de laboratório representa mais de 40% do custo direto do procedimento.',
      objective:
        'Corrigir o peso excessivo do laboratório no custo total antes de definir o preço.',
      whyItMatters:
        'Quando o laboratório domina mais de 40% do custo, o preço final precisa ser significativamente mais alto para preservar a margem.',
      recommendedAction:
        'Negociar o custo de laboratório ou reajustar o preço do procedimento para garantir viabilidade financeira.',
      expectedImpact:
        'Margem protegida mesmo com custo de laboratório elevado, através de ajuste consciente do preço.',
      checklist: [
        'Renegociar o valor com o laboratório atual',
        'Avaliar laboratórios alternativos de qualidade equivalente',
        'Recalcular o preço mínimo considerando o custo atual de laboratório',
        'Verificar se o valor do trabalho protético está visível e justificado no orçamento ao paciente',
      ],
    },
  },

  // ─── 13. tempo_clinico_relevante ────────────────────────────────────
  {
    condition: (c) => c.clinicalTimeCost / c.directCost > 0.55,
    playbook: {
      id: 'tempo_clinico_relevante',
      title: 'Tempo clínico relevante no custo',
      category: 'time',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O custo do tempo clínico representa mais de 55% do custo direto do procedimento.',
      objective:
        'Identificar se o tempo de cadeira está dominando a composição de custo e impactando o preço.',
      whyItMatters:
        'Procedimentos com tempo clínico elevado exigem preços mais altos e ocupam mais agenda, reduzindo a capacidade de produção.',
      recommendedAction:
        'Avaliar se o tempo clínico informado está correto e se há formas de aumentar a eficiência no procedimento.',
      expectedImpact:
        'Preço adequado ao tempo real investido e eventual redução do tempo por melhoria de protocolo.',
      checklist: [
        'Confirmar que o tempo clínico informado reflete o tempo real do procedimento',
        'Verificar se o valor da hora clínica está atualizado',
        'Avaliar se há oportunidade de reduzir o tempo através de protocolos mais eficientes',
      ],
    },
  },

  // ─── 14. tempo_clinico_critico ──────────────────────────────────────
  {
    condition: (c) => c.clinicalTimeCost / c.directCost > 0.75,
    playbook: {
      id: 'tempo_clinico_critico',
      title: 'Tempo clínico domina o custo',
      category: 'time',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O custo do tempo clínico representa mais de 75% do custo direto do procedimento.',
      objective:
        'Alertar que o tempo de cadeira domina o custo e pode comprometer a viabilidade do procedimento.',
      whyItMatters:
        'Quando o tempo clínico domina mais de 75% do custo, o preço final precisa ser muito alto para cobrir o retorno desejado.',
      recommendedAction:
        'Revisar o tempo clínico, a eficiência do protocolo e o valor da hora clínica para garantir que o procedimento seja financeiramente viável.',
      expectedImpact:
        'Redução do risco de inviabilidade financeira por procedimento com tempo clínico excessivo.',
      checklist: [
        'Verificar se o tempo informado está correto ou subestimado',
        'Revisar o protocolo do procedimento com foco em eficiência',
        'Avaliar se o valor da hora clínica está adequado ao perfil da clínica',
        'Comparar o preço final com o mercado local para verificar competitividade',
      ],
    },
  },

  // ─── 15. deducoes_elevadas ──────────────────────────────────────────
  {
    condition: (c) => c.deductionPercent > 15,
    playbook: {
      id: 'deducoes_elevadas',
      title: 'Deduções elevadas',
      category: 'fees',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'low',
      financialImpactLevel: 'high',
      trigger:
        'A soma de taxas e impostos estimados supera 15% do preço.',
      objective:
        'Identificar o impacto das deduções na formação do preço e considerar ajuste.',
      whyItMatters:
        'Deduções acima de 15% exigem um preço sugerido proporcionalmente mais alto para preservar a margem.',
      recommendedAction:
        'Verificar se a alíquota de impostos e a taxa da maquininha estão corretas e avaliar se é possível reduzi-las.',
      expectedImpact:
        'Preço mais preciso e margem melhor protegida após revisão das deduções.',
      checklist: [
        'Confirmar a taxa da maquininha com a operadora',
        'Verificar o regime tributário atual e se há alternativa mais vantajosa',
        'Recalcular o preço sugerido com as deduções confirmadas',
      ],
    },
  },

  // ─── 16. deducoes_criticas ──────────────────────────────────────────
  {
    condition: (c) => c.deductionPercent > 25,
    playbook: {
      id: 'deducoes_criticas',
      title: 'Deduções em nível crítico',
      category: 'fees',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'A soma de taxas e impostos estimados supera 25% do preço.',
      objective:
        'Corrigir o nível crítico de deduções que compromete a formação de preço.',
      whyItMatters:
        'Deduções acima de 25% tornam o preço sugerido muito elevado e podem dificultar a competitividade da clínica.',
      recommendedAction:
        'Revisar urgentemente as taxas e o regime tributário. Confirmar os percentuais informados antes de qualquer decisão de preço.',
      expectedImpact:
        'Redução do impacto das deduções no preço final e recuperação da competitividade.',
      checklist: [
        'Confirmar a taxa da maquininha — verificar se há plano com menor custo',
        'Consultar um contador sobre o regime tributário mais adequado',
        'Verificar se os percentuais informados estão corretos',
        'Recalcular o cenário com deduções revisadas antes de definir o preço',
      ],
    },
  },

  // ─── 17. margem_pressionada ─────────────────────────────────────────
  {
    condition: (c) =>
      c.estimatedMarginPercent < c.desiredMarginPercent,
    playbook: {
      id: 'margem_pressionada',
      title: 'Margem abaixo do desejado',
      category: 'margin',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'A margem estimada está abaixo da margem desejada informada.',
      objective:
        'Identificar e corrigir o desequilíbrio entre a margem desejada e a margem real estimada.',
      whyItMatters:
        'Quando a margem estimada fica abaixo da meta, a clínica opera com retorno menor do que o planejado.',
      recommendedAction:
        'Revisar o preço sugerido, os custos informados ou a margem desejada para alinhar as expectativas à realidade.',
      expectedImpact:
        'Maior alinhamento entre margem desejada e margem real, com mais controle sobre a rentabilidade do procedimento.',
      checklist: [
        'Comparar a margem estimada com a desejada e calcular a diferença',
        'Verificar se há custo que pode ser reduzido para aproximar as margens',
        'Avaliar se um reajuste de preço é viável no contexto da clínica',
        'Considerar revisar a meta de margem para um valor mais realista se os custos não puderem ser reduzidos',
      ],
    },
  },

  // ═══ PLAYBOOKS COMPOSTOS (Bloco 4B) ══════════════════════════════

  // ─── 19. custo_alto_mais_preco_baixo ────────────────────────────────
  {
    condition: (c) =>
      c.materialCost / c.directCost > 0.5 &&
      c.currentPriceStatus === 'belowSuggested',
    playbook: {
      id: 'custo_alto_mais_preco_baixo',
      title: 'Custo alto com preço abaixo do sugerido',
      subtitle: 'Material domina o custo e o preço praticado não cobre a margem',
      category: 'pricing',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O custo de materiais supera 50% do custo direto e o preço atual está abaixo do sugerido.',
      objective:
        'Corrigir a combinação de custo de material elevado com preço praticado insuficiente.',
      whyItMatters:
        'Materiais que dominam o custo direto exigem preços mais altos; praticar um preço abaixo do sugerido agrava diretamente a margem.',
      recommendedAction:
        'Revisar o custo de material e ajustar o preço praticado para pelo menos o valor sugerido calculado.',
      expectedImpact:
        'Recuperação da margem pressionada pela combinação de custo de insumo elevado e preço defasado.',
      checklist: [
        'Revisar fornecedores de material e negociar custo ou volume',
        'Calcular o novo preço mínimo após qualquer redução de custo',
        'Ajustar o preço praticado ao valor sugerido',
        'Comunicar o reajuste ao paciente com antecedência',
      ],
    },
  },

  // ─── 20. laboratorio_alto_mais_preco_critico ────────────────────────
  {
    condition: (c, d) =>
      c.labCost / c.directCost > 0.4 && d.status === 'critical',
    playbook: {
      id: 'laboratorio_alto_mais_preco_critico',
      title: 'Laboratório dominante com diagnóstico crítico',
      subtitle: 'Custo de laboratório elevado em cenário de risco financeiro crítico',
      category: 'lab',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O custo de laboratório supera 40% do custo direto e o diagnóstico é crítico.',
      objective:
        'Resolver o cenário onde laboratório pesado e diagnóstico crítico se combinam para inviabilizar o procedimento.',
      whyItMatters:
        'Laboratório dominante com diagnóstico crítico indica que o procedimento pode estar gerando prejuízo a cada execução.',
      recommendedAction:
        'Renegociar o custo de laboratório e revisar urgentemente o preço praticado antes de qualquer novo atendimento.',
      expectedImpact:
        'Eliminação do risco de prejuízo por procedimento com custo de laboratório crítico.',
      checklist: [
        'Não realizar o procedimento sem revisar o preço',
        'Renegociar o custo com o laboratório atual ou buscar alternativas',
        'Recalcular o preço mínimo e sugerido após redução do custo de lab',
        'Definir um preço de transição antes de comunicar ao paciente',
      ],
    },
  },

  // ─── 21. tempo_alto_mais_margem_baixa ───────────────────────────────
  {
    condition: (c) =>
      c.clinicalTimeCost / c.directCost > 0.75 &&
      c.estimatedMarginPercent < c.desiredMarginPercent,
    playbook: {
      id: 'tempo_alto_mais_margem_baixa',
      title: 'Tempo clínico alto com margem abaixo da meta',
      subtitle: 'Tempo domina o custo e a margem fica abaixo do desejado',
      category: 'time',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O tempo clínico supera 75% do custo direto e a margem estimada está abaixo da desejada.',
      objective:
        'Resolver a combinação de tempo clínico excessivo com margem insuficiente.',
      whyItMatters:
        'Quando o tempo domina o custo e a margem já está pressionada, cada minuto adicional de atendimento reduz diretamente o retorno.',
      recommendedAction:
        'Revisar a eficiência do protocolo clínico, o valor da hora e o preço do procedimento.',
      expectedImpact:
        'Recuperação da margem através de redução de tempo, aumento do valor da hora ou ajuste de preço.',
      checklist: [
        'Confirmar o tempo real do procedimento — pode estar superestimado',
        'Revisar o protocolo para identificar etapas que podem ser otimizadas',
        'Recalcular com tempo reduzido para verificar o impacto na margem',
        'Ajustar o preço caso o tempo não possa ser reduzido',
      ],
    },
  },

  // ─── 22. deducoes_altas_mais_margem_baixa ───────────────────────────
  {
    condition: (c) =>
      c.deductionPercent > 15 &&
      c.estimatedMarginPercent < c.desiredMarginPercent,
    playbook: {
      id: 'deducoes_altas_mais_margem_baixa',
      title: 'Deduções elevadas com margem pressionada',
      subtitle: 'Taxas e impostos altos corroem a margem já abaixo da meta',
      category: 'fees',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'As deduções de taxas e impostos superam 15% e a margem estimada está abaixo da desejada.',
      objective:
        'Corrigir o impacto combinado de deduções elevadas com margem já pressionada.',
      whyItMatters:
        'Deduções altas somadas a margem baixa indicam que o preço atual não consegue absorver os dois fatores simultaneamente.',
      recommendedAction:
        'Revisar as deduções (taxa de cartão, regime tributário) e ajustar o preço para recuperar a margem.',
      expectedImpact:
        'Restauração da margem desejada após revisão das deduções ou reajuste do preço.',
      checklist: [
        'Verificar se a taxa da maquininha pode ser reduzida negociando com a operadora',
        'Consultar contador sobre o regime tributário mais adequado ao perfil da clínica',
        'Recalcular o preço sugerido com deduções revisadas',
        'Definir meta de margem realista considerando as deduções do contexto atual',
      ],
    },
  },

  // ─── 23. tempo_alto_preco_abaixo_minimo ─────────────────────────────
  {
    condition: (c) =>
      c.clinicalTimeCost / c.directCost > 0.75 &&
      c.currentPriceStatus === 'belowMinimum',
    playbook: {
      id: 'tempo_alto_preco_abaixo_minimo',
      title: 'Tempo clínico alto com preço abaixo do mínimo',
      subtitle: 'Tempo domina o custo e o preço não cobre nem os custos estimados',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O tempo clínico supera 75% do custo direto e o preço atual está abaixo do mínimo necessário.',
      objective:
        'Corrigir a situação de máximo risco: tempo alto com preço que não cobre nem os custos.',
      whyItMatters:
        'Esta combinação representa prejuízo garantido: o procedimento ocupa muito tempo de cadeira e o preço praticado não cobre o custo estimado.',
      recommendedAction:
        'Revisar imediatamente o preço praticado. Não realizar o procedimento nestas condições sem ajuste urgente.',
      expectedImpact:
        'Eliminação imediata do prejuízo por procedimento e estabelecimento de um piso de preço compatível com o tempo investido.',
      checklist: [
        'Suspender o preço atual até definir um novo valor',
        'Calcular o preço mínimo considerando o tempo real do procedimento',
        'Verificar se o tempo pode ser reduzido por otimização de protocolo',
        'Definir e comunicar o novo preço com urgência',
      ],
    },
  },

  // ─── 24. laboratorio_alto_material_alto ─────────────────────────────
  {
    condition: (c) =>
      c.labCost / c.directCost > 0.3 &&
      c.materialCost / c.directCost > 0.35,
    playbook: {
      id: 'laboratorio_alto_material_alto',
      title: 'Laboratório e material dominam o custo',
      subtitle: 'Dois componentes de custo externo pressionam o preço simultaneamente',
      category: 'costs',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O laboratório representa mais de 30% e os materiais mais de 35% do custo direto simultaneamente.',
      objective:
        'Identificar quando dois componentes de custo externo se combinam para pressionar o preço final.',
      whyItMatters:
        'Quando laboratório e material dominam juntos mais de 65% do custo, o preço sugerido tende a ser alto e pode reduzir a competitividade.',
      recommendedAction:
        'Rever tanto o custo de laboratório quanto o de materiais e avaliar alternativas para reduzir ao menos um dos dois.',
      expectedImpact:
        'Redução do custo total com melhora da competitividade do preço final.',
      checklist: [
        'Listar materiais com maior impacto no custo e buscar alternativas equivalentes',
        'Renegociar ou avaliar laboratórios alternativos se o custo estiver acima do mercado',
        'Recalcular o cenário após redução em ao menos um dos componentes',
        'Verificar se o preço final permanece competitivo no mercado local',
      ],
    },
  },

  // ─── 25. sem_laboratorio_preco_saudavel ─────────────────────────────
  {
    condition: (c, d) =>
      c.labCost === 0 && d.status === 'excellent',
    playbook: {
      id: 'sem_laboratorio_preco_saudavel',
      title: 'Procedimento sem laboratório e com ótima precificação',
      subtitle: 'Sem custo de lab e diagnóstico excelente — modelo de rentabilidade',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O procedimento não tem custo de laboratório e o diagnóstico é excelente.',
      objective:
        'Confirmar que o procedimento sem laboratório apresenta boa estrutura de custos e margem.',
      whyItMatters:
        'Procedimentos sem laboratório tendem a ter custo direto menor e maior margem por atendimento quando bem precificados.',
      recommendedAction:
        'Usar este cenário como referência para procedimentos diretos da clínica.',
      expectedImpact:
        'Maior previsibilidade de custo e margem consistente sem variável de laboratório.',
      checklist: [
        'Registrar como modelo de procedimento de alta rentabilidade relativa',
        'Verificar periodicamente o custo de materiais diretos',
        'Usar como referência para novos procedimentos sem laboratório',
      ],
    },
  },

  // ─── 26. reprecificacao_prioritaria ─────────────────────────────────
  {
    condition: (c, d) =>
      d.status === 'critical' && c.currentPriceStatus === 'belowMinimum',
    playbook: {
      id: 'reprecificacao_prioritaria',
      title: 'Reprecificação prioritária e urgente',
      subtitle: 'Diagnóstico crítico com preço abaixo do mínimo — ação imediata necessária',
      category: 'pricing',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O diagnóstico é crítico e o preço atual está abaixo do mínimo necessário.',
      objective:
        'Tratar com prioridade máxima o cenário de diagnóstico crítico combinado com preço abaixo do mínimo.',
      whyItMatters:
        'Este cenário representa o maior risco financeiro: diagnóstico crítico com preço que sequer cobre os custos estimados.',
      recommendedAction:
        'Reprecificar imediatamente. Não apresentar orçamento nestas condições sem revisão completa.',
      expectedImpact:
        'Eliminação do prejuízo direto e início da recuperação da rentabilidade do procedimento.',
      checklist: [
        'Identificar a causa raiz do diagnóstico crítico antes de ajustar apenas o preço',
        'Calcular o preço mínimo e aplicar como piso imediato',
        'Planejar uma transição gradual em direção ao preço sugerido',
        'Comunicar o reajuste ao paciente com transparência e profissionalismo',
      ],
    },
  },

  // ─── 27. tempo_dominante_deducoes_altas ─────────────────────────────
  {
    condition: (c) =>
      c.clinicalTimeCost / c.directCost > 0.75 && c.deductionPercent > 15,
    playbook: {
      id: 'tempo_dominante_deducoes_altas',
      title: 'Tempo dominante com deduções elevadas',
      subtitle: 'Dois fatores de pressão no preço simultâneos: tempo alto e taxas elevadas',
      category: 'fees',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O tempo clínico domina mais de 75% do custo e as deduções de taxas e impostos superam 15%.',
      objective:
        'Resolver a pressão dupla de tempo clínico alto e deduções elevadas no preço final.',
      whyItMatters:
        'Tempo alto e deduções elevadas exigem um preço sugerido significativamente acima do custo direto, o que pode reduzir a competitividade.',
      recommendedAction:
        'Avaliar redução do tempo clínico e revisão das deduções antes de definir o preço final.',
      expectedImpact:
        'Preço final mais equilibrado e competitivo após otimização dos dois fatores.',
      checklist: [
        'Verificar se o tempo informado está correto e se pode ser reduzido por eficiência de protocolo',
        'Revisar a taxa da maquininha e a alíquota de impostos informados',
        'Recalcular o preço com melhorias em ao menos um dos fatores',
        'Avaliar viabilidade de mercado do preço resultante',
      ],
    },
  },

  // ─── 28. oportunidade_padronizacao ──────────────────────────────────
  {
    condition: (c, d) =>
      d.status === 'excellent' && c.currentPriceStatus === 'healthy',
    playbook: {
      id: 'oportunidade_padronizacao',
      title: 'Cenário ideal para padronizar a tabela',
      subtitle: 'Diagnóstico excelente com preço saudável — referência perfeita',
      category: 'standardization',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O diagnóstico é excelente e o preço atual está igual ou acima do sugerido.',
      objective:
        'Identificar um cenário ideal para padronizar e replicar em outros procedimentos semelhantes.',
      whyItMatters:
        'Quando diagnóstico é excelente e o preço praticado já cobre a margem desejada, o cenário é um modelo sólido de referência.',
      recommendedAction:
        'Documentar os parâmetros deste procedimento e usar como base para a tabela de preços da clínica.',
      expectedImpact:
        'Consistência e previsibilidade na política de preços para procedimentos semelhantes.',
      checklist: [
        'Registrar os parâmetros de custo, tempo e margem como referência',
        'Criar ou atualizar uma categoria para procedimentos semelhantes na tabela',
        'Revisitar periodicamente para manter a referência com custos atualizados',
        'Compartilhar como referência com a equipe da clínica',
      ],
    },
  },

  // ─── 29. procedimento_inviavel_sem_reajuste ──────────────────────────
  {
    condition: (c, d) =>
      c.estimatedProfit <= 0 ||
      (d.status === 'critical' && c.currentPriceStatus === 'belowMinimum'),
    playbook: {
      id: 'procedimento_inviavel_sem_reajuste',
      title: 'Procedimento inviável sem reajuste',
      subtitle: 'Lucro nulo ou negativo combinado com risco crítico — ação urgente',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O lucro estimado está zerado ou negativo, ou o diagnóstico é crítico com preço abaixo do mínimo.',
      objective:
        'Sinalizar com urgência máxima que o procedimento não deve ser realizado nas condições atuais.',
      whyItMatters:
        'Lucro nulo ou negativo representa prejuízo garantido a cada atendimento realizado nas condições atuais.',
      recommendedAction:
        'Suspender o preço atual e revisar todo o cenário antes de qualquer orçamento ou atendimento.',
      expectedImpact:
        'Eliminação do risco de prejuízo e início de uma nova estrutura de preço viável.',
      checklist: [
        'Não apresentar orçamento nas condições atuais',
        'Revisar todos os custos informados para garantir que estão corretos',
        'Recalcular o preço mínimo e aplicar como piso imediato',
        'Planejar comunicação profissional do reajuste ao paciente',
      ],
    },
  },

  // ─── 30. excelente_rentabilidade ────────────────────────────────────
  {
    condition: (c, d) =>
      d.status === 'excellent' &&
      c.estimatedMarginPercent >= c.desiredMarginPercent &&
      c.currentPriceStatus === 'healthy',
    playbook: {
      id: 'excelente_rentabilidade',
      title: 'Excelente rentabilidade — benchmark da clínica',
      subtitle: 'Margem acima da meta, preço saudável e diagnóstico excelente',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O diagnóstico é excelente, a margem estimada supera a desejada e o preço atual está saudável.',
      objective:
        'Identificar um cenário de rentabilidade máxima e usá-lo como referência estratégica.',
      whyItMatters:
        'Cenários com excelente diagnóstico, margem acima da meta e preço saudável são modelos que merecem ser documentados como benchmark.',
      recommendedAction:
        'Documentar como modelo de rentabilidade para este procedimento e usar como referência em análises futuras.',
      expectedImpact:
        'Padronização de um benchmark de rentabilidade para a política de preços da clínica.',
      checklist: [
        'Registrar os parâmetros completos como benchmark de rentabilidade',
        'Avaliar se outros procedimentos podem ser otimizados para alcançar esse perfil',
        'Revisitar periodicamente para manter a referência atualizada',
      ],
    },
  },

  // ─── 18. oportunidade_de_padronizar_tabela ──────────────────────────
  {
    condition: (_c, d) =>
      d.status === 'excellent' || d.status === 'healthy',
    playbook: {
      id: 'oportunidade_de_padronizar_tabela',
      title: 'Use como referência de tabela',
      category: 'standardization',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O cenário está equilibrado e pode servir como referência para a tabela de procedimentos.',
      objective:
        'Usar o cenário atual como base para padronizar a política de preços da clínica.',
      whyItMatters:
        'Cenários bem estruturados reduzem o tempo de análise em novas precificações e aumentam a consistência comercial.',
      recommendedAction:
        'Registrar os parâmetros deste cenário como referência de precificação padrão para procedimentos similares.',
      expectedImpact:
        'Consistência na tabela de preços e redução do tempo gasto em precificações futuras.',
      checklist: [
        'Registrar os parâmetros de custo e margem deste procedimento',
        'Criar ou atualizar uma categoria para procedimentos semelhantes na tabela',
        'Revisitar o modelo a cada mudança relevante nos custos ou no regime tributário',
        'Compartilhar como referência com a equipe administrativa da clínica',
      ],
    },
  },
]

// ── Função principal ───────────────────────────────────────────────────

export function getPrecificacaoPlaybooks(
  calculation: PrecificacaoCalculationResult,
  diagnostic: PrecificacaoDiagnosticResult,
): PrecificacaoPlaybookResult {
  const applicable = PLAYBOOK_DEFINITIONS.filter(({ condition }) =>
    condition(calculation, diagnostic),
  ).map(({ playbook }) => playbook)

  const deduplicated = deduplicateById(applicable)

  return { playbooks: sortByPriority(deduplicated) }
}

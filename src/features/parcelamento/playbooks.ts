import type {
  ParcelamentoCalculationResult,
  ParcelamentoDiagnosticResult,
  ParcelamentoPlaybook,
  ParcelamentoPlaybookPriority,
  ParcelamentoPlaybookResult,
} from './types'

// ── Ordenação ──────────────────────────────────────────────────────────

const PRIORITY_WEIGHT: Record<ParcelamentoPlaybookPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function sortByPriority(playbooks: ParcelamentoPlaybook[]): ParcelamentoPlaybook[] {
  return [...playbooks].sort(
    (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
  )
}

// ── Definições dos playbooks ───────────────────────────────────────────

interface PlaybookDefinition {
  condition: (
    c: ParcelamentoCalculationResult,
    d: ParcelamentoDiagnosticResult,
  ) => boolean
  playbook: ParcelamentoPlaybook
}

const PLAYBOOK_DEFINITIONS: PlaybookDefinition[] = [
  // ─── 1. parcelamento_saudavel ─────────────────────────────────────
  {
    condition: (_c, d) =>
      d.status === 'excellent' || d.status === 'healthy',
    playbook: {
      id: 'parcelamento_saudavel',
      title: 'Parcelamento saudável',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O cenário geral apresenta equilíbrio financeiro satisfatório.',
      objective:
        'Manter a proposta atrativa para o paciente sem comprometer o recebimento líquido.',
      whyItMatters:
        'Cenários equilibrados permitem fechar propostas com segurança e previsibilidade de caixa.',
      recommendedAction:
        'Usar este cenário como referência segura para apresentar a proposta ao paciente.',
      expectedImpact:
        'Proposta fechada com margem preservada e menor risco financeiro para a clínica.',
      checklist: [
        'Confirmar os valores com o calculador antes da apresentação',
        'Verificar se o prazo está alinhado com a expectativa do paciente',
        'Documentar o cenário como referência para propostas similares',
      ],
    },
  },

  // ─── 2. taxas_controladas ─────────────────────────────────────────
  {
    condition: (c) => c.effectiveFeePercent <= 5,
    playbook: {
      id: 'taxas_controladas',
      title: 'Taxas controladas',
      category: 'fees',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'low',
      trigger: 'A perda efetiva em taxas está abaixo de 5%.',
      objective:
        'Confirmar que os custos financeiros estão dentro de uma faixa confortável.',
      whyItMatters:
        'Taxas abaixo de 5% tendem a ter impacto limitado na margem do tratamento.',
      recommendedAction:
        'Manter o cenário atual e revisar periodicamente as taxas da operadora.',
      expectedImpact:
        'Resultado líquido preservado com custo financeiro mínimo.',
      checklist: [
        'Confirmar a taxa atual da maquininha com a operadora',
        'Verificar se há taxas diferenciadas para menos parcelas',
        'Revisar as condições de parcelamento a cada semestre',
      ],
    },
  },

  // ─── 3. taxas_em_atencao ─────────────────────────────────────────
  {
    condition: (c) => c.effectiveFeePercent > 5 && c.effectiveFeePercent <= 10,
    playbook: {
      id: 'taxas_em_atencao',
      title: 'Taxas exigem atenção',
      category: 'fees',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'A perda efetiva em taxas está entre 5% e 10%.',
      objective:
        'Evitar que pequenas taxas acumuladas reduzam a margem do tratamento.',
      whyItMatters:
        'Taxas nesta faixa começam a comprimir a margem e podem se tornar relevantes em tratamentos de maior valor.',
      recommendedAction:
        'Comparar o recebimento no fluxo com a antecipação antes de fechar a proposta.',
      expectedImpact:
        'Decisão mais consciente sobre o formato de recebimento, preservando parte da margem.',
      checklist: [
        'Simular o cenário sem antecipação e comparar o líquido',
        'Avaliar se reduzir o número de parcelas reduz as taxas',
        'Considerar embutir parte do custo no valor do tratamento',
        'Verificar se a operadora oferece taxa menor para prazos menores',
      ],
    },
  },

  // ─── 4. taxas_altas ──────────────────────────────────────────────
  {
    condition: (c) =>
      c.effectiveFeePercent > 10 && c.effectiveFeePercent <= 18,
    playbook: {
      id: 'taxas_altas',
      title: 'Taxas pressionam a rentabilidade',
      category: 'fees',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'A perda efetiva em taxas está entre 10% e 18%.',
      objective:
        'Reduzir o impacto financeiro das taxas antes de apresentar a proposta final.',
      whyItMatters:
        'Nesta faixa, as taxas já afetam de forma relevante o resultado líquido e podem comprometer a viabilidade do tratamento.',
      recommendedAction:
        'Considerar reduzir o número de parcelas, negociar taxas ou embutir parte do custo no valor final.',
      expectedImpact:
        'Redução do impacto financeiro e recuperação parcial da margem perdida.',
      checklist: [
        'Simular o mesmo tratamento com menos parcelas',
        'Calcular o valor reajustado para neutralizar as taxas',
        'Avaliar se uma entrada inicial reduz o prazo e as taxas',
        'Considerar oferecer desconto para pagamento à vista como alternativa',
        'Revisar se a antecipação está sendo usada e contribui para elevar as taxas',
      ],
    },
  },

  // ─── 5. taxas_criticas ───────────────────────────────────────────
  {
    condition: (c) => c.effectiveFeePercent > 18,
    playbook: {
      id: 'taxas_criticas',
      title: 'Taxas comprometem o resultado',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'A perda efetiva em taxas ultrapassa 18%.',
      objective:
        'Evitar que o tratamento seja vendido com margem insuficiente.',
      whyItMatters:
        'Com mais de 18% de perda efetiva, o resultado líquido pode estar abaixo do necessário para cobrir custos da clínica.',
      recommendedAction:
        'Revisar a proposta antes de apresentar ao paciente, principalmente se houver antecipação total.',
      expectedImpact:
        'Proposta reajustada que proteja a viabilidade financeira do tratamento.',
      checklist: [
        'Não apresentar a proposta sem revisar o valor',
        'Simular o tratamento com menos parcelas e menor antecipação',
        'Calcular e aplicar o reajuste sugerido pelo calculador',
        'Avaliar se uma entrada reduz o risco financeiro',
        'Considerar parcelamento interno como alternativa à maquininha',
      ],
    },
  },

  // ─── 6. antecipacao_sem_custo ────────────────────────────────────
  {
    condition: (c) => c.anticipationCost === 0,
    playbook: {
      id: 'antecipacao_sem_custo',
      title: 'Sem custo de antecipação',
      category: 'cashflow',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'low',
      trigger: 'Nenhuma taxa de antecipação foi considerada neste cenário.',
      objective:
        'Aproveitar um cenário financeiro mais simples e previsível.',
      whyItMatters:
        'Sem custo de antecipação, o resultado líquido depende apenas da taxa da maquininha, tornando o planejamento mais direto.',
      recommendedAction:
        'Usar o valor líquido no fluxo como base principal de decisão.',
      expectedImpact:
        'Previsibilidade de recebimento sem variáveis adicionais de custo.',
      checklist: [
        'Confirmar que não haverá necessidade de antecipar os recebíveis',
        'Planejar o fluxo de caixa considerando o recebimento parcelado',
        'Manter reserva para cobrir os primeiros meses sem antecipação',
      ],
    },
  },

  // ─── 7. antecipacao_moderada ─────────────────────────────────────
  {
    condition: (c) =>
      c.anticipationCost > 0 &&
      c.differenceBetweenFlowAndAnticipated <= c.treatmentValue * 0.05,
    playbook: {
      id: 'antecipacao_moderada',
      title: 'Antecipação com impacto moderado',
      category: 'cashflow',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O custo de antecipação representa até 5% do valor do tratamento.',
      objective:
        'Avaliar se receber antes compensa a pequena perda financeira.',
      whyItMatters:
        'Com impacto moderado, a antecipação pode ser viável quando há necessidade pontual de caixa.',
      recommendedAction:
        'Antecipar pode fazer sentido se houver necessidade de caixa, pagamento de laboratório ou compra de materiais.',
      expectedImpact:
        'Liquidez imediata com custo controlado, desde que a necessidade financeira justifique.',
      checklist: [
        'Avaliar se há necessidade real de caixa imediato',
        'Comparar o custo de antecipação com o custo de um empréstimo alternativo',
        'Verificar se o laboratório ou fornecedor exige pagamento antecipado',
        'Decidir conscientemente entre receber no fluxo ou antecipar',
      ],
    },
  },

  // ─── 8. antecipacao_cara ─────────────────────────────────────────
  {
    condition: (c) =>
      c.differenceBetweenFlowAndAnticipated > c.treatmentValue * 0.05 &&
      c.differenceBetweenFlowAndAnticipated <= c.treatmentValue * 0.12,
    playbook: {
      id: 'antecipacao_cara',
      title: 'Antecipação reduz o recebimento',
      category: 'cashflow',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'low',
      financialImpactLevel: 'high',
      trigger:
        'A antecipação representa entre 5% e 12% do valor do tratamento.',
      objective:
        'Evitar que a pressa por caixa reduza desnecessariamente o resultado líquido.',
      whyItMatters:
        'Nesta faixa, a antecipação começa a impactar de forma relevante o valor efetivamente recebido pela clínica.',
      recommendedAction:
        'Priorizar recebimento no fluxo quando o caixa permitir, ou antecipar apenas parte do valor.',
      expectedImpact:
        'Preservação de parte do resultado líquido sem comprometer totalmente a necessidade de caixa.',
      checklist: [
        'Verificar se antecipar todo o valor é realmente necessário',
        'Avaliar a possibilidade de antecipar apenas as primeiras parcelas',
        'Planejar o caixa para receber o restante no fluxo',
        'Considerar reajustar o valor do tratamento para compensar o custo',
      ],
    },
  },

  // ─── 9. antecipacao_critica ──────────────────────────────────────
  {
    condition: (c) =>
      c.differenceBetweenFlowAndAnticipated > c.treatmentValue * 0.12,
    playbook: {
      id: 'antecipacao_critica',
      title: 'Antecipação pode consumir parte importante do lucro',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'A antecipação representa mais de 12% do valor do tratamento.',
      objective: 'Proteger a margem líquida do tratamento.',
      whyItMatters:
        'Com esse nível de custo, a antecipação total pode comprometer significativamente o resultado financeiro do procedimento.',
      recommendedAction:
        'Evitar antecipação total neste cenário, salvo necessidade financeira urgente e consciente.',
      expectedImpact:
        'Preservação da margem líquida e redução de risco financeiro para a clínica.',
      checklist: [
        'Não antecipar o total sem antes simular o impacto no resultado',
        'Avaliar se há alternativas de caixa com custo menor',
        'Considerar reajuste no valor do tratamento antes de fechar',
        'Revisar o número de parcelas para reduzir o custo de antecipação',
        'Documentar a decisão e o impacto caso a antecipação seja necessária',
      ],
    },
  },

  // ─── 10. reajuste_recomendado ─────────────────────────────────────
  {
    condition: (c) =>
      c.suggestedAdjustmentAmount > c.treatmentValue * 0.08 &&
      c.suggestedAdjustmentAmount <= c.treatmentValue * 0.15,
    playbook: {
      id: 'reajuste_recomendado',
      title: 'Reajuste recomendado',
      category: 'pricing',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O reajuste necessário para neutralizar taxas representa entre 8% e 15% do valor.',
      objective:
        'Neutralizar o impacto das taxas sem reduzir a margem planejada.',
      whyItMatters:
        'Sem reajuste, a clínica absorve os custos financeiros e reduz sua margem real.',
      recommendedAction:
        'Considerar apresentar o tratamento já com o valor reajustado ou criar uma condição diferente para pagamento à vista.',
      expectedImpact:
        'Margem preservada após o desconto das taxas financeiras.',
      checklist: [
        'Calcular o valor sugerido com o reajuste já aplicado',
        'Preparar duas versões da proposta: com e sem parcelamento',
        'Oferecer desconto para pagamento à vista como alternativa',
        'Verificar se o valor reajustado permanece competitivo no mercado',
      ],
    },
  },

  // ─── 11. reajuste_critico ─────────────────────────────────────────
  {
    condition: (c) =>
      c.suggestedAdjustmentAmount > c.treatmentValue * 0.15,
    playbook: {
      id: 'reajuste_critico',
      title: 'Preço atual pode não proteger a margem',
      category: 'pricing',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'O reajuste necessário representa mais de 15% do valor do tratamento.',
      objective:
        'Evitar que a clínica absorva custos financeiros excessivos.',
      whyItMatters:
        'Neste cenário, vender sem reajuste significa cobrir os custos financeiros com a margem da clínica.',
      recommendedAction:
        'Revisar o valor total do tratamento antes de fechar a proposta parcelada.',
      expectedImpact:
        'Proposta financeiramente viável que preserva a saúde da operação.',
      checklist: [
        'Não apresentar a proposta sem aplicar o reajuste ou revisar o prazo',
        'Calcular e considerar o valor sugerido pelo simulador',
        'Avaliar se menos parcelas reduzem a necessidade de reajuste',
        'Verificar se a proposta à vista seria mais vantajosa para o paciente',
        'Documentar a decisão de preço tomada antes do fechamento',
      ],
    },
  },

  // ─── 12. parcelamento_longo ───────────────────────────────────────
  {
    condition: (c) => c.installments > 12,
    playbook: {
      id: 'parcelamento_longo',
      title: 'Parcelamento muito longo',
      category: 'installments',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger: 'O número de parcelas é superior a 12.',
      objective:
        'Reduzir o risco financeiro de uma proposta excessivamente alongada.',
      whyItMatters:
        'Parcelamentos acima de 12x amplificam o custo de antecipação e aumentam o risco de inadimplência ao longo do tempo.',
      recommendedAction:
        'Testar alternativas com menor número de parcelas ou entrada inicial maior.',
      expectedImpact:
        'Redução do custo financeiro acumulado e menor exposição ao risco de não recebimento.',
      checklist: [
        'Simular o mesmo tratamento com 6 ou 12 parcelas',
        'Avaliar se uma entrada inicial permite reduzir o prazo',
        'Verificar o impacto no valor da parcela para o paciente',
        'Considerar dividir o tratamento em etapas com cobranças separadas',
        'Avaliar se o parcelamento interno seria mais adequado neste caso',
      ],
    },
  },

  // ─── 13. parcelamento_equilibrado ────────────────────────────────
  {
    condition: (c) => c.installments > 3 && c.installments <= 6,
    playbook: {
      id: 'parcelamento_equilibrado',
      title: 'Parcelamento equilibrado',
      category: 'sales',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O número de parcelas está entre 4 e 6.',
      objective:
        'Manter uma proposta acessível para o paciente com custo financeiro controlável.',
      whyItMatters:
        'Prazos entre 4 e 6 parcelas tendem a equilibrar bem a acessibilidade para o paciente e o custo financeiro para a clínica.',
      recommendedAction:
        'Manter este prazo como padrão para tratamentos de médio valor e usar como referência em propostas similares.',
      expectedImpact:
        'Proposta competitiva com custo financeiro dentro de uma faixa aceitável.',
      checklist: [
        'Confirmar que o valor da parcela está dentro da capacidade do paciente',
        'Verificar se o prazo está alinhado com a duração do tratamento',
        'Usar este cenário como referência para a tabela padrão da clínica',
      ],
    },
  },

  // ─── 14. parcelamento_extenso ─────────────────────────────────────
  {
    condition: (c) => c.installments > 6 && c.installments <= 12,
    playbook: {
      id: 'parcelamento_extenso',
      title: 'Parcelamento exige atenção',
      category: 'installments',
      priority: 'medium',
      urgency: 'medium',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O número de parcelas está entre 7 e 12.',
      objective:
        'Avaliar se o prazo escolhido não compromete o resultado líquido de forma desnecessária.',
      whyItMatters:
        'Acima de 6 parcelas, o custo de antecipação começa a acumular e pode impactar de forma relevante o recebimento.',
      recommendedAction:
        'Avaliar se o paciente aceitaria um prazo menor ou uma entrada que reduza o número de parcelas.',
      expectedImpact:
        'Redução moderada do custo financeiro e melhora no resultado líquido.',
      checklist: [
        'Simular o cenário com 6 parcelas e comparar o líquido',
        'Verificar se uma entrada inicial viabiliza prazo menor',
        'Confirmar se o prazo está alinhado com a duração do tratamento',
        'Revisar o impacto das taxas acumuladas neste número de parcelas',
      ],
    },
  },

  // ─── 15. entrada_para_proteger_margem ────────────────────────────
  {
    condition: (c) =>
      c.effectiveFeePercent > 10 || c.installments > 10,
    playbook: {
      id: 'entrada_para_proteger_margem',
      title: 'Entrada pode proteger a margem',
      category: 'sales',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'As taxas efetivas ultrapassam 10% ou o parcelamento é superior a 10 vezes.',
      objective:
        'Reduzir o valor financiado com uma entrada inicial, melhorando o resultado líquido.',
      whyItMatters:
        'Uma entrada reduz o valor parcelado, diminuindo proporcionalmente o custo de taxa e antecipação.',
      recommendedAction:
        'Considerar uma entrada inicial para reduzir o valor financiado e melhorar o recebimento líquido.',
      expectedImpact:
        'Redução do custo financeiro proporcional ao valor da entrada e melhora na margem líquida.',
      checklist: [
        'Simular o cenário com 20% ou 30% de entrada',
        'Verificar se o paciente tem disponibilidade para uma entrada',
        'Calcular o novo valor financiado e as novas taxas',
        'Apresentar a diferença no líquido como argumento de precificação',
      ],
    },
  },

  // ─── 16. receber_no_fluxo ────────────────────────────────────────
  {
    condition: (c) =>
      c.differenceBetweenFlowAndAnticipated > c.treatmentValue * 0.05,
    playbook: {
      id: 'receber_no_fluxo',
      title: 'Receber no fluxo pode ser melhor',
      category: 'cashflow',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'low',
      financialImpactLevel: 'high',
      trigger:
        'A diferença entre receber no fluxo e antecipar ultrapassa 5% do valor do tratamento.',
      objective:
        'Preservar o resultado líquido optando por receber mês a mês quando possível.',
      whyItMatters:
        'Neste cenário, a antecipação custa mais do que o benefício de ter o dinheiro imediatamente.',
      recommendedAction:
        'Se o caixa permitir, receber mês a mês preserva mais valor líquido.',
      expectedImpact:
        'Aumento do valor líquido total recebido pelo procedimento.',
      checklist: [
        'Avaliar o saldo de caixa disponível antes de decidir pela antecipação',
        'Verificar se há obrigações financeiras que exigem caixa imediato',
        'Considerar antecipar apenas o necessário, não o total',
        'Planejar o fluxo de caixa considerando os recebimentos mensais',
      ],
    },
  },

  // ─── 17. proposta_mais_segura ─────────────────────────────────────
  {
    condition: (_c, d) =>
      d.status === 'attention' || d.status === 'critical',
    playbook: {
      id: 'proposta_mais_segura',
      title: 'Proposta precisa ser revisada',
      category: 'risk',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O diagnóstico geral indica atenção ou nível crítico no cenário.',
      objective:
        'Evitar fechar um acordo financeiramente desfavorável para a clínica.',
      whyItMatters:
        'Apresentar uma proposta sem revisão pode resultar em margens insuficientes ou recebimento abaixo do esperado.',
      recommendedAction:
        'Antes de apresentar ao paciente, simule menos parcelas, entrada inicial ou reajuste no valor total.',
      expectedImpact:
        'Proposta revisada com menor risco financeiro e margem mais protegida.',
      checklist: [
        'Não fechar a proposta sem simular pelo menos uma alternativa',
        'Testar o cenário com menos parcelas',
        'Calcular o impacto de uma entrada de 20%',
        'Aplicar o reajuste sugerido e verificar a nova parcela',
        'Comparar o resultado líquido antes e depois da revisão',
      ],
    },
  },

  // ─── 18. oportunidade_de_padronizacao ────────────────────────────
  {
    condition: (_c, d) =>
      d.status === 'excellent' || d.status === 'healthy',
    playbook: {
      id: 'oportunidade_de_padronizacao',
      title: 'Use como modelo de proposta',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger: 'O cenário está equilibrado e pode servir como referência.',
      objective:
        'Padronizar propostas similares com base num cenário financeiramente saudável.',
      whyItMatters:
        'Cenários validados como saudáveis podem se tornar a base de uma tabela de parcelamento padrão da clínica.',
      recommendedAction:
        'Este cenário pode servir como referência para propostas semelhantes da clínica.',
      expectedImpact:
        'Consistência nas propostas e redução do tempo de análise financeira em futuras negociações.',
      checklist: [
        'Registrar os parâmetros deste cenário (prazo, taxa, valor)',
        'Usar como referência na tabela de parcelamento da clínica',
        'Compartilhar com a equipe como modelo de proposta segura',
        'Revisitar o modelo a cada mudança nas taxas da operadora',
      ],
    },
  },

  // ═══ PLAYBOOKS COMPOSTOS (Bloco 3B) ══════════════════════════════

  // ─── 19. alta_taxa_mais_parcelamento_longo ────────────────────────
  {
    condition: (c) =>
      c.effectiveFeePercent > 10 && c.installments > 10,
    playbook: {
      id: 'alta_taxa_mais_parcelamento_longo',
      title: 'Taxas altas com parcelamento longo',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'A perda efetiva em taxas ultrapassa 10% e o número de parcelas supera 10.',
      objective:
        'Evitar que a combinação entre prazo longo e taxas elevadas reduza demais o recebimento líquido.',
      whyItMatters:
        'Taxas elevadas e prazo longo amplificam o custo acumulado de antecipação, podendo comprometer severamente o valor recebido.',
      recommendedAction:
        'Testar uma proposta com menos parcelas, entrada inicial ou reajuste parcial do valor total.',
      expectedImpact:
        'Redução significativa do custo acumulado e recuperação do valor líquido recebido.',
      checklist: [
        'Simular o cenário com 6 parcelas e comparar o líquido',
        'Calcular o impacto de uma entrada de 20% a 30%',
        'Verificar o valor líquido com e sem antecipação',
        'Aplicar o reajuste sugerido antes de apresentar ao paciente',
      ],
    },
  },

  // ─── 20. antecipacao_mais_reajuste_critico ────────────────────────
  {
    condition: (c) =>
      c.differenceBetweenFlowAndAnticipated > c.treatmentValue * 0.12 &&
      c.suggestedAdjustmentAmount > c.treatmentValue * 0.15,
    playbook: {
      id: 'antecipacao_mais_reajuste_critico',
      title: 'Antecipação e reajuste em zona crítica',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'O custo de antecipação supera 12% e o reajuste necessário ultrapassa 15% do valor do tratamento.',
      objective:
        'Evitar fechar uma proposta em que antecipação e taxas exigem correção relevante de preço.',
      whyItMatters:
        'A combinação de antecipação cara e reajuste crítico indica que a clínica pode estar absorvendo duplo custo sem compensação adequada.',
      recommendedAction:
        'Redesenhar a proposta antes de apresentar ao paciente, considerando entrada, menos parcelas ou outra forma de pagamento.',
      expectedImpact:
        'Proposta reformulada que equilibra necessidade de caixa com proteção de margem.',
      checklist: [
        'Não apresentar a proposta sem reformular o cenário',
        'Simular com entrada inicial mais parcelas reduzidas',
        'Calcular o novo líquido após a reformulação',
        'Avaliar pagamento à vista como alternativa principal',
      ],
    },
  },

  // ─── 21. valor_liquido_comprimido ────────────────────────────────
  {
    condition: (c) =>
      c.netValueAnticipated < c.treatmentValue * 0.75,
    playbook: {
      id: 'valor_liquido_comprimido',
      title: 'Valor líquido muito comprimido',
      category: 'margin',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O valor líquido após taxas e antecipação ficou abaixo de 75% do valor bruto do tratamento.',
      objective:
        'Alertar quando o valor recebido fica distante do valor bruto, comprometendo a viabilidade financeira.',
      whyItMatters:
        'Perder mais de 25% do valor em taxas e antecipação pode inviabilizar o tratamento, mesmo que o preço cobrado pareça adequado.',
      recommendedAction:
        'Evitar usar o valor bruto como referência de decisão e analisar o valor líquido antes de fechar a proposta.',
      expectedImpact:
        'Decisões baseadas no valor real recebido, não no valor nominal faturado.',
      checklist: [
        'Calcular se o valor líquido cobre os custos operacionais do procedimento',
        'Simular alternativas com menor antecipação ou menos parcelas',
        'Considerar reajuste no valor total antes de apresentar ao paciente',
        'Avaliar se o tratamento segue viável sob essas condições',
      ],
    },
  },

  // ─── 22. proposta_precisa_ser_redesenhada ─────────────────────────
  {
    condition: (c, d) =>
      d.status === 'critical' && c.effectiveFeePercent > 15,
    playbook: {
      id: 'proposta_precisa_ser_redesenhada',
      title: 'Proposta precisa ser redesenhada',
      category: 'risk',
      priority: 'critical',
      urgency: 'critical',
      implementationEffort: 'high',
      financialImpactLevel: 'high',
      trigger:
        'O diagnóstico indica nível crítico e a perda efetiva em taxas ultrapassa 15%.',
      objective:
        'Evitar apresentar uma condição comercial que comprometa o resultado financeiro da clínica.',
      whyItMatters:
        'Diagnóstico crítico combinado com taxas acima de 15% indica que o cenário atual não é sustentável para a proposta.',
      recommendedAction:
        'Recalcular o cenário com menor prazo, entrada inicial e valor total revisado.',
      expectedImpact:
        'Proposta redesenhada com viabilidade financeira real para a clínica.',
      checklist: [
        'Não apresentar nenhum valor ao paciente antes de redesenhar',
        'Simular com entrada de 30% mais 6 parcelas',
        'Aplicar o reajuste sugerido e verificar o novo resultado líquido',
        'Comparar pelo menos três cenários alternativos antes de decidir',
      ],
    },
  },

  // ─── 23. entrada_como_primeira_alternativa ─────────────────────────
  {
    condition: (c) =>
      c.installments >= 10 && c.effectiveFeePercent > 8,
    playbook: {
      id: 'entrada_como_primeira_alternativa',
      title: 'Entrada inicial como primeira alternativa',
      category: 'sales',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O parcelamento ultrapassa 10 vezes e a perda efetiva em taxas supera 8%.',
      objective:
        'Reduzir o valor sujeito a taxas com uma entrada, melhorando o recebimento líquido sem eliminar o parcelamento.',
      whyItMatters:
        'Uma entrada reduz o valor financiado e, proporcionalmente, o custo financeiro acumulado das taxas.',
      recommendedAction:
        'Simular uma entrada inicial antes de alterar totalmente a proposta de parcelamento.',
      expectedImpact:
        'Redução do custo financeiro proporcional à entrada e melhora no valor líquido recebido.',
      checklist: [
        'Simular o cenário com entrada de 20% e calcular o novo líquido',
        'Calcular o novo prazo viável após a entrada',
        'Verificar se o valor da parcela restante permanece acessível',
        'Apresentar as duas versões ao paciente como opções',
      ],
    },
  },

  // ─── 24. fluxo_melhor_que_antecipacao ────────────────────────────
  {
    condition: (c) =>
      c.differenceBetweenFlowAndAnticipated > c.cardFeeAmount,
    playbook: {
      id: 'fluxo_melhor_que_antecipacao',
      title: 'Receber no fluxo preserva mais valor',
      category: 'cashflow',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'low',
      financialImpactLevel: 'high',
      trigger:
        'A diferença entre receber no fluxo e antecipar supera o valor da própria taxa da maquininha.',
      objective:
        'Identificar quando a antecipação custa mais do que a taxa base, tornando o recebimento no fluxo mais vantajoso.',
      whyItMatters:
        'Quando o custo de antecipação supera a taxa da maquininha, antecipar equivale a pagar duas vezes pelo mesmo custo financeiro.',
      recommendedAction:
        'Se o caixa permitir, considerar receber mês a mês em vez de antecipar o total.',
      expectedImpact:
        'Preservação do valor líquido ao optar pelo recebimento natural no fluxo.',
      checklist: [
        'Comparar o líquido no fluxo com o líquido antecipado',
        'Avaliar o saldo de caixa atual antes de decidir pela antecipação',
        'Considerar antecipar apenas parte das parcelas se houver necessidade',
        'Antecipar somente se houver necessidade real e urgente de caixa',
      ],
    },
  },

  // ─── 25. proposta_competitiva_com_margem_preservada ──────────────
  {
    condition: (c, d) =>
      d.status === 'healthy' &&
      c.effectiveFeePercent <= 10 &&
      c.installments <= 6,
    playbook: {
      id: 'proposta_competitiva_com_margem_preservada',
      title: 'Proposta competitiva com margem preservada',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O diagnóstico é saudável, as taxas estão abaixo de 10% e o parcelamento é de até 6 vezes.',
      objective:
        'Identificar cenários em que a condição é atrativa para o paciente e ainda controlada para a clínica.',
      whyItMatters:
        'Este equilíbrio entre acessibilidade e custo controlado é o ponto ideal para fechar propostas com segurança.',
      recommendedAction:
        'Usar este cenário como referência comercial segura para tratamentos semelhantes.',
      expectedImpact:
        'Proposta fechada com menor risco financeiro e boa percepção de valor para o paciente.',
      checklist: [
        'Confirmar os valores antes de apresentar ao paciente',
        'Registrar este cenário como referência comercial da clínica',
        'Documentar prazo e taxa que geraram o equilíbrio',
      ],
    },
  },

  // ─── 26. parcelamento_curto_com_baixo_risco ───────────────────────
  {
    condition: (c) =>
      c.installments <= 3 && c.effectiveFeePercent <= 5,
    playbook: {
      id: 'parcelamento_curto_com_baixo_risco',
      title: 'Parcelamento curto com baixo risco',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'low',
      trigger:
        'O número de parcelas é de até 3 e a perda efetiva em taxas está abaixo de 5%.',
      objective:
        'Confirmar que o cenário possui baixa exposição financeira e pode ser fechado com segurança.',
      whyItMatters:
        'Prazo curto e taxas baixas formam a combinação ideal: mínimo custo financeiro e recebimento rápido.',
      recommendedAction:
        'Manter este modelo como referência para tratamentos com perfil semelhante.',
      expectedImpact:
        'Recebimento líquido próximo do valor bruto com mínima exposição a custos financeiros.',
      checklist: [
        'Confirmar se o paciente consegue arcar com o prazo curto',
        'Registrar como modelo de proposta com baixo risco financeiro',
        'Manter a taxa atual e revisitar periodicamente',
      ],
    },
  },

  // ─── 27. taxa_aceitavel_mas_prazo_excessivo ───────────────────────
  {
    condition: (c) =>
      c.effectiveFeePercent <= 10 && c.installments > 12,
    playbook: {
      id: 'taxa_aceitavel_mas_prazo_excessivo',
      title: 'Taxa aceitável, mas prazo excessivo',
      category: 'installments',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'A perda efetiva em taxas está abaixo de 10%, mas o número de parcelas supera 12.',
      objective:
        'Alertar que taxas moderadas podem se tornar relevantes em prazos excessivamente longos.',
      whyItMatters:
        'Mesmo taxas dentro do aceitável se acumulam ao longo de prazos muito longos, elevando o custo total de antecipação.',
      recommendedAction:
        'Testar redução do número de parcelas ou entrada inicial para encurtar o prazo.',
      expectedImpact:
        'Redução do custo acumulado sem necessidade de renegociar as taxas da operadora.',
      checklist: [
        'Simular o mesmo cenário com 6 ou 12 parcelas',
        'Calcular a diferença no custo de antecipação entre os prazos',
        'Avaliar se uma entrada viabiliza prazo menor',
        'Apresentar as alternativas ao paciente como condições diferenciadas',
      ],
    },
  },

  // ─── 28. preco_deve_embutir_custo_financeiro ─────────────────────
  {
    condition: (c) =>
      c.suggestedAdjustmentAmount > c.treatmentValue * 0.08 &&
      c.effectiveFeePercent > 10,
    playbook: {
      id: 'preco_deve_embutir_custo_financeiro',
      title: 'Preço deve considerar o custo financeiro',
      category: 'pricing',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'medium',
      financialImpactLevel: 'high',
      trigger:
        'O reajuste necessário supera 8% e a perda efetiva em taxas ultrapassa 10%.',
      objective:
        'Evitar que a clínica absorva integralmente taxas que deveriam ser consideradas na formação do preço.',
      whyItMatters:
        'Quando taxas e reajuste necessário se combinam, vender pelo preço original significa transferir custos financeiros para a margem da clínica.',
      recommendedAction:
        'Avaliar um valor final que já considere parte do custo financeiro do parcelamento.',
      expectedImpact:
        'Proposta ajustada que reflete o custo real do parcelamento sem comprometer a relação com o paciente.',
      checklist: [
        'Calcular o valor do tratamento com o reajuste já aplicado',
        'Preparar versão com parcelamento e versão à vista com desconto',
        'Verificar se o valor ajustado continua competitivo no mercado',
        'Explicar ao paciente a diferença entre as condições de pagamento',
      ],
    },
  },

  // ─── 29. risco_de_confundir_faturamento_com_recebimento ──────────
  {
    condition: (c) =>
      c.netValueAnticipated < c.treatmentValue * 0.85,
    playbook: {
      id: 'risco_de_confundir_faturamento_com_recebimento',
      title: 'Faturamento não é recebimento líquido',
      category: 'risk',
      priority: 'high',
      urgency: 'high',
      implementationEffort: 'low',
      financialImpactLevel: 'high',
      trigger:
        'O valor líquido antecipado ficou abaixo de 85% do valor bruto do tratamento.',
      objective:
        'Evitar decisões baseadas apenas no valor bruto sem considerar o valor efetivamente recebido.',
      whyItMatters:
        'Avaliar rentabilidade pelo valor faturado, e não pelo líquido, leva a análises distorcidas da saúde financeira do tratamento.',
      recommendedAction:
        'Usar sempre o valor líquido como base para avaliar se a proposta realmente preserva margem.',
      expectedImpact:
        'Análise financeira mais precisa e decisões baseadas no recebimento real.',
      checklist: [
        'Usar o valor líquido como referência de análise, não o bruto',
        'Revisar a rentabilidade do procedimento com o valor real recebido',
        'Comunicar internamente a diferença entre faturamento e recebimento',
        'Considerar o valor líquido ao calcular o custo por hora do procedimento',
      ],
    },
  },

  // ─── 30. bom_cenario_para_padronizar_politica_comercial ──────────
  {
    condition: (c, d) =>
      d.status === 'excellent' &&
      c.effectiveFeePercent <= 5 &&
      c.installments <= 6,
    playbook: {
      id: 'bom_cenario_para_padronizar_politica_comercial',
      title: 'Bom cenário para padronizar política comercial',
      category: 'opportunity',
      priority: 'low',
      urgency: 'low',
      implementationEffort: 'low',
      financialImpactLevel: 'medium',
      trigger:
        'O diagnóstico é excelente, as taxas estão abaixo de 5% e o parcelamento é de até 6 vezes.',
      objective:
        'Identificar uma condição que pode servir como modelo interno para propostas futuras.',
      whyItMatters:
        'Este cenário reúne as melhores condições: taxas mínimas, prazo controlado e resultado positivo. É o referencial ideal para política comercial.',
      recommendedAction:
        'Usar este cenário como referência inicial para políticas comerciais de parcelamento da clínica.',
      expectedImpact:
        'Política comercial baseada em parâmetros saudáveis, reduzindo riscos em propostas futuras.',
      checklist: [
        'Registrar o prazo e as taxas deste cenário como referência oficial',
        'Usar como modelo de parcelamento padrão da clínica',
        'Revisitar o modelo a cada mudança nas taxas da operadora',
        'Treinar a equipe para usar estes parâmetros como referência nas propostas',
      ],
    },
  },
]

// ── Função principal ───────────────────────────────────────────────────

export function getParcelamentoPlaybooks(
  calculation: ParcelamentoCalculationResult,
  diagnostic: ParcelamentoDiagnosticResult,
): ParcelamentoPlaybookResult {
  const applicable = PLAYBOOK_DEFINITIONS.filter(({ condition }) =>
    condition(calculation, diagnostic),
  ).map(({ playbook }) => playbook)

  return { playbooks: sortByPriority(applicable) }
}

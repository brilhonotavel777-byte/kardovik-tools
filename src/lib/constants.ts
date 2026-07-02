export const APP_NAME = 'Kisten Tools'
export const APP_DESCRIPTION =
  'Ferramentas gratuitas para clínicas odontológicas, dentistas e estudantes.'

// URL of this tools application — used for SEO, canonical, metadataBase, sitemap and robots.
export const TOOLS_URL = 'https://tools.kisten.app'

// URL of the parent company site — used for institutional links/buttons only.
export const COMPANY_URL = 'https://kisten.app'

// ── Individual tool data ───────────────────────────────────────────────

export const TOOL_PRECIFICACAO = {
  id: 'precificacao',
  title: 'Calculadora de Precificação Odontológica',
  shortTitle: 'Precificação',
  href: '/precificacao',
  question: 'Quanto devo cobrar por este procedimento?',
  description:
    'Defina preços com base em custos, tempo clínico, margem desejada e realidade financeira do procedimento.',
  category: 'Gestão Financeira',
  status: 'Gratuito' as const,
  answers: [
    'Preço mínimo recomendado para o procedimento',
    'Margem estimada sobre os custos reais',
    'Impacto dos custos de material e tempo clínico',
    'Valor sugerido para cobrança sustentável',
  ] as const,
  interpretation:
    'Não basta saber o preço final. A ferramenta ajuda a entender se o valor cobre custos, remunera o tempo clínico e preserva margem — garantindo que cada procedimento contribua para a saúde financeira da clínica.',
  action:
    'Use o resultado para ajustar sua tabela de procedimentos, identificar itens deficitários e evitar cobrar abaixo do necessário — protegendo a sustentabilidade da sua prática.',
} as const

export const TOOL_HORA_CLINICA = {
  id: 'hora-clinica',
  title: 'Calculadora de Hora Clínica',
  shortTitle: 'Hora Clínica',
  href: '/hora-clinica',
  question: 'Quanto vale a minha hora de atendimento?',
  description:
    'Descubra quanto custa cada hora da sua cadeira e entenda o impacto real do tempo ocioso.',
  category: 'Gestão de Tempo',
  status: 'Gratuito' as const,
  answers: [
    'Custo real de cada hora de atendimento',
    'Impacto do tempo ocioso na receita da clínica',
    'Meta mínima de produtividade por hora',
    'Referência para precificação baseada no tempo',
  ] as const,
  interpretation:
    'A hora clínica é o principal insumo da odontologia. Saber seu custo real permite identificar se a agenda está gerando resultado ou apenas ocupando o tempo do profissional.',
  action:
    'Use o resultado para definir metas diárias de produção, avaliar procedimentos que ocupam muito tempo com baixo retorno e tomar decisões mais precisas sobre gestão de agenda.',
} as const

export const TOOL_PARCELAMENTO = {
  id: 'parcelamento',
  title: 'Simulador de Parcelamento Odontológico',
  shortTitle: 'Parcelamento',
  href: '/parcelamento',
  question: 'Como parcelar sem comprometer minha margem?',
  description:
    'Simule parcelas, taxas e recebimento líquido para vender tratamentos sem destruir sua margem.',
  category: 'Vendas e Fluxo de Caixa',
  status: 'Gratuito' as const,
  answers: [
    'Valor líquido recebido após taxas de parcelamento',
    'Impacto da antecipação de recebíveis no resultado',
    'Comparativo entre diferentes prazos e condições',
    'Margem real após os custos de parcelamento',
  ] as const,
  interpretation:
    'Parcelar sem calcular é vender sem saber quanto vai receber de fato. A ferramenta mostra o impacto real das taxas no resultado final — permitindo decisões conscientes antes de fechar um tratamento.',
  action:
    'Use o simulador antes de apresentar condições ao paciente. Entenda quais prazos preservam sua margem e ajuste os preços de forma a compensar os custos de parcelamento.',
} as const

export const TOOL_PONTO_DE_EQUILIBRIO = {
  id: 'ponto-de-equilibrio',
  title: 'Calculadora de Ponto de Equilíbrio da Clínica',
  shortTitle: 'Ponto de Equilíbrio',
  href: '/ponto-de-equilibrio',
  question: 'Quanto preciso faturar por mês para não operar no prejuízo?',
  description:
    'Descubra quanto sua clínica precisa faturar por mês apenas para não operar no prejuízo.',
  category: 'Gestão Financeira',
  status: 'Gratuito' as const,
  answers: [
    'Faturamento mínimo mensal necessário para cobertura de custos',
    'Ponto a partir do qual a clínica começa a gerar lucro',
    'Impacto dos custos fixos e variáveis no equilíbrio',
    'Meta de produção mínima por período',
  ] as const,
  interpretation:
    'O ponto de equilíbrio é o chão da gestão financeira. Qualquer faturamento abaixo dele significa prejuízo operacional — independente de quantos procedimentos foram realizados no período.',
  action:
    'Use o resultado como referência para definir metas mensais de faturamento, avaliar a sustentabilidade dos custos fixos e tomar decisões sobre contratações, expansão ou corte de despesas.',
} as const

export const TOOL_RENTABILIDADE = {
  id: 'rentabilidade',
  title: 'Calculadora de Rentabilidade por Procedimento',
  shortTitle: 'Rentabilidade',
  href: '/rentabilidade',
  question: 'Este procedimento realmente gera lucro?',
  description:
    'Calcule se um procedimento realmente gera lucro após custos, taxas, tempo clínico e materiais.',
  category: 'Gestão Financeira',
  status: 'Gratuito' as const,
  answers: [
    'Lucro real após todos os custos do procedimento',
    'Margem de contribuição líquida por atendimento',
    'Impacto dos materiais, tempo clínico e taxas no resultado',
    'Comparativo de rentabilidade entre procedimentos',
  ] as const,
  interpretation:
    'Um procedimento pode parecer lucrativo pelo preço cobrado, mas gerar prejuízo depois de considerar materiais, tempo clínico, taxas e overhead. A ferramenta revela a rentabilidade real de cada atendimento.',
  action:
    'Use os resultados para priorizar procedimentos mais rentáveis, revisar preços de itens deficitários e construir um mix de atendimentos que maximize o resultado financeiro da clínica.',
} as const

// ── Tool registry ──────────────────────────────────────────────────────

export const TOOLS = [
  TOOL_PRECIFICACAO,
  TOOL_HORA_CLINICA,
  TOOL_PARCELAMENTO,
  TOOL_PONTO_DE_EQUILIBRIO,
  TOOL_RENTABILIDADE,
] as const

export type Tool = (typeof TOOLS)[number]

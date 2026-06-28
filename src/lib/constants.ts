export const APP_NAME = 'Kardovik Tools'
export const APP_URL = 'https://kardovik.com'
export const APP_DESCRIPTION =
  'Ferramentas gratuitas para clínicas odontológicas, dentistas e estudantes.'

export const TOOLS = [
  { slug: 'roi', label: 'Calculadora de ROI', href: '/roi' },
  { slug: 'parcelamento', label: 'Parcelamento', href: '/parcelamento' },
  { slug: 'rentabilidade', label: 'Rentabilidade', href: '/rentabilidade' },
] as const

export const PRODUCT_LINKS = [
  { label: 'Kardovik', href: APP_URL },
  { label: 'Blog', href: `${APP_URL}/blog` },
  { label: 'Contato', href: `${APP_URL}/contato` },
] as const

import { redirect } from 'next/navigation'

// /roi was the original ROI calculator route.
// Phase 1 replaces it with 5 specialized financial tools.
// Redirect safely to the homepage tools section.
export default function RoiPage() {
  redirect('/#ferramentas')
}

# DevSecOps — Kardovik Tools

Documentação da fundação DevSecOps implantada no projeto.

---

## O que foi implementado

### 1. CI — GitHub Actions

**Arquivo:** `.github/workflows/ci.yml`

Executa automaticamente em todo `push` e `pull request` para `main`.

**Etapas:**
1. `npm ci` — instalação limpa de dependências
2. `npm run lint` — verificação de padrões ESLint
3. `npx tsc --noEmit` — verificação de tipos TypeScript
4. `npm run build` — build de produção Next.js

**Objetivo:** impedir que código com erros de lint, tipagem ou build seja integrado à branch principal.

---

### 2. Dependabot

**Arquivo:** `.github/dependabot.yml`

Monitora semanalmente (toda segunda-feira, 09h BRT):

- **npm** — dependências do projeto (`package.json`)
- **github-actions** — versões dos actions do CI

PRs são agrupados por tipo (`production` vs `development`) e limitados a 5 abertos por vez.

---

### 3. Security Headers

**Arquivo:** `next.config.ts`

Aplicados em todas as rotas (`/(.*)`):

| Header | Valor | Proteção |
|---|---|---|
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Vazamento de URL em referrals |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | APIs do navegador não necessárias |
| `X-DNS-Prefetch-Control` | `on` | DNS prefetch para performance |

CSP não foi implementada nesta etapa para não bloquear fontes externas (Google Fonts), scripts analíticos futuros e integrações de terceiros.

---

### 4. Páginas de Erro

- `src/app/not-found.tsx` — Página 404 customizada, Server Component
- `src/app/error.tsx` — Boundary de erro global, Client Component (requisito do Next.js)

Ambas seguem o visual dark premium do produto e oferecem botão de retorno à homepage.

---

### 5. `.env.example`

Arquivo de template para variáveis de ambiente. Documenta variáveis futuras (auth, banco, pagamentos, IA) sem expor valores reais.

---

## O que não foi implementado (propositalmente)

| Item | Motivo |
|---|---|
| Autenticação | Fora do escopo — plataforma pública gratuita |
| CSP (Content Security Policy) | Evitar quebra de assets, fontes e futuras integrações |
| Rate limiting | Nenhum endpoint de API ativo ainda |
| CAPTCHA | Criar atrito desnecessário para usuários |
| WAF / DDoS protection | Coberto pela Vercel Edge Network por padrão |
| Secrets scanning | Recomendado ativar na aba Security do GitHub |
| SAST automático | Avaliar CodeQL quando houver lógica de negócio real |

---

## Próximos passos

1. Ativar **GitHub Secret Scanning** nas configurações do repositório
2. Implementar **CSP** quando o conjunto de fontes e scripts externos estiver estabilizado
3. Adicionar **rate limiting** na `proxy.ts` quando as calculadoras forem implementadas e gerarem tráfego
4. Avaliar **CodeQL** ou **Snyk** quando houver lógica de negócio relevante
5. Configurar **alertas de segurança do Dependabot** no GitHub

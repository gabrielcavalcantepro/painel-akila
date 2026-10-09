# painel-akila

Painel interno para acompanhar o funil do quiz [Plano Alimentar Para
Lactantes](https://github.com/gabrielcavalcantepro/plano-alimentar-para-lactantes):
em qual etapa os leads estão desistindo e quais respostas estão
marcando em cada pergunta.

Projeto separado de propósito — o quiz é público e usa, e continua
usando, zero dependências (sem build, sem framework). Este painel é um
admin interno, com login e banco de dados, hospedado à parte.

## Como funciona

- **`src/index.ts`** — Worker do Cloudflare com 4 rotas:
  - `POST /api/eventos` — pública, recebe os eventos que o quiz manda
    (`etapa_vista` e `opcao_selecionada`) e grava no D1.
  - `POST /api/login` / `POST /api/logout` — autenticação por senha
    única (não é usuário por pessoa), com cookie de sessão assinado
    (HMAC), sem biblioteca externa de JWT.
  - `GET /api/resumo` — protegida por login, devolve o funil, a
    distribuição de respostas e a lista de leads já processados.
  - `GET /` — serve o painel (HTML/CSS/JS puro, sem framework).
- **`src/resumo.ts`** — pega as linhas cruas da tabela `eventos` e
  monta o funil/respostas/leads em JavaScript (não em SQL complexo),
  de propósito: fica fácil de entender e ajustar depois.
- **`src/etapas.ts`** — a ordem das 29 etapas do quiz. **Se a ordem
  das etapas mudar no quiz** (`ETAPAS_ORDEM` em `js/app.js` do outro
  repositório), replique a mudança aqui também, senão o funil mostra a
  ordem errada.
- **`migrations/0001_init.sql`** — schema do D1 (uma tabela só,
  `eventos`).

## Primeira vez: configurar e publicar

### 1. Pré-requisitos

- Node.js instalado.
- Uma conta Cloudflare (gratuita): https://dash.cloudflare.com/sign-up

### 2. Instalar dependências

```bash
npm install
```

### 3. Login no Cloudflare

```bash
npx wrangler login
```

Abre o navegador pra autorizar. Depois confirme com:

```bash
npx wrangler whoami
```

### 4. Criar o banco D1

```bash
npx wrangler d1 create painel-akila-db
```

O comando imprime um `database_id`. Copie esse valor e cole em
`wrangler.jsonc`, no lugar de
`COLOQUE_AQUI_O_ID_DEPOIS_DE_RODAR_WRANGLER_D1_CREATE`.

### 5. Aplicar o schema no banco remoto

```bash
npx wrangler d1 migrations apply painel-akila-db --remote
```

### 6. Definir a senha do painel e o segredo de sessão

```bash
npx wrangler secret put DASHBOARD_PASSWORD
```
(vai pedir pra digitar a senha que você quer usar pra entrar no painel)

```bash
npx wrangler secret put SESSION_SECRET
```
(qualquer texto longo e aleatório, só precisa ser secreto — ex: gere um
com `openssl rand -hex 32` ou peça pro Claude gerar um)

### 7. Publicar

```bash
npx wrangler deploy
```

Ao final, o Wrangler imprime a URL pública, algo como:
`https://painel-akila.<seu-subdomínio>.workers.dev`

### 8. Apontar o quiz para esse endereço

No repositório **plano-alimentar-para-lactantes**, abra `js/app.js` e
troque a linha:

```js
const PAINEL_EVENTOS_URL = "https://painel-akila.SEU-SUBDOMINIO.workers.dev/api/eventos";
```

pela URL real que o deploy imprimiu, terminando em `/api/eventos`.
Depois publique o quiz normalmente. Sem esse passo, o quiz continua
funcionando 100% normal — só não manda os eventos pra lugar nenhum.

### 9. Acessar o painel

Abra a URL publicada no navegador e entre com a senha do passo 6.

## Desenvolvimento local

```bash
npx wrangler d1 migrations apply painel-akila-db --local
npx wrangler dev
```

Crie um `.dev.vars` (não versionado) com:

```
DASHBOARD_PASSWORD=sua-senha-de-teste
SESSION_SECRET=qualquer-coisa-para-teste-local
```

O painel sobe em `http://127.0.0.1:8788`. Pra testar o quiz mandando
eventos pra cá, troque temporariamente `PAINEL_EVENTOS_URL` no
`js/app.js` do outro repositório pra essa URL local.

## O que é registrado

Cada linha da tabela `eventos` é um `etapa_vista` (a pessoa entrou numa
etapa) ou `opcao_selecionada` (marcou uma resposta), com: id de sessão
(gerado no navegador, não identifica a pessoa sozinho), etapa, campo e
valor da resposta, rótulo visível da opção, e o nome do lead **a partir
do momento em que ele é capturado no quiz** (Etapa 9 em diante). Antes
disso, as linhas não têm nome.

## Privacidade e segurança

- O painel fica atrás de senha única (não é multiusuário).
- Os dados incluem nome e respostas dos leads — não compartilhe o link
  nem a senha além de quem precisa ver isso.
- Não há expiração automática dos dados hoje; se precisar apagar dados
  antigos, use `wrangler d1 execute painel-akila-db --remote --command
  "DELETE FROM eventos WHERE criado_em < '...'"`.
- O endpoint de ingestão (`/api/eventos`) é público por natureza (o
  quiz não loga ninguém), então tecnicamente aceita eventos de qualquer
  origem. Não é um risco sério pra esse caso de uso (o pior cenário é
  alguém poluir o funil com dados falsos), mas não é um boundary de
  segurança real — só um contador de funil.

## Desempenho do quiz (por que isso não deveria atrasar nada)

O lado do quiz (`js/app.js`) só começa a mandar eventos depois que a
página termina de carregar (mesmo atraso de 1200ms já usado pro Meta
Pixel e pro Clarity), e usa `navigator.sendBeacon`, que o próprio
navegador despacha em segundo plano sem travar a renderização nem
esperar resposta. Testado via Chrome headless: o `load` da página
continua dentro de ~150ms, e o primeiro evento só sai depois de
~1.3s — nunca compete com o carregamento inicial.

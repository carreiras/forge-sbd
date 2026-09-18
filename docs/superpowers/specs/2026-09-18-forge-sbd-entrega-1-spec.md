# ForgeSBD — especificação da entrega 1

Data: 18/09/2026. Detalhamento do desenho aprovado em `2026-09-18-forge-sbd-design.md`.

## Objetivo

Um administrador entra, cadastra aplicações e projetos, preenche um questionário condicional, salva e retoma o rascunho, gera uma avaliação e consulta requisitos com justificativa. O catálogo é demonstrativo, identificado na interface, e não constitui padrão corporativo aprovado.

## Limites e decisões técnicas

- Interface em português do Brasil.
- Node.js 24 LTS; atualizar o runtime local para o patch de segurança vigente antes da instalação das dependências.
- TypeScript 5.9, React 19, Vite 7, NestJS 11, PostgreSQL 17 e Prisma 7 com adapter PostgreSQL.
- npm workspaces; versões exatas resolvidas na implementação e registradas no lockfile.
- API e pacotes compartilhados ESM com imports `.js`; frontend usa resolução Bundler.
- Um administrador autenticado; sem cadastro público.
- Resposta desconhecida não equivale a resposta negativa.
- Catálogo demonstrativo fixo `demo-1`, questionário `survey-1` e regras `rules-1`.
- O motor não executa código do catálogo.
- Sem uploads de arquivos, integrações externas ou editor de catálogos nesta entrega.
- Sem controles declarados implementados/verificados: requisitos iniciam pendentes e não verificados.
- Avaliações imutáveis; nova avaliação não apaga a anterior nem altera automaticamente a vigente.
- Nenhum push, publicação ou implantação externa integra esta entrega.

O conjunto acima usa linhas de versões escolhidas para reduzir variáveis. Não é uma afirmação de que sejam as versões mais recentes. Prisma 7 requer adapter, saída explícita do client e configuração própria; não utilizar scaffolding antigo de Prisma 6.

## Questionário: 24 perguntas

Domínios selecionados no cadastro: `web`, `api`, `mobile`, `backend`, `infra`, `cloud`, `cicd`. Pelo menos um; podem ser combinados. Responsável e descrição pertencem ao cadastro.

Toda pergunta admite desconhecimento explícito. Ausência é rascunho não respondido; desconhecimento é uma resposta registrada. Perguntas booleanas oferecem sim/não/não sei. Perguntas múltiplas usam uma lista conhecida ou desconhecimento integral; seleção parcial com outros desconhecidos fica fora desta entrega.

| ID | Seção | Pergunta e valores conhecidos | Visibilidade |
|---|---|---|---|
| q01 | Contexto | Ambiente: desenvolvimento, homologação, produção | Sempre |
| q02 | Contexto | Algum componente é exposto à internet? | Sempre |
| q03 | Dados | Trata dados pessoais? | Sempre |
| q04 | Dados | Trata dados sensíveis? | Sempre |
| q05 | Dados | Armazena dados persistentemente? | Sempre |
| q06 | Identidade | Usa autenticação de usuários? | Sempre |
| q07 | Identidade | Possui funções administrativas? | Sempre |
| q08 | Arquitetura | Integra com terceiros? | Sempre |
| q09 | Desenvolvimento | Linguagens: JavaScript/TypeScript, Java, C#, Python, Go, outra | Domínio web/api/mobile/backend |
| q10 | Desenvolvimento | Possui dependências de terceiros? | Domínio web/api/mobile/backend |
| q11 | Desenvolvimento | Recebe upload de arquivos? | Domínio web/api/mobile/backend |
| q12 | Web | Utiliza sessão de navegador por cookie? | Domínio web |
| q13 | Web | Renderiza conteúdo fornecido por usuários? | Domínio web |
| q14 | API | Permite acessar recursos pertencentes a usuários ou organizações? | Domínio api |
| q15 | API | Recebe chamadas por webhooks? | Domínio api |
| q16 | Mobile | Plataformas: Android, iOS, outra | Domínio mobile |
| q17 | Mobile | Armazena dados no dispositivo? | Domínio mobile |
| q18 | Backend | Executa tarefas assíncronas? | Domínio backend |
| q19 | Infraestrutura | Usa containers? | Domínio infra/cloud/backend |
| q20 | Infraestrutura | Usa Kubernetes? | q19 = sim; desconhecimento mostra como condicional |
| q21 | Cloud | Provedores: AWS, Azure, GCP, outro | Domínio cloud |
| q22 | Cloud | Usa armazenamento de objetos? | Domínio cloud |
| q23 | CI/CD | Possui pipeline automatizado? | Domínio cicd |
| q24 | CI/CD | Pipeline acessa segredos ou credenciais? | Domínio cicd e q23 = sim; desconhecimento mostra como condicional |

Visibilidade é também uma decisão ternária. Quando uma condição é desconhecida, exibir a pergunta como condicional para permitir esclarecimento. Quando é falsa, ocultar e excluir a resposta dos fatos ativos; manter seu valor apenas no rascunho, claramente marcado como inativo. Ao reativar uma pergunta, pedir confirmação de seu valor antigo antes de utilizá-lo.

Impedir avaliações quando houver pergunta ativa obrigatória sem resposta. Desconhecimento explícito permite gerar avaliação, mas cria pendências. Contradição q19=não e q20=sim é inválida quando ambas forem submetidas como ativas. O servidor recalcula visibilidade, não confia nos campos ativos enviados pelo browser.

## Contratos de contexto e regras

Resposta conhecida: `{ "state": "known", "value": true }`; desconhecida: `{ "state": "unknown" }`. Valores conhecidos podem ser boolean, string ou string[]. Rascunho guarda `Record<QuestionId, Answer>`.

Fatos: `Record<string, boolean | "unknown">`. Os fatos de domínio sempre são conhecidos, pois o cadastro exige seleção. q01, q09, q16 e q21 produzem fatos por opção; booleanos produzem um fato por pergunta. Opção não selecionada em uma resposta múltipla conhecida é falsa. Pergunta inativa ou não confirmada não contribui como verdadeira; quando seu fato é consultado, retorna unknown. Regras específicas devem conter seu domínio como condição de escopo.

Regra:

```ts
type Rule =
  | { op: 'fact'; key: string }
  | { op: 'all' | 'any'; args: Rule[] }
  | { op: 'not'; arg: Rule };
```

all: falso se houver falso; verdadeiro se todos verdadeiros; desconhecido nos demais casos. any: verdadeiro se houver verdadeiro; falso se todos falsos; desconhecido nos demais casos. not inverte verdadeiro/falso e preserva desconhecimento.

Limites: profundidade 8, 100 nós por regra e 20 argumentos por grupo; grupos vazios, operador desconhecido e fato inexistente na definição do questionário são inválidos. O resultado contém valor e árvore de decisão com fatos avaliados e seus valores.

## Catálogo demonstrativo: 10 controles

Orientações serão escritas como exemplos próprios de comportamento, com identificação demonstrativa. Critérios abaixo verificam o funcionamento do produto; a revisão de padrões reais pertence à entrega 2.

| ID | Título | Expressão de aplicabilidade |
|---|---|---|
| DEMO-001 | Revisar desenho e fluxos de dados | Sempre aplicável |
| DEMO-002 | Definir proteção do tráfego externo | q02 |
| DEMO-003 | Definir tratamento dos dados pessoais | q03 OR q04 |
| DEMO-004 | Definir gestão da autenticação | q06 |
| DEMO-005 | Definir manutenção das dependências | domínio de desenvolvimento AND q10 |
| DEMO-006 | Definir proteção de sessões web | web AND q12 |
| DEMO-007 | Definir autorização por recurso da API | api AND q14 |
| DEMO-008 | Definir proteção do armazenamento mobile | mobile AND q17 |
| DEMO-009 | Definir configuração segura de containers | (infra OR cloud OR backend) AND q19 |
| DEMO-010 | Definir gestão de segredos do pipeline | cicd AND q23 AND q24 |

Cada controle: ID estável, versão, título, propósito, orientação, critério de aceite, fase, prioridade, domínios, regra opcional e origem `demonstration`. Regra ausente significa sempre aplicável. Falso exclui o controle da lista de requisitos, mas a decisão permanece na avaliação. Desconhecido gera item pendente de informação, separado de requisito confirmado.

Resultado armazena snapshots do contexto, do catálogo e das decisões. Mostrar título, orientação, critérios, condição, fatos usados e versões. Indicar quantos requisitos são aplicáveis, quantos aguardam informações e quantos foram excluídos.

## Persistência e concorrência

Entidades desta entrega: User, Session, Application, Project, SurveyDraft, Assessment, Requirement, AuditEvent. Catálogo e questionário entram como arquivos versionados e são copiados integralmente para o snapshot da avaliação.

Rascunho usa número de revisão. PATCH com revisão desatualizada retorna 409; o browser oferece recarregar sem sobrescrever silenciosamente. Geração informa a revisão esperada; revisar e salvar antes de gerar. Na transação, reler rascunho e projeto, validar a revisão, normalizar contexto e calcular fingerprint.

Fingerprint SHA256 de JSON canônico ordenado, incluindo projectId, domínios, respostas ativas e versões. Restrição única `(projectId, fingerprint)`. Repetição retorna avaliação existente. Concorrência trata conflito de unicidade sem duplicar requisitos ou auditoria de criação. Alteração do contexto cria nova avaliação histórica sem substituir automaticamente outra.

## REST

Base `/api/v1`. IDs UUID; respostas JSON. Erros estruturados `{ code, message, requestId }` e mensagens sem detalhes de banco ou credenciais.

| Método e rota | Comportamento |
|---|---|
| GET /health | 200 com `{status:"ok"}`; público |
| POST /auth/login | Email e senha; valida Origin; sucesso cria cookie de sessão e retorna usuário e token CSRF |
| GET /auth/me | Sessão atual e token CSRF; 401 sem sessão válida |
| POST /auth/logout | Revoga sessão; exige CSRF |
| GET, POST /applications | Listar/criar aplicações |
| GET /applications/:id/projects | Listar projetos da aplicação |
| POST /applications/:id/projects | Criar projeto com nome, responsável, descrição e domínios |
| GET /projects/:id | Consultar projeto |
| PATCH /projects/:id | Atualizar cadastro com revisão; preserva avaliações |
| GET /questionnaires/current | Retornar definição `survey-1` |
| GET /projects/:id/survey | Consultar rascunho e revisão |
| PATCH /projects/:id/survey | Validar/resolver visibilidade e salvar com revisão |
| POST /projects/:id/assessments | Gerar com revisão esperada; 201 novo, 200 repetido, 422 incompleto, 409 revisão inválida |
| GET /projects/:id/assessments | Histórico da aplicação avaliada |
| GET /assessments/:id | Snapshot, decisões e requisitos |

Todos os endpoints exceto health/login exigem sessão. Mutações autenticadas exigem Origin autorizado e `X-CSRF-Token`. GET não modifica estado de negócio.

## Autenticação e operação local

Senha via scrypt assíncrono do Node, com sal aleatório individual e parâmetros registrados. Nunca imprimir senha ou hash. Bootstrap pede credenciais sem eco da senha; não recebe senha em argumento de linha de comando.

Sessão aleatória de 32 bytes; banco guarda somente SHA256 do token. Cookie HttpOnly, SameSite=Lax, Path=/, MaxAge de 8 horas; Secure em produção. Token CSRF aleatório é vinculado à sessão. Sessões expiradas/revogadas são recusadas. Login falha com mensagem genérica e limitação por IP e identificador; testar também a janela de desbloqueio.

API em 127.0.0.1:3000, frontend em localhost:5173 com proxy `/api` para a API. Evitar alternar hostname durante navegação. Origem autorizada em configuração. PostgreSQL local em 127.0.0.1:5432, usuário e senha definidos pelo operador; Compose é opcional quando Docker estiver disponível.

Body JSON limitado a 128 KB. Campos extras recusados. Nome até 120, descrição até 2000, responsável até 160 caracteres. Respostas só aceitam valores declarados. Texto de orientações exibido como texto nesta entrega, sem HTML interpretado. Logs de auditoria não incluem senha, tokens nem respostas pessoais livres.

## Critérios de aceite

1. Login, logout e expiração funcionam sem credenciais padrão.
2. Criar aplicação e projeto persiste após reiniciar.
3. Selecionar mobile+api+cloud mostra seções correspondentes e oculta web/CI/CD.
4. Respostas desconhecidas geram pendências; não eliminam controles silenciosamente.
5. Rascunho salvo pode ser retomado sem perda; revisão concorrente retorna conflito.
6. Cada requisito explica condição e fatos utilizados.
7. Regeração idêntica não duplica avaliação; contexto alterado preserva a anterior.
8. Acesso sem sessão e mutação sem CSRF são recusados.
9. Avaliação exibe claramente catálogo demonstrativo e requisitos ainda não verificados.
10. Build, typecheck, testes de regras, integração REST/PostgreSQL e fluxo browser passam.

## Referências técnicas consultadas

- [Node.js: releases](https://nodejs.org/en/blog/release).
- [NestJS: primeiros passos](https://docs.nestjs.com/first-steps).
- [Vite: requisitos e setup](https://vite.dev/guide/).
- [Prisma 7: adapter e ESM](https://www.prisma.io/docs/orm/v7).
- [PostgreSQL: suporte por versão](https://www.postgresql.org/support/versioning/).

As APIs definitivas das dependências serão verificadas ao resolver suas versões exatas; a ausência de Docker/npm no PATH da sessão ainda precisa ser tratada na preparação do ambiente.

## Adendo de escopo — 18/09/2026

Esta entrega é F1, a fundação técnica. O objetivo final é equivalência funcional ao SD Elements; as 24 perguntas e dez controles demonstrativos não limitam o produto. Jira é obrigatório na F3 e precisa estar validado antes do piloto útil. A ausência de integração externa nesta entrega não torna Jira opcional. Ler o roadmap mestre, o inventário de perguntas e o desenho Jira em docs antes de planejar novas fases.
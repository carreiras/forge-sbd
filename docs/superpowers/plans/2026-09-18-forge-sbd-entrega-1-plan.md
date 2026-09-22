# ForgeSBD Entrega 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar login, cadastro de aplicações/projetos, questionário condicional com rascunho e avaliação de requisitos demonstrativos explicáveis.

**Architecture:** Monólito modular REST, frontend separado e PostgreSQL. Contratos e motor de regras em pacotes compartilhados; avaliações guardam snapshots imutáveis. Questionário e catálogo entram como arquivos versionados.

**Tech Stack:** Node.js 24 LTS, TypeScript 5.9, React 19, Vite 7, NestJS 11, PostgreSQL 17, Prisma 7 com adapter-pg, npm workspaces, Vitest, Supertest, Testing Library e Playwright.

**Spec:** `docs/superpowers/specs/2026-09-18-forge-sbd-entrega-1-spec.md`; desenho geral aprovado: `docs/superpowers/specs/2026-09-18-forge-sbd-design.md`.

## Global Constraints

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

---

## Preparação e estrutura

Estado observado em 18/09/2026: branch main limpa, remoto `https://github.com/carreiras/forge-sbd.git`, commit `c55878b`, desenho geral presente. Node da sessão: v24.19.0. npm e Docker não foram encontrados pelo comando Get-Command. Nenhuma instalação ocorreu durante o planejamento.

- [ ] Ler novamente git status e instruções AGENTS aplicáveis. Usar `git -c safe.directory=C:/projetos/apps/forge-sbd` nas chamadas se a identidade da sandbox causar erro de ownership; não mudar configuração global.
- [ ] Aplicar using-git-worktrees na execução; não trocar branch de trabalho do usuário sem necessidade.
- [ ] Localizar npm junto ao runtime ou instalar/configurar um runtime autorizado; validar `node --version` e `npm --version`. Conferir patch vigente de Node 24 no site oficial. Não provisionar banco remoto.
- [ ] Validar PostgreSQL local ou Docker. Se faltarem permissões/credenciais para preparar banco, concluir os pacotes puros e a interface enquanto se resolve o ambiente, sem declarar integração validada.

Mapa dos arquivos, criado nas tarefas correspondentes:

```text
package.json, package-lock.json, tsconfig.base.json, .gitignore, .env.example
compose.yaml                         PostgreSQL opcional, bind local
packages/contracts/src/index.ts      contratos e schemas
packages/rules/src/evaluate.ts       lógica ternária
packages/rules/src/context.ts        visibilidade e fatos
packages/rules/src/catalog.ts        validação dos arquivos demonstrativos
content/survey-1.json                 24 perguntas da especificação
content/demo-1.json                   10 controles da especificação
apps/api/prisma/schema.prisma        persistência
apps/api/prisma.config.ts            configuração Prisma 7
apps/api/src/generated/prisma/       client gerado, ignorado no Git
apps/api/src/create-app.ts           montagem testável da API
apps/api/src/database/               client e transações
apps/api/src/auth/                   senhas, sessões, CSRF e bootstrap
apps/api/src/portfolio/              aplicações e projetos
apps/api/src/surveys/                rascunhos e validação
apps/api/src/assessments/            geração, snapshots e consulta
apps/api/src/audit/                 registro de eventos
apps/api/test/support.ts            servidor e banco isolados de teste
apps/web/src/features/auth/         login e sessão
apps/web/src/features/portfolio/    aplicações e projetos
apps/web/src/features/survey/       seções, respostas, revisão e salvamento
apps/web/src/features/assessment/   decisões e explicações
apps/web/src/lib/api.ts             fetch com CSRF e erros
tests/e2e/first-assessment.spec.ts  fluxo browser
playwright.config.ts                execução local
docs/runbooks/local-development.md  setup e uso
```

### Contratos estáveis entre tarefas

```ts
export type Domain = 'web'|'api'|'mobile'|'backend'|'infra'|'cloud'|'cicd';
export type Truth = boolean | 'unknown';
export type Answer = {state:'known'; value:boolean|string|string[]}
  | {state:'unknown'};
export type Answers = Record<string, Answer>;
export type Facts = Record<string, Truth>;
export type Rule = {op:'fact'; key:string}
  | {op:'all'|'any'; args:Rule[]}
  | {op:'not'; arg:Rule};
export type Decision = {
  value:Truth; rule:Rule; children:Decision[];
  fact?:{key:string; value:Truth};
};
export type Question = {
  id:string; section:string; label:string;
  kind:'boolean'|'single'|'multiple'; options?:string[];
  required:boolean; visibleWhen?:Rule;
};
export type Questionnaire = {version:string; questions:Question[]};
export type Control = {
  id:string; version:string; title:string; purpose:string;
  guidance:string; acceptance:string; phase:string;
  priority:'high'|'medium'|'low'; domains:Domain[];
  origin:'demonstration'; rule?:Rule;
};
export type Catalog = {version:string; rulesVersion:string; controls:Control[]};
export type ContextResult = {
  facts:Facts; activeQuestionIds:string[]; unansweredIds:string[];
  unknownIds:string[]; contradictions:string[];
};
export type AssessmentDto = {
  id:string; projectId:string; createdAt:string; fingerprint:string;
  catalogVersion:string; questionnaireVersion:string; rulesVersion:string;
  context:{domains:Domain[]; answers:Answers};
  decisions:{controlId:string; value:Truth; explanation:Decision|null}[];
  requirements:{control:Control; applicability:'applicable'|'needs_information';
    implementation:'pending'; verification:'not_verified'}[];
};
```

DTOs de cadastro: `ApplicationInput={name:string,description:string}`; `ProjectInput={name:string,description:string,owner:string,domains:Domain[]}`. IDs UUID. Resposta de rascunho: `{questionnaireVersion:string,revision:number,answers:Answers,needsConfirmationIds:string[]}`. Patch: `{revision:number,answers:Answers,confirmedIds:string[]}`; respostas enviadas substituem somente as chaves presentes. Backend controla needsConfirmationIds quando o contexto muda.

## Task 1: Contratos e motor ternário

**Files:** criar package.json raiz; tsconfig.base.json; .gitignore; packages/contracts/package.json, tsconfig.json, src/index.ts; packages/rules/package.json, tsconfig.json, src/evaluate.ts e src/evaluate.test.ts.

**Interfaces:** produz os tipos acima e `evaluate(rule:Rule,facts:Facts):Decision`; validação de forma/profundidade da regra ocorre antes de evaluate.

- [ ] **Step 1 — Escrever testes de resultados relevantes antes do motor.**

```ts
import {expect,it} from 'vitest';
import {evaluate} from './evaluate.js';
const a = {op:'fact',key:'a'} as const;
const b = {op:'fact',key:'b'} as const;
it.each([
  [false,'unknown',false], [true,'unknown','unknown'], [true,true,true],
])('AND %s %s => %s', (x,y,result) => {
  expect(evaluate({op:'all',args:[a,b]}, {a:x,b:y}).value).toBe(result);
});
it('OR verdadeiro conserva aplicabilidade com outro ramo desconhecido',()=>{
  expect(evaluate({op:'any',args:[a,b]}, {a:true,b:'unknown'}).value).toBe(true);
});
it('NOT desconhecido e fato ausente continuam desconhecidos',()=>{
  expect(evaluate({op:'not',arg:a}, {}).value).toBe('unknown');
});
it('explicação mantém valores dos fatos',()=>{
  expect(evaluate(a,{a:false}).fact).toEqual({key:'a',value:false});
});
```

Adicionar tabela completa 3×3 de AND/OR e três valores de NOT; o domínio desconhecido não deve virar falso.

- [ ] **Step 2 — Preparar runner e observar a falha do módulo ausente.**

```json
{"name":"forge-sbd","private":true,"type":"module",
 "workspaces":["apps/*","packages/*"],"engines":{"node":">=24.21.0 <25"},
 "scripts":{"test":"npm run test --workspaces --if-present",
 "typecheck":"npm run typecheck --workspaces --if-present",
 "build":"npm run build --workspaces --if-present"}}
```

Resolver patches disponíveis dentro das linhas acordadas com npm view, usar `--save-exact`, registrar lockfile. Pacotes puros usam tsc NodeNext e Vitest. `npm run test -w @forge-sbd/rules -- src/evaluate.test.ts` deve falhar pelo módulo ausente, não por runner quebrado.

- [ ] **Step 3 — Implementar tipos e avaliação.**

```ts
export function evaluate(rule:Rule, facts:Facts):Decision {
  if(rule.op==='fact') {
    const value=facts[rule.key] ?? 'unknown';
    return {value,rule,children:[],fact:{key:rule.key,value}};
  }
  if(rule.op==='not') {
    const child=evaluate(rule.arg,facts);
    return {value:child.value==='unknown'?'unknown':!child.value,
      rule,children:[child]};
  }
  const children=rule.args.map(arg=>evaluate(arg,facts));
  const values=children.map(child=>child.value);
  const value=rule.op==='all'
    ? (values.includes(false)?false:values.includes('unknown')?'unknown':true)
    : (values.includes(true)?true:values.includes('unknown')?'unknown':false);
  return {value,rule,children};
}
```

Imports vêm de @forge-sbd/contracts. Grupos vazios são recusados pelo schema/validador público antes da avaliação; testar essa recusa na tarefa 2. Exports dos pacotes apontam para dist e declaration files; build de contracts antecede rules.

- [ ] **Step 4 — Verificar e registrar a entrega do motor.** Rodar teste acima, typecheck e build dos dois pacotes. Commit explícito apenas dos arquivos da tarefa: `feat: add typed three-valued rules engine`.

## Task 2: Questionário condicional e catálogo demonstrativo

**Files:** criar packages/rules/src/context.ts, context.test.ts, catalog.ts, catalog.test.ts; content/survey-1.json; content/demo-1.json. Modificar contracts/src/index.ts para schemas Zod correspondentes aos contratos; atualizar packages/rules/src/index.ts com exports.

**Interfaces:** `validateQuestionnaire(input:unknown):Questionnaire`; `validateCatalog(input:unknown,questionnaire:Questionnaire):Catalog`; `deriveContext(questionnaire:Questionnaire,domains:Domain[],answers:Answers,needsConfirmationIds:string[]):ContextResult`. exports de rules incluem evaluate e as três funções.

- [ ] **Step 1 — Escrever testes sobre comportamento e arquivos reais.**

```ts
import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {deriveContext,validateQuestionnaire,validateCatalog} from './index.js';
const survey=()=>validateQuestionnaire(JSON.parse(readFileSync(
  new URL('../../../content/survey-1.json',import.meta.url),'utf8')));
it('mobile/API/cloud não ativa questões web',()=>{
  const result=deriveContext(survey(),['mobile','api','cloud'],{},[]);
  expect(result.activeQuestionIds).toContain('q16');
  expect(result.activeQuestionIds).not.toContain('q12');
});
it('desconhecimento não responde negativamente',()=>{
  const result=deriveContext(survey(),['api'],{q14:{state:'unknown'}},[]);
  expect(result.facts.q14).toBe('unknown');
  expect(result.unknownIds).toContain('q14');
});
it('valida catálogo real e contagem acordada',()=>{
  const input=JSON.parse(readFileSync(new URL(
    '../../../content/demo-1.json',import.meta.url),'utf8'));
  expect(validateCatalog(input,survey()).controls).toHaveLength(10);
  expect(survey().questions).toHaveLength(24);
});
```

Acrescentar testes: q19=false oculta q20 e não reaproveita seu true; reativação exige confirmação; q19 desconhecido mostra q20 como condicional; operador/fato inválido, profundidade 9 e grupo vazio recusados; seleção fora de opções recusada; IDs duplicados recusados.

- [ ] **Step 2 — Rodar `npm run test -w @forge-sbd/rules -- src/context.test.ts src/catalog.test.ts`.** Confirmar falhas das funções/arquivos ausentes.
- [ ] **Step 3 — Criar perguntas e controles exatamente pelas tabelas da especificação.** Exemplo de estrutura concreta:

```json
{"version":"survey-1","questions":[
 {"id":"q14","section":"API","label":"Permite acessar recursos pertencentes a usuários ou organizações?",
  "kind":"boolean","required":true,"visibleWhen":{"op":"fact","key":"domain.api"}}
]}
```

O arquivo final contém as 24 perguntas, não só o exemplo. Fatos de opções usam `qNN.<opção>`; usar opções ASCII estáveis e rótulos traduzidos pela interface. Definir explícitos: q01 dev/staging/prod; q09 js_ts/java/csharp/python/go/other; q16 android/ios/other; q21 aws/azure/gcp/other. Fato booleano usa qNN; domínio usa domain.api etc. Acrescentar labels de opções ao contrato Question como `optionLabels?:Record<string,string>`.

```json
{"version":"demo-1","rulesVersion":"rules-1","controls":[
 {"id":"DEMO-007","version":"1","title":"Definir autorização por recurso da API",
  "purpose":"Demonstrar seleção de um requisito de API pelo contexto.",
  "guidance":"Documentar como a decisão de acesso é vinculada ao usuário e ao recurso.",
  "acceptance":"A avaliação registra a regra e os fatos que selecionaram este requisito.",
  "phase":"design","priority":"high","domains":["api"],"origin":"demonstration",
  "rule":{"op":"all","args":[{"op":"fact","key":"domain.api"},{"op":"fact","key":"q14"}]}}
]}
```

O arquivo final contém dez controles. Redigir cada orientação como demonstração identificada; não declarar certificação ou atendimento a norma.

- [ ] **Step 4 — Implementar normalização e validação.** Construir fatos conhecidos de domínio; validar opções; avaliar visibilidade por dependências em ordem topológica; detectar ciclo de visibilidade. Respostas inativas permanecem no draft e são excluídas do snapshot. needsConfirmationIds produzem ausência ativa até confirmação. Campo contraditório ativo retorna contradiction. Limites de regra da especificação aplicam-se a visibilidade e controles; soma de perguntas/controles fica limitada a 1000 em cada arquivo.
- [ ] **Step 5 — Rodar testes, typecheck e build.** Commit: `feat: add conditional survey and demo controls`.

## Task 3: Persistência e API testável — concluída em 22/09/2026

> Evidências e decisões: `docs/task-3-execution.md`; operação: `docs/DEVELOPMENT.md`. Porta real 5438; seedTestAdmin acompanha o hash real na tarefa 4. API local, Docker somente PostgreSQL.

**Files:** criar apps/api/package.json, tsconfig.json, vitest.config.ts, prisma.config.ts, prisma/schema.prisma, src/database/database.service.ts, src/create-app.ts, src/main.ts, src/app.module.ts, src/audit/audit.service.ts, test/support.ts, test/database.integration.test.ts; raiz .env.example e compose.yaml.

**Interfaces:** `createApp():Promise<INestApplication>` monta guards/configuração sem listen; main chama listen. `DatabaseService extends PrismaClient`; `AuditService.record(tx,event)` recebe transação Prisma e `{actorId,action,targetId,requestId}`. Suporte `startTestApp():Promise<{app:INestApplication,db:DatabaseService,close():Promise<void>}>` e `seedTestAdmin(db):Promise<{email:string,password:string}>`; banco dedicado termina `_test` e deve ser conferido antes de qualquer limpeza.

- [x] **Step 1 — Escrever teste de persistência e saúde.**

```ts
it('saúde e aplicação persistida',async()=>{
  const test=await startTestApp();
  try {
    await request(test.app.getHttpServer()).get('/api/v1/health').expect(200);
    const app=await test.db.application.create({data:{name:'App fictícia',description:''}});
    expect(await test.db.application.findUnique({where:{id:app.id}})).not.toBeNull();
  } finally {await test.close();}
});
```

Imports: vitest, supertest e ./support.js. Não compartilhar credenciais ou banco da máquina com testes. Conexão de integração usa TEST_DATABASE_URL; sem banco, falhar com diagnóstico explícito em vez de ignorar teste.

- [x] **Step 2 — Configurar scripts e rodar a falha.** API usa `tsx src/main.ts` em dev, tsc para build, `vitest run` para testes, `prisma generate` e `prisma migrate deploy` para banco. Instalar Nest11, reflect-metadata, rxjs, cookie-parser, helmet, Zod, pg e adapter/client Prisma7; pares Prisma têm patch exato igual. Dev deps: tsx, vitest, supertest e tipos. Teste inicial falha por módulo ausente.
- [x] **Step 3 — Criar schema.** User: UUID, email único normalizado, passwordHash, createdAt. Session: UUID, userId, tokenHash único, csrfHash, expiresAt, revokedAt. Application: UUID, name, description, createdAt. Project: UUID, applicationId, name, description, owner, domains JSON, revision default 0. SurveyDraft: projectId único, questionnaireVersion, answers JSON, needsConfirmationIds JSON, revision default 0. Assessment: UUID, projectId, fingerprint, context JSON, catalogSnapshot JSON, decisions JSON, createdAt; unique projectId+fingerprint. Requirement: UUID, assessmentId, controlId, controlSnapshot JSON, applicability; unique assessmentId+controlId. AuditEvent: UUID, actorId, action, targetId, requestId, createdAt. IDs referenciados usam FK; não cascatar exclusão de avaliações. Sem rota delete nesta entrega.

Configuração Prisma7:

```ts
// apps/api/prisma.config.ts
import 'dotenv/config';
import {defineConfig,env} from 'prisma/config';
export default defineConfig({schema:'prisma/schema.prisma',
  migrations:{path:'prisma/migrations'},datasource:{url:env('DATABASE_URL')}});
// construção do client no DatabaseService
const adapter=new PrismaPg({connectionString:process.env.DATABASE_URL!});
const client=new PrismaClient({adapter});
```

Generator: provider prisma-client, output ../src/generated/prisma, moduleFormat esm. DatabaseService usa o mesmo adapter no super; connect/disconnect no ciclo de vida Nest. Config é validada ao iniciar, antes de construir client.

Compose opcional: postgres:17, porta 127.0.0.1:5432:5432, volume próprio forge_sbd_pg, POSTGRES_PASSWORD obrigatório via env. .env.example deixa senha vazia com comentário de configuração; .env ignorado. Banco de teste distinto. Não usar `migrate reset` em banco existente.
- [x] **Step 4 — Migrar em banco dedicado e testar.** `npm run db:generate -w @forge-sbd/api`, criar migration inicial no banco local vazio e executar migrate deploy no banco de teste; `npm run test:integration -w @forge-sbd/api -- test/database.integration.test.ts`. Commit: `feat: add local postgres persistence and api bootstrap`.

## Task 4: Login, sessão e proteção das mutações — concluída em 22/09/2026

> Evidências: `docs/task-4-execution.md`. Instruções de bootstrap e REST Client: `docs/DEVELOPMENT.md` e `restclient/README.md`. Guards globais, 61 testes passando e fluxo HTTP validado nos modos compilado/tsx.

**Files:** criar src/auth/password.ts, password.test.ts, auth.module.ts, auth.service.ts, auth.controller.ts, session.guard.ts, csrf.guard.ts, bootstrap-admin.ts; test/auth.integration.test.ts. Modificar create-app.ts e support.ts.

**Interfaces:** `hashPassword(password:string):Promise<string>` e `verifyPassword(password:string,encoded:string):Promise<boolean>`; `SessionGuard` popula `request.user={id,email}`; `CsrfGuard` valida Origin e token. Login retorna `{user:{id,email},csrfToken}`; GET me retorna mesmo shape. Logout responde 204.

- [x] **Step 1 — Testar senha, acesso, CSRF e revogação.**

```ts
it('recusa mutação sem CSRF e sessão após logout',async()=>{
  const test=await startTestApp();
  try {
    const admin=await seedTestAdmin(test.db);
    const agent=request.agent(test.app.getHttpServer());
    const login=await agent.post('/api/v1/auth/login')
      .set('Origin','http://localhost:5173').send(admin).expect(200);
    await agent.post('/api/v1/auth/logout').expect(403);
    await agent.post('/api/v1/auth/logout').set('Origin','http://localhost:5173')
      .set('X-CSRF-Token',login.body.csrfToken).expect(204);
    await agent.get('/api/v1/auth/me').expect(401);
  } finally {await test.close();}
});
```

Também testar: senha errada, email desconhecido com mesma mensagem, cookie HttpOnly/Lax, sessão expirada, token aleatório, Origin externo, corpo acima de 128KB, limite de tentativas e desbloqueio com relógio controlado.
- [x] **Step 2 — Rodar testes auth e observar falha por rotas ausentes.**
- [x] **Step 3 — Implementar senha/sessão.** Scrypt N=32768,r=8,p=1,maxmem=64MiB, sal 16 bytes e resultado 64 bytes; formato `scrypt$32768$8$1$<saltHex>$<hashHex>`; validar formato/tamanho antes de comparar com timingSafeEqual. Testar sal diferente para mesma senha e hash inválido retorna false. Senha 12–128 caracteres; login não imprime input.

```ts
const sessionToken=randomBytes(32).toString('hex');
const csrfToken=randomBytes(32).toString('hex');
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
await db.session.create({data:{userId:user.id,tokenHash:digest(sessionToken),
  csrfHash:digest(csrfToken),expiresAt:new Date(Date.now()+8*60*60*1000)}});
```

Para GET me devolver token CSRF sem armazená-lo em claro: guardar token no cookie separado forge_csrf (HttpOnly) e verificar seu hash ao retornar e validar X-CSRF-Token. Alternativa aceita: gerar novo token em GET me, mas altera estado e causaria conflito entre abas; portanto preferir segundo cookie e não rotacionar no GET. Revogar/remove ambos no logout. Cookie principal forge_session.

Limitação local: 5 falhas em 15 minutos por IP+email normalizado, hash de email na chave; limpeza de entradas expiradas e limite de 10 mil chaves, sem persistir credenciais. Login verifica Origin; mutações autenticadas verificam sessão+Origin+CSRF. Helmet e limite JSON de 128KB em createApp.

Bootstrap usa stdin/terminal com senha sem eco, confirmado duas vezes. Aborta se admin já existir. Testes usam seedTestAdmin com senha fictícia somente em banco `_test`.
- [x] **Step 4 — Executar testes e typecheck.** Commit: `feat: add admin sessions and csrf protection`.

## Task 5: Cadastro de portfólio e rascunho com revisão

**Files:** criar portfolio.module.ts, portfolio.service.ts, portfolio.controller.ts em src/portfolio; surveys.module.ts, surveys.service.ts, surveys.controller.ts em src/surveys; test/portfolio-survey.integration.test.ts. Modificar app.module.ts, contracts e support.

**Interfaces:** endpoints e payloads da especificação. Atualizar projeto exige `{revision,...ProjectInput}`. Todas as mutações auditadas dentro da transação. Carregamento inicial do survey usa catálogo validado da tarefa 2, caminho absoluto derivado de configuração CONTENT_DIRECTORY.

- [ ] **Step 1 — Testar CRUD mínimo, retomada e conflito.**

```ts
const appResult=await agent.post('/api/v1/applications')
  .set('Origin',origin).set('X-CSRF-Token',csrfToken)
  .send({name:'Demo',description:''}).expect(201);
const project=await agent.post(`/api/v1/applications/${appResult.body.id}/projects`)
  .set('Origin',origin).set('X-CSRF-Token',csrfToken)
  .send({name:'API demo',description:'Fictícia',owner:'Operador',domains:['api']}).expect(201);
const route=`/api/v1/projects/${project.body.id}/survey`;
await agent.patch(route).set('Origin',origin).set('X-CSRF-Token',csrfToken)
  .send({revision:0,answers:{q14:{state:'unknown'}},confirmedIds:[]}).expect(200);
await agent.patch(route).set('Origin',origin).set('X-CSRF-Token',csrfToken)
  .send({revision:0,answers:{},confirmedIds:[]}).expect(409);
const resumed=await agent.get(route).expect(200);
expect(resumed.body.answers.q14).toEqual({state:'unknown'});
```

Bloco vai dentro de it com startTestApp, seedTestAdmin e login conforme tarefa 4; definir `origin='http://localhost:5173'`. Acrescentar inválidos: UUID incorreto 400, aplicação inexistente 404, domínio desconhecido, respostas com opções inválidas e campos extras 400/422, nome vazio/longos e revisão inexistente 400.
- [ ] **Step 2 — Rodar integração específica; confirmar falhas das rotas.**
- [ ] **Step 3 — Implementar services e controllers.** Usar schemas Zod strict para payloads e filtros; trim em nomes/email. PATCH rascunho faz updateMany where projectId+revision com incremento; count=0 retorna 409 e transaction faz rollback. Recalcular visibilidade na alteração de domínios e respostas; perguntas que reaparecem com resposta guardada recebem needsConfirmationIds. Reativação sem confirmação não entra nos fatos. Criar rascunho atomicamente com projeto. Listagens ordenadas por createdAt+id, paginação limit máximo 100.

```ts
const result=await tx.surveyDraft.updateMany({
  where:{projectId,revision:input.revision},
  data:{answers:mergedAnswers,needsConfirmationIds,revision:{increment:1}},
});
if(result.count!==1) throw new ConflictException({code:'REVISION_CONFLICT',
  message:'O questionário foi alterado. Recarregue antes de salvar.'});
```

- [ ] **Step 4 — Testar salvar, encerrar servidor e consultar com outra instância no mesmo banco de teste.** Nunca limpar entre essas duas instâncias. Commit: `feat: add projects and resumable conditional surveys`.

## Task 6: Geração e histórico imutável de avaliações

**Files:** criar assessments.module.ts, assessments.service.ts, assessments.controller.ts, fingerprint.ts, fingerprint.test.ts em src/assessments; test/assessment.integration.test.ts. Modificar app.module e contracts.

**Interfaces:** `canonicalJson(value:unknown):string`; `fingerprint(value:unknown):string`; `AssessmentsService.generate(projectId:string,revision:number,actorId:string):Promise<{created:boolean,assessment:AssessmentDto}>`.

- [ ] **Step 1 — Testar deduplicação, desconhecimento e alteração.** Fixture `completeApiAnswers:Answers` no suporte: q01=dev, q02=true, q03=false, q04=false, q05=true, q06=true, q07=false, q08=false, q09=['js_ts'], q10=true, q11=false, q14=unknown, q15=false. Backend/infra inativos para domínio api. Testar all aplicáveis sem presumir contagem que conflita com desconhecidos.

```ts
const path=`/api/v1/projects/${projectId}/assessments`;
const first=await agent.post(path).set('Origin',origin).set('X-CSRF-Token',csrfToken)
  .send({revision:1}).expect(201);
const again=await agent.post(path).set('Origin',origin).set('X-CSRF-Token',csrfToken)
  .send({revision:1}).expect(200);
expect(again.body.id).toBe(first.body.id);
expect(first.body.requirements.find((r:AssessmentDto['requirements'][number])=>
  r.control.id==='DEMO-007')?.applicability).toBe('needs_information');
```

Adicionar dois POST concorrentes, resposta ativa ausente=>422, versão/revisão desatualizada=>409, contexto alterado gera outro ID e avaliação antiga preserva unknown. Teste canonicalJson compara objetos com chaves em ordens diferentes e arrays de opções normalizados.
- [ ] **Step 2 — Rodar testes fingerprint e assessment e observar falhas.**
- [ ] **Step 3 — Implementar normalização e transação.** canonicalJson ordena chaves de objetos recursivamente; arrays de respostas múltiplas/domínios são deduplicados e ordenados na normalização antes de hash; não reordenar arrays da árvore de explicações. sha256 inclui projectId, domínios, respostas ativas e versões.

```ts
const hash=createHash('sha256').update(canonicalJson({projectId,domains,
  answers:activeAnswers,questionnaireVersion:'survey-1',
  catalogVersion:'demo-1',rulesVersion:'rules-1'})).digest('hex');
const decisions=catalog.controls.map(control=>({controlId:control.id,
  value:control.rule?evaluate(control.rule,context.facts).value:true,
  explanation:control.rule?evaluate(control.rule,context.facts):null}));
```

Transação serializable relê projeto/rascunho e revision; mantém um snapshot consistente durante geração. Retry máximo 3 para serialization failure; erro único de fingerprint retorna avaliação existente em nova leitura. Criar avaliação/requisitos/evento atomicamente. Só controles true/unknown geram Requirement; snapshots guardam todos, inclusive false. Resposta DTO obtém implementação pending e verificação not_verified, sem permitir alteração nesta entrega.
- [ ] **Step 4 — Rodar integrações e confirmar ausência de duplicação no banco.** Commit: `feat: generate immutable explainable assessments`.

## Task 7: Interface web do fluxo completo

**Files:** criar apps/web/package.json, index.html, vite.config.ts, tsconfig.json, src/main.tsx, src/App.tsx, src/styles.css; lib/api.ts; features auth/LoginPage.tsx, portfolio/ApplicationsPage.tsx e ProjectPage.tsx, survey/SurveyPage.tsx, QuestionField.tsx e SurveyPage.test.tsx, assessment/AssessmentPage.tsx. React Router para rotas; Testing Library+Vitest para interação.

**Interfaces:** `api<T>(path:string,options?:RequestInit):Promise<T>` faz fetch /api/v1, credentials same-origin e CSRF em memória obtido por login/me; nunca localStorage de token. QuestionField props `{question:Question,answer?:Answer,onChange(answer:Answer):void,conditional:boolean}`. Interface consome os contratos da tarefa 1 e API das tarefas 4–6.

- [ ] **Step 1 — Escrever teste de formulário acessível com desconhecimento.**

```tsx
it('permite desconhecimento explícito',async()=>{
  const onChange=vi.fn();
  render(<QuestionField question={{id:'q14',section:'API',kind:'boolean',
    label:'Acessa recursos de usuários?',required:true}}
    onChange={onChange} conditional={false}/>);
  await userEvent.click(screen.getByLabelText('Não sei / preciso confirmar'));
  expect(onChange).toHaveBeenCalledWith({state:'unknown'});
});
```

Imports vi/it/expect de vitest, render/screen de Testing Library e userEvent. Setup jsdom e cleanup. Testar troca de domínio/seção sem perder rascunho; conflito mostra mensagem e não anuncia salvamento; botão gerar fica indisponível enquanto salvamento pendente. Mock somente HTTP boundary com MSW, não motor.
- [ ] **Step 2 — Preparar React/Vite e rodar falha do componente ausente.** Frontend dev usa `vite --host 127.0.0.1`, navegação por localhost:5173; proxy `/api` para 127.0.0.1:3000. Sem CORS aberto ou serviços externos.
- [ ] **Step 3 — Implementar telas e cliente.** Login; listagem/criação aplicações; projeto com domínios em checkboxes; questionário com navegação por seção e Salvar rascunho explícito; resumo de desconhecidos; revisão antes de Gerar avaliação; histórico e detalhe. Inputs têm labels, agrupamentos fieldset/legend, estado de carregamento e mensagens em aria-live. Progresso: perguntas ativas respondidas/ativas, desconhecimento contado e indicado separadamente.

```ts
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{
  const headers=new Headers(options.headers);
  if(options.body) headers.set('Content-Type','application/json');
  if(options.method && !['GET','HEAD'].includes(options.method.toUpperCase()))
    headers.set('X-CSRF-Token',csrfToken);
  const response=await fetch(`/api/v1${path}`,{...options,headers,
    credentials:'same-origin'});
  if(response.status===204) return undefined as T;
  const body=await response.json();
  if(!response.ok) throw Object.assign(new Error(body.message),
    {status:response.status,code:body.code});
  return body as T;
}
```

Definir csrfToken em escopo de módulo e `setCsrfToken(value:string):void`, chamada após login/me e limpada após logout/401. Login valida Origin no servidor, sem exigir token prévio. Interface usa texto React escapado para orientações. Banner persistente: “Catálogo demonstrativo — requer revisão antes de uso corporativo”. Sem indicador de aprovação corporativa.
- [ ] **Step 4 — Rodar testes de interação, typecheck e build.** Inspecionar visualmente desktop e largura 390px. Commit: `feat: add web project survey and assessment flow`.

## Task 8: Validação ponta a ponta e instruções locais

**Files:** criar playwright.config.ts, tests/e2e/first-assessment.spec.ts, tests/e2e/global-setup.ts; docs/runbooks/local-development.md; atualizar README.md, package.json e .env.example.

**Interfaces:** scripts raiz `dev`, `test`, `test:integration`, `test:e2e`, `typecheck`, `build`; setup e2e usa banco `_test`, cria admin fictício via suporte, nunca admin pessoal. webServer inicia API+web com env de teste e readiness health.

- [ ] **Step 1 — Escrever fluxo browser.**

```ts
test('retoma rascunho e gera requisitos explicados',async({page})=>{
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.test');
  await page.getByLabel('Senha').fill('Senha-Ficticia-Para-Testes-123');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await page.getByRole('button',{name:'Nova aplicação'}).click();
  await page.getByLabel('Nome da aplicação').fill('Aplicação fictícia');
  await page.getByRole('button',{name:'Criar aplicação'}).click();
  await page.getByRole('button',{name:'Novo projeto'}).click();
  await page.getByLabel('Nome do projeto').fill('API demo');
  await page.getByLabel('Responsável').fill('Operador');
  await page.getByLabel('API', {exact:true}).check();
  await page.getByRole('button',{name:'Criar projeto'}).click();
  await expect(page.getByText('Web', {exact:true})).not.toBeVisible();
});
```

Ampliar o teste com a fixture completaApiAnswers da tarefa 6 por campos acessíveis; salvar, reload, verificar unknown, revisar, gerar, abrir DEMO-007 e conferir fatos domain.api/q14 e pendência. Segunda geração obtém mesmo ID; outra resposta gera histórico. Acrescentar fluxo mobile+api+cloud usando respostas por seção, sem exigir todos os 24 campos. Senha acima é exclusiva dos testes e não vai a defaults da aplicação.
- [ ] **Step 2 — Rodar browser; corrigir falhas observadas pelo fluxo.** Não considerar teste parcial acima como aceite do fluxo inteiro. Usar tracing só em falha com dados fictícios.
- [ ] **Step 3 — Documentar comandos exatos e ambiente.** README aponta runbook: runtime/npm, DATABASE_URL e TEST_DATABASE_URL, migrations, gerar client, bootstrap-admin, iniciar API/web, rodar testes. Orientar PostgreSQL nativo quando Docker ausente. Explicar que evidências/execução/integrações virão nas entregas seguintes. Registrar limitações encontradas e não apresentar catálogo demo como biblioteca de segurança completa.
- [ ] **Step 4 — Verificação final, uma sequência coerente.**

```powershell
npm ci
npm run db:generate -w @forge-sbd/api
npm run typecheck
npm run test
npm run test:integration
npm run build
npm run test:e2e
git status --short
git diff --check
```

Runbook diferencia test unitário de integração para evitar rodar banco duas vezes em `npm run test`. Scripts dos workspaces chamam somente seus testes unitários por padrão. Integração explicita TEST_DATABASE_URL. Rodar verificação de restart/persistência na tarefa 5; não repetir checks já aprovados sem nova alteração. Fazer revisão de código conforme requesting-code-review antes de declarar entrega pronta.
- [ ] **Step 5 — Commit da validação e documentação.** `test: verify first assessment flow and document local setup`. Nenhum push automático. Relatar comandos realmente executados, falhas e limitações remanescentes.

## Revisão do plano e cobertura

| Requisito da especificação desta entrega | Tarefas |
|---|---|
| Contratos, ternário e explicação | 1, 2 |
| 24 perguntas, condicionais, desconhecimento e confirmação | 2, 5, 7 |
| Catálogo demo de 10 controles | 2, 6, 7 |
| Persistência e snapshots | 3, 5, 6 |
| Login, CSRF, revisão e autorização | 4, 5 |
| Idempotência e concorrência de geração | 6 |
| Interface, retomada e histórico | 7, 8 |
| Testes reais de API/banco/browser | 3 a 8 |

Recursos do desenho geral reservados às fases F2–F5: editor/publicação de catálogo, padrões reais revisados, execução e verificação editáveis, evidências, exceções, comparação antes de promover avaliação vigente, dashboard, CSV e backup/restauração. Não são lacunas desta entrega; não declarar primeira versão completa do produto ao concluir este plano.

Execução recomendada para esta primeira entrega: inline, com executing-plans e checkpoints entre tarefas. A alternativa com subagentes depende de escolha explícita do usuário.

## Adendo de escopo — 18/09/2026

Este plano implementa apenas F1. Jira deixou de ser opcional e é condição para o primeiro piloto útil; será detalhado na F3, com publicação da avaliação, outbox, cards contextualizados e reconciliação. A fase F2 amplia o questionário e a biblioteca real; a matriz de equivalência mantém todas as capacidades futuras visíveis. Não declarar produto completo ao terminar F1.

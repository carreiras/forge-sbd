# Desenvolvimento local

Requisitos: Node.js 24.21.0 (ou patch posterior da linha 24), npm e Docker Desktop para **somente PostgreSQL**. API NestJS e futuro frontend rodam como processos locais.

## Preparação

Na raiz do repositório:

```powershell
npm ci
# Apenas em checkout novo: copiar .env.example para .env e definir senha aleatória.
# DATABASE_URL e TEST_DATABASE_URL precisam conter essa senha, com URL encoding.
docker compose up -d postgres
npm run db:generate
npm run db:deploy
npm run db:deploy:test -w @forge-sbd/api
```

O Compose usa `127.0.0.1:5438`, container `forge-sbd-postgres` e volume próprio. Não alterar a senha de um volume já inicializado apenas editando `.env`: o PostgreSQL existente mantém sua senha. A inicialização cria `forge_sbd` e `forge_sbd_test` em volume novo. Não usar `migrate reset` nem remover volumes para atualizar o schema; usar as migrations versionadas.

O `.env` da raiz é carregado sem imprimir valores e sem substituir variáveis já exportadas no ambiente. Não versionar senhas ou URLs reais. A CLI Prisma e os scripts funcionam via npm workspaces, sem copiar `.env` para `apps/api`.

## API local

```powershell
npm run dev:api
# GET http://127.0.0.1:3000/api/v1/health => {"status":"ok"}
```

Para executar o build:

```powershell
npm run build
npm run start -w @forge-sbd/api
```

A API escuta somente em `127.0.0.1`, na porta `API_PORT` (3000 por padrão). `createApp()` monta e inicializa a aplicação sem abrir porta; `main.ts` faz listen e configura encerramento. Saúde e login são públicos; consulta de sessão e logout exigem autenticação. Portfólio, avaliações e frontend utilizável entram nas tarefas seguintes.

Erros HTTP têm `{code,message,requestId}` e o header `X-Request-Id`; mensagens não expõem detalhes do banco. O corpo JSON está limitado a 128 KB, Helmet está ativo e o parser de cookies é usado pelas sessões da tarefa 4. O frontend futuro usará proxy `/api` e `WEB_ORIGIN=http://localhost:5173`.

## Verificação

```powershell
npm test
npm run typecheck
npm run build
npm audit
```

`npm test` inclui integração real, não ignora testes quando falta banco. Preparar migrations antes de executar. `TEST_DATABASE_URL` deve ser local, ter nome terminado em `_test`, não ter parâmetros e ser distinta do banco principal (inclusive localhost/127.0.0.1/IPv6 e usuários diferentes). **As tabelas desse banco dedicado são limpas antes e depois dos testes.** Um advisory lock serializa os processos de teste para evitar colisão na limpeza. Não apontar para dados que devam ser preservados.

A integração verifica saúde, persistência após reconectar, unicidade de avaliações/requisitos, preservação do histórico por FKs restritivas, auditoria transacional e erros HTTP. Os 36 testes do motor continuam no comando raiz.

## Dependências e limites

NestJS 11.2.5; Prisma client/adapter/CLI 7.10.0, com client ESM gerado em `apps/api/src/generated/prisma` (ignorado no Git). Build gera o client antes de compilar. Os testes usam `tsx`/Vitest; providers com dependências devem usar factories ou `@Inject` explícito porque a transformação rápida não emite metadata de tipos de construtor.

Overrides pontuais de `multer` 2.4.0, `deepmerge-ts` 8.0.2 e `mysql2` 3.24.4 corrigem advisories transitivos sem trocar as linhas NestJS/Prisma aprovadas. A compatibilidade é verificada por generate, migrate deploy, build e integração. Rever esses overrides ao atualizar os pacotes pais. Não existem uploads nem MySQL no produto.

F1 continua sendo fundação técnica. Conteúdo real e integração Jira validada são obrigatórios antes do primeiro piloto útil.

## REST Client no VS Code

Manter `restclient/*.http` atualizado é requisito de desenvolvimento para toda criação, alteração ou remoção de endpoint (instruções permanentes em `AGENTS.md`). Organizar por funcionalidade, incluir exemplos executáveis e os resultados esperados, cobrir sucesso e erros relevantes e usar somente dados fictícios, sem segredos versionados.

Com a API iniciada por `npm run dev:api`, abrir `restclient/health.http`, `restclient/errors.http` ou `restclient/auth.http` e clicar em **Send Request**. Ajustar `@baseUrl` se a porta local mudar. Os cenários de saúde/erros não alteram dados; o arquivo auth cria e revoga sessões. Execute seus blocos em ordem. Conferir as respostas manualmente. Ver `restclient/README.md` para o procedimento completo; `npm test` continua responsável pela verificação automatizada de persistência e demais contratos.

## Administrador e autenticação

Após aplicar migrations, crie seu administrador uma única vez, no terminal local:

```powershell
npm run admin:bootstrap -w @forge-sbd/api
```

O comando pede email, senha de 12–128 caracteres sem eco e confirmação. Não recebe credenciais por argumentos ou stdin redirecionado. Email é normalizado; senha preserva espaços. Se já existir usuário, aborta sem alterar dados. Uma transação com lock impede duas criações simultâneas. Nenhum administrador ou senha padrão é criado ao iniciar a API. O operador escolhe sua senha; não incluí-la em arquivos versionados.

| Rota | Comportamento |
|---|---|
| POST /api/v1/auth/login | Origin igual a WEB_ORIGIN, JSON estrito com email/password; 200 com user/csrfToken e cookies |
| GET /api/v1/auth/me | Sessão válida e cookie CSRF correspondente; 200 com user/csrfToken sem rotacionar tokens |
| POST /api/v1/auth/logout | Sessão válida, Origin autorizado e X-CSRF-Token; 204, revogação no banco e remoção dos cookies |

Cookies `forge_session` e `forge_csrf`: HttpOnly, SameSite=Lax, Path=/, duração de oito horas e Secure quando NODE_ENV=production. Não definir NODE_ENV=production para o teste local por HTTP. O banco armazena somente os hashes dos tokens. Senhas usam scrypt assíncrono, sal individual e parâmetros do plano. Respostas de sucesso da autenticação usam Cache-Control: no-store.

Guards globais protegem rotas futuras por padrão; somente saúde e login recebem a marcação Public. Mutações exigem origem autorizada e token CSRF vinculado à sessão; login exige Origin mesmo sendo público. Manter o frontend no proxy local previsto, sem habilitar CORS amplo. A origem configurada para o frontend (localhost:5173 por padrão) pode diferir do host da API no REST Client; o header deve corresponder exatamente a WEB_ORIGIN.

Login limita cinco falhas em quinze minutos por IP+email normalizado, com reserva de tentativas em andamento e no máximo dez mil chaves. O limite é local ao processo, não compartilhado entre instâncias e reinicia com a API; esse desenho atende ao ambiente local desta entrega. O IP vem da conexão, sem confiar em X-Forwarded-For. Entradas expiradas são removidas durante novas tentativas.

O seed de administrador existe somente no suporte de testes e recusa banco cujo nome não termine em _test. `npm test` cobre login/logout, expiração, tokens inválidos, CSRF, Origin, corpo inválido/excessivo, limitação com relógio controlado, bootstrap concorrente e leitura de senha sem eco.

Antes de usar o login do REST Client, execute `npm run restclient:credentials -w @forge-sbd/api`. Esse comando pede email/senha com senha sem eco e grava JSON válido em `restclient/login.local.json`, ignorado pelo Git. O arquivo contém credenciais locais em claro; remova-o após testar. Para atualizar, remova-o e execute novamente; o comando não sobrescreve arquivos existentes. Essa alternativa evita o prompt visível da extensão instalada 0.25.1 e trata corretamente senhas com aspas e barras. Ela não cria nem altera usuários no banco.

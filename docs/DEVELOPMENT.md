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

A API escuta somente em `127.0.0.1`, na porta `API_PORT` (3000 por padrão). `createApp()` monta e inicializa a aplicação sem abrir porta; `main.ts` faz listen e configura encerramento. Nesta tarefa, somente saúde é uma rota pública implementada; login, portfólio e avaliações entram nas tarefas seguintes. Ainda não existe frontend utilizável.

Erros HTTP têm `{code,message,requestId}` e o header `X-Request-Id`; mensagens não expõem detalhes do banco. O corpo JSON está limitado a 128 KB, Helmet está ativo e o parser de cookies está preparado para a tarefa 4. O frontend futuro usará proxy `/api` e `WEB_ORIGIN=http://localhost:5173`.

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

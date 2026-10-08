# Execução da tarefa 5

Plano: docs/superpowers/plans/2026-09-18-forge-sbd-entrega-1-plan.md
Base: a6da7e3, main com PR #3 integrado. Branch feat/portfolio-survey, checkout original.

## Escopo e interfaces

- Implementar somente a tarefa 5: aplicações, projetos, questionário atual e rascunho com revisão otimista, validação, auditoria transacional e exemplos REST Client.
- O pedido inicial citava a tarefa 3, já integrada (PR #2). Confirmado com o usuário que a etapa correta é a tarefa 5; nenhuma tarefa anterior foi refeita.
- Consome: validateQuestionnaire/deriveContext (tarefa 2), DatabaseService/AuditService/schema (tarefa 3), guards globais de sessão/CSRF e request.user (tarefa 4).
- API/frontend locais; Docker somente PostgreSQL. Jira continua obrigatório antes do piloto.

## Decisões

- Migration nova `20261008000000_listing_order`: `Project.createdAt` e índices para a ordenação createdAt+id exigida pelo plano. Migration inicial não foi editada. Diff Prisma entre banco migrado e schema: vazio.
- Paginação por `limit` (1–100, padrão 50) e `offset`, resposta `{items,nextOffset}`.
- Erro estrutural do payload: 400. Pergunta, opção ou confirmação não declarada no questionário: 422. Revisão antiga: 409 `REVISION_CONFLICT` com mensagem específica (filtro de erros passou a aceitar código/mensagem seguros de exceções 4xx).
- Rascunho criado na mesma transação do projeto. PATCH do rascunho mescla somente as chaves enviadas e usa updateMany por projectId+revision.
- Pergunta que volta a ficar ativa com resposta guardada entra em needsConfirmationIds; sai ao ser respondida de novo ou listada em confirmedIds. O cálculo é repetido até estabilizar, pois respostas não confirmadas podem mudar a visibilidade de dependentes. Mudança de domínios no PATCH do projeto recalcula as pendências e avança a revisão do rascunho.
- Domínios gravados na ordem canônica; repetição recusada. Sem exclusão de respostas nesta entrega (usar desconhecimento).
- Questionário carregado e validado na inicialização a partir de `CONTENT_DIRECTORY` (padrão: pasta content da raiz, resolvido como caminho absoluto).
- A API passa a depender dos workspaces contracts/rules; `pretest` e `pretypecheck` na raiz compilam esses pacotes antes.

## Verificações

- Baseline: npm test passou, 61 testes.
- RED: seis testes de integração falharam com 404 das rotas ausentes; teste de configuração falhou por contentDirectory ausente.
- GREEN: 8 testes de integração da tarefa (CRUD, retomada, conflitos, confirmação, paginação, sessão/CSRF, inválidos, concorrência e rollback de auditoria). Mutações temporárias confirmaram que os testes de concorrência e rollback detectam a remoção da revisão no updateMany e a escrita fora da transação; ambas revertidas.
- Retomada após reinício: o suporte ganhou `restart()`, que fecha a API e abre outra instância no mesmo banco de teste sem limpeza intermediária.
- npm test: 70 testes passaram (34 API/configuração e 36 motor). npm run typecheck e npm run build passaram. git diff --check sem problemas.
- REST Client: `restclient/portfolio.http` com 21 requisições, lido do próprio arquivo e executado contra a API compilada e via tsx, apontada para o banco `_test` com administrador fictício: todos os status esperados. auth/health/errors também repetidos no modo tsx sem falhas. Estado final conferido no banco (revisão, pendências e eventos de auditoria). Banco `_test` limpo e login.local.json temporário removido. A interface gráfica da extensão não foi automatizada.
- Migration aplicada aos bancos forge_sbd_test e forge_sbd com migrate deploy, sem reset; segunda execução sem pendências.
- npm audit: 1 vulnerabilidade alta pré-existente em source-map-js 1.2.1 (somente desenvolvimento, via vitest/vite/postcss; GHSA-68fv-2mgg-jv7q). O lockfile desta tarefa só acrescentou os workspaces internos. Não corrigido nesta tarefa; pendência registrada.

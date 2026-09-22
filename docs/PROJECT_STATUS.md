# ForgeSBD — estado do projeto

Atualizado em 22/09/2026.

## Objetivo permanente

Solução própria com equivalência funcional ao SD Elements para estabelecer Security by Design. Questionário amplo e contextual, biblioteca real de boas práticas e geração de cards Jira são centrais. Jira é obrigatório para o primeiro piloto útil.

## Execução autorizada

Desenho e plano F1 aprovados; execução tarefa por tarefa. Repositório: C:\projetos\apps\forge-sbd; remoto https://github.com/carreiras/forge-sbd.git. A fundação foi integrada à main em b7520ee (PR #1). Tarefa 3 implementada na branch local feat/api-persistence, no checkout original solicitado. API e frontend são locais; Docker somente para PostgreSQL.

## Progresso verificado

- Fundação: workspaces TypeScript, contratos, motor ternário explicável, validação limitada de regras, 24 perguntas e dez controles demonstrativos.
- Node portátil 24.21.0 verificado com SHA256 oficial; npm 11.19.0. Runtime da sessão original é anterior; usar Node 24.21.0+ da linha 24 no PATH.
- PostgreSQL 17 dedicado healthy em 127.0.0.1:5438, container forge-sbd-postgres; bancos forge_sbd e forge_sbd_test separados. Senha local em .env ignorado pelo Git.
- Tarefa 3: API NestJS 11.2.5 e Prisma 7.10.0 ESM com adapter-pg; oito entidades, migration inicial, FKs restritivas, unicidade de avaliações/requisitos e auditoria transacional.
- Migration aplicada aos dois bancos; segunda execução no banco de teste confirmou ausência de pendências, sem reset.
- createApp inicializa sem listen; main escuta apenas em 127.0.0.1. Saúde pública GET /api/v1/health retorna {status:"ok"}. Erros estruturados com requestId, Helmet e limite JSON de 128 KB.
- Suporte de testes recusa banco remoto, nome sem _test, parâmetros de conexão ou mesmo destino de DATABASE_URL; confirma current_database e serializa limpeza com advisory lock.
- 42 testes passaram: 36 do motor e seis da API/configuração, incluindo integração real PostgreSQL, persistência após reconectar, histórico, unicidade, rollback de auditoria e erros HTTP.
- Typecheck e build completos passaram. Smoke HTTP dos processos compilado e tsx passou. A primeira tentativa de build foi bloqueada pela sandbox em dist existente; repetição com permissão adequada passou.
- npm audit: zero vulnerabilidades após overrides pontuais documentados em docs/DEVELOPMENT.md. Revisão independente da tarefa 3 sem achados acionáveis.

## Próximo trabalho

Tarefa 4 do plano: hash de senha, bootstrap do administrador, login, sessões, CSRF, expiração e limitação de tentativas. Implementar seedTestAdmin junto à função real de hash, conforme decisão registrada em docs/task-3-execution.md. Em seguida tarefas 5–6 (portfólio/rascunhos e avaliações imutáveis), frontend e aceite integrado.

A tarefa 3 entrega a base REST e a persistência, não os endpoints de negócio. Autenticação, frontend utilizável e integração Jira ainda não estão implementados. Imutabilidade completa de avaliações no fluxo da API será validada na tarefa 6; as FKs atuais impedem remoção em cascata do histórico.

F1 ainda não está concluída. F2 amplia conteúdo real e editor. F3 implementa Jira obrigatório antes do piloto. Manter roadmap e matriz de equivalência como referência das fases posteriores.

## Pendências

- Jira Cloud/Data Center ainda desconhecido; URL, destino, workflow e credenciais ainda não definidos.
- Tecnologias reais da VOLL e políticas internas ainda não informadas.
- 120 perguntas são inventário candidato, não catálogo implementado.
- 42 capacidades são critérios de equivalência, não funcionalidades entregues.
- Esta tarefa não fez push, merge, implantação ou criação de cards Jira.

## Ordem de leitura

1. docs/roadmap/2026-09-18-forge-sbd-roadmap-master.md
2. docs/roadmap/2026-09-18-forge-sbd-equivalencia.md
3. docs/content/2026-09-18-questionario-e-boas-praticas.md
4. docs/superpowers/specs/2026-09-18-jira-obrigatorio-design.md
5. Especificação e plano da entrega ativa em docs/superpowers.
6. docs/DEVELOPMENT.md para comandos de instalação, migrations e execução local.

# ForgeSBD — estado do projeto

Atualizado em 22/09/2026.

## Objetivo permanente

Solução própria com equivalência funcional ao SD Elements para estabelecer Security by Design. Questionário amplo e contextual, biblioteca real de boas práticas e geração de cards Jira são centrais. Jira é obrigatório para o primeiro piloto útil.

## Execução autorizada

Desenho e plano F1 aprovados; execução tarefa por tarefa. Repositório: C:\projetos\apps\forge-sbd; remoto https://github.com/carreiras/forge-sbd.git. Fundação integrada em b7520ee (PR #1) e tarefa 3 integrada em 6051647 (PR #2). Tarefa 4 implementada na branch local feat/admin-auth, no checkout original solicitado. API e frontend são locais; Docker somente para PostgreSQL.

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

## Tarefa 4 — autenticação validada em 22/09/2026

- Login, consulta de sessão e logout REST implementados. Senhas scrypt com sal individual; tokens aleatórios de sessão e CSRF armazenados somente como hashes; cookies HttpOnly/Lax, oito horas e Secure em produção.
- Guards globais exigem sessão nas rotas e Origin/CSRF nas mutações; saúde e login públicos, com Origin obrigatório no login. Email normalizado e payload de login estrito.
- Limite de cinco falhas em quinze minutos por IP+email, com reserva de tentativas concorrentes, limpeza de expirados e limite de dez mil chaves. Estado local ao processo.
- Bootstrap interativo com senha sem eco e confirmação; recusa administrador existente e serializa criações concorrentes. Nenhum administrador real foi criado nesta tarefa.
- REST Client: auth.http cobre login, sessão, logout e erros. Comando restclient:credentials gera login.local.json ignorado pelo Git; evita prompt visível da extensão instalada e preserva senhas com aspas/barras. O arquivo local contém senha em claro e deve ser removido após os testes.
- Verificação final: 61 testes passaram (25 API/configuração e 36 motor); typecheck e build completos passaram. Doze blocos HTTP passaram em dois processos reais (compilado e tsx), totalizando 24 requisições. Bootstrap e geração de credenciais testados em terminal real sem eco de senha. Somente dados fictícios no banco _test; arquivo local temporário removido.
- Revisão independente apontou dois problemas no fluxo REST Client; ambos corrigidos e verificados. Núcleo de autenticação sem defeito confirmado na revisão. Não houve mudança de dependências ou schema nesta tarefa.

## Próximo trabalho

Tarefa 5 do plano: cadastro de aplicações/projetos e rascunho do questionário com revisão otimista, validação, auditoria transacional e exemplos REST Client. Depois, tarefa 6 (avaliações imutáveis), frontend e aceite integrado.

API de autenticação disponível; endpoints de portfólio/avaliações, frontend utilizável e integração Jira ainda não estão implementados. F1 continua incompleta. F2 amplia conteúdo real e editor; F3 implementa Jira obrigatório antes do piloto útil.

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

## Testes manuais REST Client — 22/09/2026

A pedido do usuário, adicionada a pasta `restclient` com `health.http`, `errors.http` e instruções de uso. Os três exemplos foram lidos dos próprios arquivos e executados contra uma instância local temporária da API: saúde 200, rota inexistente 404 e JSON malformado 400; corpo JSON, requestId e header de segurança conferidos. A interface da extensão no VS Code não foi automatizada. Nenhum dado foi alterado.

`AGENTS.md` registra a regra permanente: toda entrega de endpoint deve incluir a criação/atualização dos exemplos REST Client, com sucesso, erros relevantes, instruções de autenticação quando disponíveis e sem segredos versionados. Procedimento também registrado em `docs/DEVELOPMENT.md`. Próxima tarefa permanece a 4; seus endpoints de login/sessão deverão incluir os arquivos `.http` correspondentes.

## Instruções consolidadas — 22/09/2026

AGENTS.md ampliado com fontes de referência, arquitetura e invariantes, convenções de código, obrigatoriedade do REST Client, comandos de verificação, critérios de conclusão e regras de Git. Mantém o progresso neste documento e os detalhes operacionais em DEVELOPMENT.md. Revisados texto, referências locais e existência dos scripts citados; mudança apenas documental, sem nova execução da suíte de aplicação. Próximo passo permanece a tarefa 4.

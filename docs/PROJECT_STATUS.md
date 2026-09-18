# ForgeSBD — estado do projeto

Atualizado em 18/09/2026.

## Objetivo permanente

Solução própria com equivalência funcional ao SD Elements para estabelecer Security by Design. Questionário amplo e contextual, biblioteca real de boas práticas e geração de cards Jira são centrais. Jira é obrigatório para o primeiro piloto útil.

## Execução autorizada

Desenho e plano F1 aprovados. Usuário autorizou execução nesta conversa, tarefa por tarefa. Repositório: C:\projetos\apps\forge-sbd; remoto https://github.com/carreiras/forge-sbd.git. Branch de trabalho: feat/foundation, no checkout original.

## Progresso verificado

- Documentação de escopo e Jira registrada no commit e73c065.
- Node 24.21.0 portátil verificado com SHA256 oficial; npm 11.19.0.
- Workspaces TypeScript: contratos, motor ternário com explicações e validação limitada de regras.
- Questionário demonstrativo com 24 perguntas condicionais e catálogo com 10 controles de demonstração.
- 36 testes passaram; typecheck e build passaram.
- Vitest atualizado para 4.1.11 após identificação de advisory; auditoria anterior à configuração Docker: zero vulnerabilidades.
- Docker existente confirmado. PostgreSQL 17 dedicado está healthy em 127.0.0.1:5438.
- Bancos forge_sbd e forge_sbd_test confirmados por consulta.
- Porta 5438 evita conflito com outro projeto na 5432.
- Senha local aleatória em .env ignorado pelo Git.

## Próximo trabalho

Continuar tarefa 3 do plano: Prisma, migrations, API REST e testes com banco dedicado. Em seguida autenticação, portfólio/rascunhos, avaliações imutáveis e frontend. F1 ainda não está concluída; não há interface utilizável nem integração Jira implementada.

F2 amplia conteúdo real e editor. F3 implementa Jira obrigatório antes do piloto. Manter roadmap e matriz de equivalência como referência das fases posteriores.

## Pendências

- Jira Cloud/Data Center ainda desconhecido; URL, destino, workflow e credenciais ainda não definidos.
- Tecnologias reais da VOLL e políticas internas ainda não informadas.
- 120 perguntas são inventário candidato, não catálogo implementado.
- 42 capacidades são critérios de equivalência, não funcionalidades entregues.
- Nenhum push, implantação ou card Jira criado.

## Ordem de leitura

1. docs/roadmap/2026-09-18-forge-sbd-roadmap-master.md
2. docs/roadmap/2026-09-18-forge-sbd-equivalencia.md
3. docs/content/2026-09-18-questionario-e-boas-praticas.md
4. docs/superpowers/specs/2026-09-18-jira-obrigatorio-design.md
5. Especificação e plano da entrega ativa em docs/superpowers.

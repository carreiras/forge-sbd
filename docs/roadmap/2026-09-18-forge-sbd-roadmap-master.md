# ForgeSBD — roadmap mestre e continuidade

Atualização: 18/09/2026. Autorização desta revisão: o usuário aprovou expandir o planejamento e tornou Jira obrigatório. Esta revisão registra escopo de produto e fases; não autoriza criar cards reais nem conectar contas corporativas.

## 1. Objetivo que deve permanecer em todas as fases

Construir uma solução própria com equivalência funcional ao SD Elements para uso inicial pelo idealizador e posterior adoção na VOLL. A referência abrange questionários extensos por domínio, seleção contextual de requisitos, orientações de implementação, gestão de risco, evidências e verificação, tickets, relatórios, modelagem de ameaças e automação.

As 24 perguntas e os dez controles demonstrativos da entrega 1 validam o mecanismo; não definem o escopo final. Encerrar o trabalho nessa entrega não atende ao objetivo do usuário.

Equivalência é uma meta verificada por capacidade e fluxo. Não significa reprodução de marca, interface, código ou catálogo comercial. A cobertura observável será registrada na matriz de equivalência; capacidades desconhecidas permanecem pendentes de confirmação. Não declarar paridade total apenas pela semelhança visual ou pela existência dos módulos.

## 2. Requisitos de produto obrigatórios

| ID | Requisito | Critério de conclusão |
|---|---|---|
| PR-001 | Todos os domínios solicitados | Web, API, mobile, backend, infra, cloud e CI/CD têm perguntas e controles próprios revisados |
| PR-002 | Questionário amplo e condicional | Perfil combinado mostra perguntas pertinentes, ajuda, desconhecimento, dependências, rascunho e revisão |
| PR-003 | Requisitos contextuais | Cada requisito registra contexto, regra, fonte, versão e motivo de seleção |
| PR-004 | Boas práticas acionáveis | Orientação e critérios de aceite/teste por requisito, com exemplos pertinentes à tecnologia |
| PR-005 | Jira obrigatório | Ao finalizar a avaliação publicada, produzir os cards aplicáveis no projeto Jira configurado, com vínculo e acompanhamento |
| PR-006 | Histórico seguro | Atualizações de respostas, controles e regras não apagam decisões nem evidências anteriores |
| PR-007 | Implementação e verificação separadas | Card Done não representa automaticamente controle verificado |
| PR-008 | Gestão de exceções | Justificativa, decisão, compensação, validade e revisão rastreáveis |
| PR-009 | Conteúdo mantido | Fonte e versão, ciclo de revisão/publicação e rastreio de controles obsoletos |
| PR-010 | Portfólio e relatórios | Visibilidade por aplicação/projeto, pendências, evidências, conformidade e evolução |
| PR-011 | Migração corporativa | Configuração por ambiente, banco migrável, backup/restauração, acesso e operação documentados |
| PR-012 | Evolução até a referência | Diagramas, reutilização, scanners, CI/CD, repos, treinamento, automação e IA permanecem no backlog de equivalência |

## 3. Decisões consolidadas

- Nome: ForgeSBD; pasta: C:\projetos\apps\forge-sbd.
- Remoto observado: https://github.com/carreiras/forge-sbd.git.
- Usuário inicial: idealizador; colaboração e SSO entram posteriormente.
- Plataforma web e API REST; Node.js/TypeScript, React, NestJS e PostgreSQL conforme desenho aprovado.
- Monólito modular; catálogos/questionários versionados e motor declarativo explicável.
- GitHub inicialmente armazena o ForgeSBD; analisar repositórios das aplicações é outra capacidade.
- Jira deixou de ser uma integração opcional futura. Sua criação de cards é condição para o primeiro piloto útil.
- Finalização é evento explícito de publicação da avaliação. Salvar rascunho ou pré-visualizar requisitos não envia cards.
- Com destino Jira configurado e automação habilitada, publicação enfileira a sincronização automaticamente; envio manual e prévia são recursos adicionais.
- Contextos pessoais de desenvolvimento usam projetos fictícios e catálogos demonstrativos até revisão do conteúdo.
- Não há decisão confirmada sobre Jira Cloud ou Data Center. Planejar interface de adapter; implementar/validar inicialmente a edição efetivamente usada. Não prometer dois conectores prontos sem teste.

## 4. Ordem de entregas revisada

| Fase | Resultado | Dependências | Saída verificável |
|---|---|---|---|
| F0 — referência e rastreio | Escopo, matriz, fontes e backlog versionados | Documentação pública e decisões do usuário | Documentos deste pacote, perguntas abertas registradas |
| F1 — núcleo técnico | Login, projetos, questionário demo e requisitos explicados | Plano de entrega 1 | Fluxo web/API persistente validado com dados fictícios |
| F2 — conteúdo e questionário amplo | Biblioteca real inicial, perguntas por domínio, publicação e testes de regras | F1; revisão das fontes e do conteúdo | Cobertura documentada dos sete domínios; catálogo não-demo revisado |
| F3 — Jira obrigatório | Prévia, destino/mapeamento, criação automática, vínculos e retomada | Avaliações publicadas e catálogo versionado | Finalizar questionário cria cards úteis no ambiente de teste da edição escolhida |
| F4 — execução, verificação e evolução | Evidências, exceções, status Jira, comparação e releases | F1–F3 | Cards e requisitos acompanhados sem perder história nem simular verificação |
| F5 — governança e operação | Políticas, relatórios, equipes, acesso corporativo e migração | Fluxo piloto validado | Backup restaurado, métricas explícitas e responsabilidades definidas |
| F6 — arquitetura e reutilização | Diagramas, ameaças, importação de modelos, componentes e visão de sistema | Contexto e avaliações estáveis | Arquitetura gera requisitos com proveniência, herança tem escopo e validade |
| F7 — automação técnica | Scanners, gates CI/CD, descoberta por repositórios e eventos | F4/F5; API e permissões maduras | Automação declara cobertura e não aprova controles pela simples ausência de achados |
| F8 — assistência e treinamento | Treinamento contextual, assistente e MCP/agentes | Catálogo revisado e governança | Assistência respeita permissões e registra ações e fontes |
| F9 — auditoria de equivalência | Comparação integral com referência e revisão das lacunas | Matriz atualizada em todas as fases | Funcionalidades verificadas, parciais e faltantes declaradas explicitamente |

F2 e o desenho do conector F3 podem ser trabalhados em paralelo por quem executa, sem reduzir o gate do piloto. Não começar a construir todos os subsistemas ao mesmo tempo. Cada fase recebe uma especificação e seu plano técnico ao ser iniciada; ainda não existem planos executáveis completos de F2–F9.

## 5. Gate do primeiro piloto útil

F1 é um incremento técnico. O piloto só pode ser denominado útil ao objetivo principal quando:

- Questionário real consegue caracterizar um projeto combinado com desenvolvimento, infra e cloud.
- Controles têm regras e fontes revisadas, orientação e critério de aceite.
- Publicar avaliação gera cards Jira com o conteúdo correto no projeto configurado.
- Repetir publicação/sync não duplica cards; falha parcial tem retomada.
- O operador vê quais requisitos precisam de informação, execução ou verificação.
- Atualizar o questionário não apaga o vínculo dos tickets nem as avaliações passadas.
- O ambiente usado e o tratamento de dados foram definidos para o piloto.

Sem Jira validado, não marcar PR-005 concluído nem declarar o ForgeSBD equivalente ao fluxo observado pelo usuário.

## 6. Documentos que viajam com o projeto

| Documento no repositório | Finalidade |
|---|---|
| docs/superpowers/specs/2026-09-18-forge-sbd-design.md | Desenho inicial; ler o adendo desta revisão |
| docs/superpowers/specs/2026-09-18-forge-sbd-entrega-1-spec.md | Incremento técnico de fundação |
| docs/superpowers/plans/2026-09-18-forge-sbd-entrega-1-plan.md | Tarefas executáveis da fundação |
| docs/roadmap/2026-09-18-forge-sbd-roadmap-master.md | Objetivo, gates, fases, decisões e continuidade |
| docs/roadmap/2026-09-18-forge-sbd-equivalencia.md | Capacidades da referência e rastreio da equivalência |
| docs/content/2026-09-18-questionario-e-boas-praticas.md | Inventário inicial, modelo de conteúdo, rastreabilidade e revisão |
| docs/superpowers/specs/2026-09-18-jira-obrigatorio-design.md | Fluxo Jira e comportamento de sincronização |
| docs/PROJECT_STATUS.md | Situação atual e próximo trabalho |

## 7. Protocolo para não perder decisões

No início de cada sessão: ler PROJECT_STATUS, roadmap mestre, matriz e a especificação/plano da fase ativa; conferir git status e instruções locais. Não reconstruir requisitos apenas de memória da conversa.

Ao terminar uma tarefa: atualizar seu estado, registrar testes realmente executados, limitações, alterações de escopo e próximo passo em PROJECT_STATUS. Atualizar a matriz somente quando houver evidência de aceite. Documentação elaborada não equivale a funcionalidade implementada.

Cada requisito futuro recebe ID estável. Cada pergunta aponta para fatos/contexto; cada controle aponta para regras/fontes/testes; cada card aponta para controle, projeto e avaliação. IDs não são reciclados quando conteúdo é retirado.

Alterações importantes entram como decisão com data, motivo e efeito nas fases. Se houver divergência entre documentos, prevalecem as decisões explícitas mais recentes do usuário; atualizar os textos afetados, sem remover a história da decisão.

## 8. Perguntas abertas que não bloqueiam a fundação

| Questão | Quando precisa ser resolvida |
|---|---|
| Jira Cloud ou Data Center; versão/URL | Antes de implementar o adapter e seus testes de contrato |
| Projeto/tipos de issue/campos obrigatórios/workflow | Antes do teste Jira real e do piloto |
| Autenticação e conta de integração autorizadas | Antes de conectar Jira |
| Parent/épico, assignee e política de responsáveis | Antes de habilitar criação automática |
| Tecnologias concretas mais usadas na VOLL | Antes de definir prioridade dos how-tos e catálogos |
| Políticas internas e criticidade | Antes de publicar requisitos corporativos |
| Ambiente e papéis de revisão na VOLL | Antes da migração e colaboração |

Nenhum dado ausente será inventado. Jira permanece obrigatório mesmo enquanto essas configurações estão em aberto.

## 9. Critérios de conteúdo e manutenção

Cobertura se mede por rastreabilidade e cenários de contexto, não pela quantidade de perguntas. O inventário de perguntas é ponto de partida; a matriz de fontes revelará perguntas ou controles adicionais. Não declarar 'questionário completo' antes de mapear os padrões selecionados e testar os perfis combinados.

Revisão ordinária sugerida: trimestral, mais revisão extraordinária quando fonte/tecnologia mudar ou surgir erro de aplicabilidade. Registrar data, responsável e versão, sem promover atualizações silenciosas aos projetos em andamento.

## 10. Referências

- [SD Elements: capacidades](https://docs.sdelements.com/master/guide/).
- [SD Elements: sincronização com issue trackers](https://docs.sdelements.com/release/latest/guide/docs/integrations/issue_tracker_integration/understand.html).
- [SD Elements: conexão por projeto](https://docs.sdelements.com/release/latest/guide/docs/integrations/issue_tracker_integration/project_connection.html).

A documentação confirma exportação de contramedidas para itens de trabalho, sincronização configurável e mapeamento de estados. Não afirma que toda instalação envie automaticamente ao mero salvar do questionário. No ForgeSBD, o gatilho de publicação foi proposto para atender ao fluxo solicitado.

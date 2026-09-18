# ForgeSBD — análise funcional e proposta inicial

Data: 18/09/2026. Estado: desenho geral aprovado; implementação não iniciada. Revisão de escopo em 18/09/2026: equivalência funcional como objetivo final e Jira obrigatório para o primeiro piloto útil.

## 1. Objetivo e decisões confirmadas

Criar uma plataforma para estabelecer Security by Design e padrões de desenvolvimento seguro, inicialmente operada por seu idealizador e posteriormente migrada para a VOLL.

- Interface web e API REST com Node.js.
- GitHub para código e documentação do ForgeSBD.
- Desenvolvimento inicial em notebook pessoal.
- Cobertura de aplicações web, APIs, mobile, backend, infraestrutura, cloud e pipelines.
- Requisitos selecionados por regras explicáveis e conteúdo revisado.
- Integração com repositórios avaliados não foi solicitada para a primeira versão.

## 2. Método e limites da análise

Inventário baseado na documentação pública oficial do SD Elements, consultada em 18/09/2026. É um levantamento das famílias de funcionalidades e dos mecanismos documentados, não uma garantia de exaustividade de cada tela, endpoint ou edição comercial. As páginas `master` e `latest` mudam; a versão efetiva, os recursos habilitados e o licenciamento precisam ser confirmados para comparar uma instalação específica.

As funcionalidades do SD Elements são referências de comportamento. A arquitetura e as regras propostas abaixo são decisões próprias para o ForgeSBD. Não representam acesso ao código, ao catálogo comercial completo nem ao algoritmo proprietário do produto.

## 3. Inventário funcional e destino proposto

| Família | Capacidade documentada do SD Elements | Destino no ForgeSBD |
|---|---|---|
| Portfólio | Unidades de negócio, aplicações, projetos, membros, tags e atributos | Aplicações e projetos na primeira versão; unidades e equipes depois |
| Releases | Reaproveitamento de contexto, estados, notas e integrações entre releases | Primeiro histórico de avaliações; herança entre releases em evolução posterior |
| Arquivamento | Retenção de projetos com restrições de alteração e integração | Arquivamento sem apagar histórico |
| Questionários | Perguntas de seleção única ou múltipla, obrigatórias, ocultas, dependências e respostas implicadas | Questionário condicionado ao contexto, com opção explícita de desconhecimento |
| Perfis | Configurações predefinidas para iniciar projetos | Modelos iniciais por domínio, combináveis |
| Atributos | Propriedades do projeto derivadas de respostas ou componentes no novo motor de decisão | Contexto estruturado independente da apresentação do questionário |
| Regras | Lógica booleana para selecionar fraquezas, controles e conteúdo complementar | Regras declarativas, versionadas e testáveis |
| Explicabilidade | Visualização da razão de inclusão dos controles | Mostrar fatos e regra que selecionaram cada requisito |
| Biblioteca | Fraquezas, controles, solução, prioridade e fase | Biblioteca própria com critérios de aceite e fontes |
| Orientações | How-tos e requisitos adicionais condicionais | Orientações específicas por tecnologia e complemento de políticas |
| Personalização | Conteúdo customizado, fases, estados, atributos e pacotes | Edição controlada de catálogo; revisão antes de publicar |
| Importação/exportação | Movimentação de conteúdo da biblioteca | Formato próprio versionado, validado antes de importar |
| Execução | Lista de controles por projeto, estados e inclusão manual | Pendências, progresso, notas e adição manual com justificativa |
| Verificação | Estados de verificação próprios, notas e histórico de resultados | Verificação manual com resultado, método, data e evidência |
| Risco | Políticas filtram controles e definem combinações aceitáveis de execução e verificação | Política inicial explícita; sem pontuação de risco arbitrária |
| Classificação | Classificação de projeto e associação com políticas | Classificação manual fundamentada no início |
| Conformidade | Conteúdo associado a regulamentos e normas customizadas | Referências versionadas; atendimento técnico não implica certificação |
| Diagramas | Modelagem visual da arquitetura | Registro textual e referências na primeira versão; editor visual depois |
| Devici | Importação de modelos e geração de controles; recurso dependente de habilitação | Possível importação futura, após definir formato e necessidade |
| Reutilização | Componentes compartilham controles com consumidores | Controles herdados com escopo, versão e evidência em fase posterior |
| Tickets | Sincronização de controles com ferramentas de trabalho | Jira obrigatório na fase F3, antes do piloto útil; demais conectores posteriores |
| Scanners | Importação e mapeamento de achados para verificar controles | Conectores posteriores; não criar um scanner próprio na primeira versão |
| CI/CD | Gates associados às políticas de segurança | Futuro endpoint de avaliação de política |
| Repositórios | Extração de contexto para respostas e componentes | Automação futura com revisão humana |
| Relatórios | Visões de projeto, organização, tendências e dashboards | Painel básico e exportação CSV; tendências depois |
| Visão de sistema | Agrupamento de projetos para análise conjunta | Posterior ao cadastro de dependências |
| Treinamento | Conteúdo de treinamento no contexto do requisito | Orientações e links inicialmente; gestão de treinamento depois |
| AI Navigator | Assistente contextual de segurança | Posterior; decisões de aplicabilidade continuam rastreáveis |
| MCP e agentes | Interação por ferramentas e fluxos para configurar, aplicar e verificar requisitos | Posterior a uma API estável com permissões e auditoria |
| Automação | Eventos e ações para estados, notas e notificações | Rotinas simples primeiro; motor de automação posteriormente |
| Identidade | Usuários, grupos, papéis globais e por projeto, autenticação e LDAP | Um administrador autenticado; equipes e SSO na evolução corporativa |
| Administração | Flags, conectores e configuração do ambiente | Configuração por ambiente e gestão dos catálogos |

Fontes específicas:

- [Projetos e releases](https://docs.sdelements.com/master/guide/docs/projects/).
- [Questionário da biblioteca](https://docs.sdelements.com/master/guide/docs/library/project_settings.html).
- [Atributos do novo motor](https://docs.sdelements.com/release/latest/guide/docs/library/attributes_DE.html).
- [Regras do novo motor](https://docs.sdelements.com/release/latest/guide/docs/library/rules_DE.html).
- [Explicabilidade](https://docs.sdelements.com/master/guide/docs/projects/project_countermeasures/explainable_mapping.html).
- [Biblioteca de contramedidas](https://docs.sdelements.com/master/guide/docs/library/countermeasures.html).
- [Execução por projeto](https://docs.sdelements.com/master/guide/docs/projects/project_countermeasures/).
- [Verificação](https://docs.sdelements.com/master/guide/docs/integrations/security_tools/overview/verification_status.html).
- [Políticas de risco](https://docs.sdelements.com/master/guide/docs/risk_policies/).
- [Diagramas](https://docs.sdelements.com/master/guide/docs/threat_modeling/).
- [Componentes reutilizáveis](https://docs.sdelements.com/master/guide/docs/reusable_components/).
- [Integrações de tickets](https://docs.sdelements.com/master/guide/docs/integrations/issue_tracker_integration/).
- [Integrações de verificação](https://docs.sdelements.com/master/guide/docs/integrations/security_tools/).
- [Análise de repositórios](https://docs.sdelements.com/master/guide/docs/scan_a_repository/).
- [Dashboards](https://docs.sdelements.com/master/guide/docs/reporting/dashboards.html).
- [Fluxos com agentes](https://docs.sdelements.com/release/latest/guide/docs/agentic_ai_workflow/).
- [Automação](https://docs.sdelements.com/master/guide/docs/automations/automations.html).
- [Autenticação](https://docs.sdelements.com/master/guide/docs/authentication/).
- [Índice geral de capacidades](https://docs.sdelements.com/master/guide/).

## 4. Abordagens possíveis

| Abordagem | Benefício | Limitação |
|---|---|---|
| Checklist fixo | Fluxo muito simples para registrar controles | Pouca adaptação ao contexto e dificuldade para explicar relevância |
| Núcleo modular com regras e catálogos — recomendada | Aplicabilidade explicável, conteúdo evolutivo e implantação simples | Exige modelar e revisar regras e conteúdo desde cedo |
| Plataforma completa com integrações, diagramas e IA | Automação extensa | Muitos subsistemas antes de validar o fluxo e o catálogo |

Recomendação: um monólito modular com motor de regras e catálogos por domínio. Cobrir todos os domínios significa permitir combinar contextos e oferecer um conjunto inicial revisado para cada um, não afirmar cobertura completa de todas as tecnologias na primeira versão.

## 5. Primeira versão proposta

### Fluxo principal

1. Entrar com conta de administrador.
2. Cadastrar aplicação e projeto/avaliação, incluindo responsável, descrição, domínios e ambiente.
3. Responder questionário com tecnologias, exposição, identidade, dados e dependências.
4. Revisar informações desconhecidas ou contraditórias.
5. Gerar uma avaliação contendo requisitos e justificativas.
6. Consultar orientações e critérios de aceite de cada requisito.
7. Registrar execução, notas e referências de evidência.
8. Verificar manualmente e registrar o resultado.
9. Registrar exceções fundamentadas e sua validade.
10. Publicar avaliação e gerar automaticamente cards Jira quando o destino estiver configurado; acompanhar envio e vínculos.
11. Consultar painel e exportar os requisitos em CSV.

### Módulos

- Identidade: autenticação e conta inicial, sem cadastro público.
- Portfólio: aplicações e projetos com domínios combináveis.
- Contexto: questionário, respostas e fatos derivados.
- Catálogo: controles, orientações, fontes, regras e versões publicadas.
- Avaliações: geração de requisitos e diferenças entre avaliações.
- Execução: estados, notas, verificação e exceções.
- Evidências: links e referências de documentos; uploads em uma entrega posterior.
- Relatórios: indicadores de execução, verificação e exceções separados.
- Auditoria: ator, ação, objeto, data e mudanças relevantes.

### Domínios do catálogo

Web; API; mobile; backend; infraestrutura; cloud; CI/CD. Controles comuns de identidade, autorização, dados, segredos, dependências e observabilidade podem atender vários domínios sem duplicação.

O catálogo inicial será definido em um trabalho próprio: inventariar fontes utilizáveis, redigir controles, definir aplicabilidade e validar critérios de verificação. A pesquisa detalhada e a revisão das versões dessas fontes ocorrerão antes de publicar conteúdo. Nenhuma quantidade de controles ou cobertura normativa completa foi acordada.

## 6. Regras de negócio propostas

- Resposta desconhecida não equivale a resposta negativa.
- Regras têm resultado aplicável, não aplicável ou pendente de informação. Expressões AND/OR/NOT propagam desconhecimento de maneira definida; uma regra OR pode ser verdadeira quando um ramo conhecido já é verdadeiro.
- Um requisito guarda a versão do controle, da regra, do questionário e o contexto usado em sua geração.
- Gerar novamente com o mesmo contexto e versões não duplica requisitos.
- Mudanças produzem comparação antes de substituir a avaliação vigente.
- Requisito que deixa de se aplicar é preservado no histórico; sua evidência não é apagada.
- Edição de catálogo cria rascunho; publicação cria uma nova versão, sem reescrever avaliações anteriores.
- Implementação e verificação são dimensões separadas.
- Estados de execução propostos: pendente, em andamento, implementado e não aplicável justificado.
- Estados de verificação propostos: não verificado, aprovado, parcialmente aprovado e reprovado.
- Exceção é um registro próprio com motivo, controles compensatórios, responsável pela decisão e validade. Enquanto houver apenas um operador, a decisão fica explicitamente identificada como registrada por ele, sem simular aprovação independente.
- Exceção vencida deixa de satisfazer a política; não passa a representar implementação ou verificação.
- Um requisito só atende uma política quando suas condições explícitas forem cumpridas. Percentual de conclusão isolado não prova segurança.
- Adição manual de requisito mantém sua origem e justificativa.

Exemplo ilustrativo: projeto com API pública e recursos pertencentes a usuários recebe um requisito de autorização por recurso. A justificativa mostra os fatos utilizados. Se não se sabe como os recursos são identificados, a avaliação aponta a informação faltante. O exemplo ainda precisa ser transformado em controle revisado; não é conteúdo de segurança publicado.

## 7. Arquitetura técnica proposta

Tecnologias sugeridas, sujeitas à revisão do desenho: TypeScript; React com Vite; NestJS sobre Node.js para API REST; PostgreSQL; Prisma para persistência. Versões e compatibilidades serão verificadas na preparação do plano de implementação.

Node.js executa a API e as ferramentas de desenvolvimento/build do frontend; o frontend entregue executa no navegador.

Um repositório GitHub com workspaces:

```text
apps/web/             interface
apps/api/             API e módulos de negócio
packages/contracts/   contratos de dados compartilhados
packages/rules/       avaliação de regras sem dependência da interface
content/              catálogos e questionários versionados
docs/                 especificações, decisões e planos
```

O motor aceita apenas operadores declarativos validados; não executa código informado no catálogo. O banco registra avaliações e versões utilizadas. O catálogo usa identificadores estáveis para permitir publicação e comparação de versões.

### Entidades principais

User; Application; Project; QuestionnaireVersion; Question; AnswerSet; ContextSnapshot; CatalogVersion; ControlVersion; RuleVersion; Assessment; ProjectRequirement; ImplementationRecord; VerificationRecord; EvidenceReference; Exception; AuditEvent.

Relações essenciais: aplicação possui projetos; projeto possui avaliações; avaliação referencia contexto e catálogo publicados; requisito referencia a versão do controle e a decisão da regra; execução, verificação, evidências e exceções referenciam o requisito correspondente.

### Segurança e operação

- Conta inicial criada por procedimento explícito, sem senha padrão.
- Sessão em cookie HttpOnly, proteção CSRF e autorização na API; configuração de cookies adequada a desenvolvimento local e HTTPS em produção.
- Validação dos dados, consultas parametrizadas e renderização segura das orientações Markdown.
- Segredos fora do Git e logs sem credenciais ou corpos de evidências.
- Exportação CSV com tratamento de conteúdo interpretável como fórmula.
- Serviços locais limitados ao ambiente de desenvolvimento; configurações de produção separadas.
- Migrações reproduzíveis e backup/restauração verificados.
- Arquivos de configuração de exemplo sem dados internos.
- Dados fictícios durante desenvolvimento pessoal; futura entrada de dados corporativos seguirá o ambiente autorizado pela VOLL.

## 8. Divisão em entregas revisada

O roadmap mestre em docs/roadmap/2026-09-18-forge-sbd-roadmap-master.md detalha os gates e dependências. Jira é obrigatório antes do primeiro piloto útil. As 24 perguntas e dez controles demo da entrega 1 são fundação técnica, não o escopo final.

| Fase | Resultado |
|---|---|
| F0 | Referência, matriz de equivalência e continuidade |
| F1 | Núcleo técnico com questionário e catálogo demonstrativos |
| F2 | Questionário amplo e conteúdo real revisado para os sete domínios |
| F3 | Jira obrigatório: publicação cria cards, vínculos e recuperação de falhas |
| F4 | Execução, verificação, evidências, exceções, sincronização e evolução |
| F5 | Governança, relatórios, acesso corporativo e operação/migração |
| F6 | Diagramas, ameaças, importação e componentes reutilizáveis |
| F7 | Scanners, CI/CD, descoberta por repositórios e automação |
| F8 | Treinamento, assistência contextual e agentes/MCP |
| F9 | Auditoria das lacunas de equivalência |

Cada fase será decomposta em especificações e planos executáveis. O roadmap registra escopo futuro; não representa planos técnicos completos das fases ainda não iniciadas.

## 9. Validação do produto

- Casos de regras aplicáveis, não aplicáveis, desconhecidas e contraditórias; combinações AND/OR/NOT e limite de complexidade.
- Uma aplicação que combina mobile, API e cloud recebe controles pertinentes sem duplicações.
- Regeração não perde notas, evidências ou histórico.
- Atualizar catálogo não altera silenciosamente avaliações concluídas.
- Implementado sem verificação continua visível como não verificado.
- Exceção vencida não atende à política.
- A API impede ações sem autenticação; conteúdo malicioso não executa na interface.
- Após reiniciar, dados permanecem; restauração recupera avaliações e suas referências.
- Indicadores usam denominadores explícitos e mostram desconhecidos e exceções separadamente.

## 10. Evolução posterior

Equipes e papéis; SSO; releases com herança; dependências e visão de sistema; editor de diagramas; importação de modelos; componentes reutilizáveis; demais conectores de tickets e scanners; gates de CI/CD; extração de contexto de repositórios; tendências; automação; treinamentos; IA e MCP.

A ordem será revisada com o uso real. Integrações não devem aprovar controles automaticamente apenas por ausência de achados; a cobertura do método precisa ser explicitada.

## 11. Próxima decisão

Revisar o núcleo proposto: monólito modular, catálogos por domínio, aplicabilidade explicável, avaliações versionadas e execução separada de verificação. Após validar o desenho, executar o plano da fundação e detalhar o conteúdo amplo e o Jira obrigatório conforme o roadmap revisado. Nenhum framework, repositório remoto ou aplicação foi instalado/criado por este documento.

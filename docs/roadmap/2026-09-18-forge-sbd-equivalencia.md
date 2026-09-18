# ForgeSBD — matriz de equivalência funcional

Data: 18/09/2026. Nenhuma capacidade implementada até esta revisão. Estado 'planejada' indica intenção documentada; não indica paridade comprovada. Jira é obrigatório para o piloto.

## Critério de estados

Confirmada na referência: documentação oficial consultada. Escopo a detalhar: família documentada, mas faltam requisitos finos/edição/licença. No ForgeSBD: planejada, especificada, implementada ou validada. Só 'validada' recebe evidência de teste/aceite.

| ID | Capacidade | Base da referência | Fase | ForgeSBD nesta revisão | Aceite futuro |
|---|---|---|---|---|---|
| EQ-001 | Aplicações e projetos | Projetos | F1 | Especificada | Cadastro persiste e organiza avaliações |
| EQ-002 | Unidades, equipes e grupos | Guia geral | F5 | Planejada | Acesso e agrupamento organizacionais |
| EQ-003 | Tags e atributos customizados | Projetos | F5 | Planejada | Busca e filtragem por atributos próprios |
| EQ-004 | Arquivamento | Projetos | F5 | Planejada | Retém histórico e suspende atividades |
| EQ-005 | Releases com reaproveitamento | Projetos | F4 | Planejada | Herança explícita e revisão das mudanças |
| EQ-006 | Questionário amplo por contexto | Biblioteca de survey | F2 | Inventário inicial | Perfis dos sete domínios revisados |
| EQ-007 | Perguntas condicionais/obrigatórias | Biblioteca de survey | F1/F2 | Especificada | Dependências e desconhecimento testados |
| EQ-008 | Respostas implicadas e perfis | Biblioteca de survey/guia | F2 | Planejada | Implicação rastreada e conflitos/ciclos recusados |
| EQ-009 | Atributos derivados de respostas/componentes | Novo motor | F2/F6 | Parcialmente especificada | Mesmos fatos não dependem de uma só origem |
| EQ-010 | Motor de aplicabilidade | Regras | F1/F2 | Especificada | Decisão ternária e cenários verdadeiros/falsos/desconhecidos |
| EQ-011 | Justificativa por requisito | Explainable mapping | F1 | Especificada | Fatos e versão exibidos e persistidos |
| EQ-012 | Biblioteca de fraquezas e controles | Contramedidas | F2 | Planejada | Fonte, regra, versão e critérios verificáveis |
| EQ-013 | How-tos por tecnologia | Contramedidas | F2 | Modelo definido | Orientação selecionada por contexto |
| EQ-014 | Complementos por norma/política | Contramedidas | F2/F5 | Planejada | Complemento tem fonte e condição próprias |
| EQ-015 | Customização de conteúdo e fases | Contramedidas/guia | F2 | Planejada | Rascunho/revisão/publicação sem reescrever histórico |
| EQ-016 | Import/export e pacotes de conteúdo | Guia geral | F2 | Planejada | Validação de formato e diff antes de ativar |
| EQ-017 | Execução, notas e controles manuais | Controles por projeto | F4 | Planejada | Origem e mudança de estado auditadas |
| EQ-018 | Verificação manual e automatizada | Verificação | F4/F7 | Planejada | Resultado e cobertura separados de execução |
| EQ-019 | Políticas de risco | Políticas | F5 | Planejada | Filtros e condições explícitas |
| EQ-020 | Classificação de projetos | Guia/API | F5 | Planejada | Critério rastreável, sem score inventado |
| EQ-021 | Mapeamento de normas | Guia/regulamentos | F2/F5 | Planejada | IDs e versões de norma, escopo e evidência |
| EQ-022 | Cards Jira contextualizados | Issue tracker | F3 | Desenho detalhado; obrigatória | Finalizar avaliação cria cards com orientações e critérios |
| EQ-023 | Sincronização de estados Jira | Issue tracker | F4 | Desenho de política | Estados traduzidos sem falsificar verificação |
| EQ-024 | Outros issue trackers | Guia | Após F3 | Planejada | Conector específico validado conforme necessidade |
| EQ-025 | Scanners e mapeamento de achados | Verificação/guia | F7 | Planejada | Achado vinculado ao controle e cobertura declarada |
| EQ-026 | Gates CI/CD | Guia | F7 | Planejada | Build gate usa política versionada |
| EQ-027 | Agente de integração interno | Guia | F7 | Planejada | Conectividade e autorização em rede interna |
| EQ-028 | Descoberta por repositório | Scan repository | F7 | Planejada | Contexto sugerido tem proveniência e revisão |
| EQ-029 | Diagramas e modelos de ameaças | Threat modeling | F6 | Planejada | Fluxos/fronteiras geram ameaças e requisitos rastreáveis |
| EQ-030 | Importação Devici/modelos | Guia | F6 | Escopo a detalhar | Importação e reimportação preservam origem |
| EQ-031 | Componentes reutilizáveis | Reusable components | F6 | Planejada | Herança não vale além do escopo/versão |
| EQ-032 | Visão agregada de sistema | System view/guia | F6 | Planejada | Projetos relacionados e dependências agregados |
| EQ-033 | Relatórios de projeto e organização | Guia/reporting | F5 | Planejada | Indicadores com denominadores e estados explícitos |
| EQ-034 | Dashboards executivos e tendências | Dashboards | F5 | Planejada | Séries históricas reprodutíveis |
| EQ-035 | Treinamento contextual | Guia | F8 | Planejada | Conteúdo associado ao requisito/tecnologia |
| EQ-036 | Assistente contextual | AI Navigator/guia | F8 | Planejada | Fontes, contexto e permissões respeitados |
| EQ-037 | MCP e workflows de agentes | Agentic workflow | F8 | Planejada | Ferramentas auditadas e acesso limitado |
| EQ-038 | Automação por eventos | Automations | F7 | Planejada | Eventos, ações, retries e limites observáveis |
| EQ-039 | Papéis globais e por projeto | Guia | F5 | Planejada | Matriz de autorização testada |
| EQ-040 | SSO e provisionamento LDAP | Autenticação/guia | F5 | Planejada | Integração compatível com ambiente corporativo |
| EQ-041 | API e tokens de integração | Guia/API | F1/F7 | REST inicial especificada | Autorização, versionamento e revogação |
| EQ-042 | Busca por portfólio | Search/guia | F5 | Planejada | Respeita acesso, tags e atributos |

## Extensões próprias explicitamente propostas

Desconhecimento ternário, snapshots de avaliação, revisão otimista e recuperação de timeout ambíguo do Jira são requisitos próprios do ForgeSBD. Não presumir que o SD Elements usa a mesma implementação. Exceções com validade e fluxo de revisão independente precisam de investigação adicional para comparação fina com a referência, mas permanecem necessárias ao produto.

## Registro de evidência

Ao validar uma linha, acrescentar versão/build, cenário executado, teste ou evidência visual e limitações. Uma tabela de 'feito' sem evidência não é auditoria de equivalência.

Fases avançadas podem ser decompostas, mas não removidas silenciosamente. Caso o usuário escolha reduzir escopo, registrar a decisão e manter a lacuna visível.

## Fontes por família

- [Guia geral](https://docs.sdelements.com/master/guide/).
- [Projetos](https://docs.sdelements.com/master/guide/docs/projects/).
- [Survey](https://docs.sdelements.com/master/guide/docs/library/project_settings.html).
- [Atributos](https://docs.sdelements.com/release/latest/guide/docs/library/attributes_DE.html).
- [Regras](https://docs.sdelements.com/release/latest/guide/docs/library/rules_DE.html).
- [Explicabilidade](https://docs.sdelements.com/master/guide/docs/projects/project_countermeasures/explainable_mapping.html).
- [Contramedidas](https://docs.sdelements.com/master/guide/docs/library/countermeasures.html).
- [Controles por projeto](https://docs.sdelements.com/master/guide/docs/projects/project_countermeasures/).
- [Verificação](https://docs.sdelements.com/master/guide/docs/integrations/security_tools/overview/verification_status.html).
- [Políticas](https://docs.sdelements.com/master/guide/docs/risk_policies/).
- [Issue tracker](https://docs.sdelements.com/release/latest/guide/docs/integrations/issue_tracker_integration/understand.html).
- [Scan repository](https://docs.sdelements.com/master/guide/docs/scan_a_repository/).
- [Threat modeling](https://docs.sdelements.com/master/guide/docs/threat_modeling/).
- [Reusable components](https://docs.sdelements.com/master/guide/docs/reusable_components/).
- [Dashboards](https://docs.sdelements.com/master/guide/docs/reporting/dashboards.html).
- [Agentic workflow](https://docs.sdelements.com/release/latest/guide/docs/agentic_ai_workflow/).
- [Automations](https://docs.sdelements.com/master/guide/docs/automations/automations.html).
- [Autenticação](https://docs.sdelements.com/master/guide/docs/authentication/).

Referências apontam para documentação pública móvel, consultada em 18/09/2026; ainda falta confirmar edição/versão da demonstração vista pelo usuário e os detalhes de capacidades dependentes de licença/configuração.

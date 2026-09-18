# ForgeSBD — questionário amplo e biblioteca de boas práticas

Data: 18/09/2026. Plano de conteúdo da fase F2. Inventário inicial de 120 perguntas candidatas; não é formulário implementado, padrão aprovado nem lista exaustiva de todas as tecnologias.

## 1. Finalidade

Caracterizar o projeto para selecionar requisitos contextualizados, produzir orientações acionáveis e alimentar os cards Jira. Perguntas de contexto descrevem o que existe ou será construído. Perguntas de verificação avaliam se um controle foi atendido; pertencem à etapa de acompanhamento e não devem eliminar controles ainda não implementados.

Os IDs abaixo são estáveis. As perguntas q01–q24 da fundação continuam em survey-1. Na evolução, criar mapa de migração para os IDs semânticos; não renomear silenciosamente respostas/avaliações existentes.

## 2. Formatos e comportamento

- Sim/não/desconhecido para características booleanas.
- Seleção única/múltipla para plataformas e tecnologias, com opção outra e desconhecimento.
- Texto curto apenas quando a informação for indispensável à caracterização; não pedir segredo ou exemplo de dado real.
- Campos de inventário estruturado para componentes, armazenamentos e integrações.
- Perguntas condicionais com indicação de qual resposta as ativou.
- Respostas sugeridas por perfil, componente ou repositório têm origem e precisam ser revisadas.
- Desconhecimento preserva pendências; ausência significa rascunho incompleto.
- Respostas inativas não ativam requisitos; reativação exige confirmação.
- Questionário é salvável/retomável; extensão é medida pelas perguntas efetivamente ativas.
- 'Outro' não equivale a suporte completo: registrar tecnologia e apontar lacuna de orientação específica.

## 3. Inventário de perguntas candidatas

### Contexto e finalidade — todos os projetos

| ID | Pergunta de contexto |
|---|---|
| CTX-01 | Quais domínios compõem o projeto: web, API, mobile, backend, infra, cloud, CI/CD? |
| CTX-02 | É projeto novo, mudança de sistema existente ou nova release? |
| CTX-03 | Quais ambientes fazem parte desta avaliação? |
| CTX-04 | Quem usa o sistema: colaboradores, clientes, parceiros ou público anônimo? |
| CTX-05 | Há componentes expostos à internet? |
| CTX-06 | Quais funções de negócio precisam de proteção especial? |
| CTX-07 | Qual impacto esperado de indisponibilidade, fraude ou alteração indevida? |
| CTX-08 | Há prestação de serviço para mais de uma organização/tenant? |
| CTX-09 | Há normas contratuais ou políticas internas aplicáveis, identificadas por versão? |
| CTX-10 | Quais componentes/fluxos mudaram em relação à avaliação anterior? |

### Dados e privacidade — todos; aprofundar quando houver dados

| ID | Pergunta de contexto |
|---|---|
| DATA-01 | Quais categorias de dados são coletadas, processadas ou transmitidas? |
| DATA-02 | Há dados pessoais? |
| DATA-03 | Há dados sensíveis ou informações de alta confidencialidade? |
| DATA-04 | Há dados de pagamento ou financeiros? |
| DATA-05 | Onde os dados ficam armazenados: banco, arquivo, cache, objeto ou dispositivo? |
| DATA-06 | Os dados são compartilhados com terceiros? |
| DATA-07 | Há replicação, exportação ou processamento em regiões diferentes? |
| DATA-08 | Existem períodos de retenção e necessidade de exclusão definidos? |
| DATA-09 | Há uso de dados de produção fora de produção? |
| DATA-10 | Há exportação em massa, relatórios ou download de dados pelos usuários? |

### Identidade e autorização — ativada por usuários/serviços com acesso

| ID | Pergunta de contexto |
|---|---|
| IAM-01 | O sistema autentica usuários? |
| IAM-02 | A identidade vem de provedor corporativo, identidade própria ou terceiros? |
| IAM-03 | Quais protocolos/mecanismos de autenticação serão usados? |
| IAM-04 | Há funções administrativas ou acesso privilegiado? |
| IAM-05 | Existem diferentes papéis/perfis de acesso? |
| IAM-06 | Existem recursos pertencentes a usuários ou tenants específicos? |
| IAM-07 | Há recuperação de acesso, troca de credenciais ou vinculação de contas? |
| IAM-08 | O sistema usa contas de serviço ou identidades de máquina? |
| IAM-09 | Há operações de alto impacto que exigem confirmação adicional? |
| IAM-10 | Quais requisitos de duração/revogação de sessão ou credencial existem? |

### Arquitetura e integrações — todos, detalhamento por componente

| ID | Pergunta de contexto |
|---|---|
| ARCH-01 | Quais componentes/processos e armazenamentos compõem o sistema? |
| ARCH-02 | Quais fluxos cruzam fronteiras de confiança? |
| ARCH-03 | Existem integrações com sistemas externos? |
| ARCH-04 | Quais dados e credenciais cada integração utiliza? |
| ARCH-05 | O sistema faz requisições a URLs indicadas por usuários ou terceiros? |
| ARCH-06 | Há filas, eventos, tarefas assíncronas ou processamento em lote? |
| ARCH-07 | Há comunicação direta entre serviços internos? |
| ARCH-08 | Existem caches/CDNs ou componentes compartilhados entre tenants? |
| ARCH-09 | O projeto utiliza IA, modelos externos ou agentes com ferramentas? |
| ARCH-10 | Algum controle é fornecido por componente/plataforma compartilhada? |

### Desenvolvimento e dependências — software próprio

| ID | Pergunta de contexto |
|---|---|
| DEV-01 | Quais linguagens e versões serão utilizadas? |
| DEV-02 | Quais frameworks e versões serão utilizados? |
| DEV-03 | Há bibliotecas/pacotes de terceiros? |
| DEV-04 | Há componentes legados ou sem suporte? |
| DEV-05 | A aplicação consulta banco SQL/NoSQL usando entradas externas? |
| DEV-06 | A aplicação executa comandos do sistema ou processos externos? |
| DEV-07 | Processa objetos serializados, XML ou formatos complexos de terceiros? |
| DEV-08 | Recebe arquivos ou processa conteúdo/documentos externos? |
| DEV-09 | Realiza cálculos/transações sujeitos a concorrência ou repetição? |
| DEV-10 | Usa funções criptográficas, geração aleatória ou gestão própria de chaves? |

### Web e navegador — domínio web

| ID | Pergunta de contexto |
|---|---|
| WEB-01 | Renderiza conteúdo controlado por usuários/terceiros? |
| WEB-02 | Usa sessão/autenticação baseada em cookies? |
| WEB-03 | Mantém dados ou tokens em armazenamento do navegador? |
| WEB-04 | Consome recursos/scripts de origens externas? |
| WEB-05 | Permite chamadas entre origens diferentes? |
| WEB-06 | Executa operações autenticadas que alteram estado? |
| WEB-07 | Há redirecionamentos configuráveis por entrada externa? |
| WEB-08 | O sistema pode ser incorporado em frames ou precisa incorporar outros sites? |
| WEB-09 | Há service workers, modo offline ou cache de conteúdo autenticado? |
| WEB-10 | Usa WebSockets ou comunicação em tempo real com o browser? |

### API e serviços expostos — domínio API

| ID | Pergunta de contexto |
|---|---|
| API-01 | Quais estilos existem: REST, GraphQL, gRPC ou outro? |
| API-02 | A API é pública, de parceiros ou interna? |
| API-03 | Endpoints acessam recursos identificados por IDs recebidos? |
| API-04 | A entrada permite selecionar campos a criar/alterar? |
| API-05 | Há filtros, buscas, paginação ou consultas complexas controladas pelo cliente? |
| API-06 | Há operações em lote ou consumo elevado de recursos? |
| API-07 | Recebe ou envia webhooks? |
| API-08 | Existem operações cujo reenvio pode duplicar efeitos? |
| API-09 | Há versões antigas de API ainda acessíveis? |
| API-10 | A API consome respostas de parceiros e as usa em decisões/ações? |

### Mobile e dispositivo — domínio mobile

| ID | Pergunta de contexto |
|---|---|
| MOB-01 | Quais plataformas e versões mínimas são suportadas? |
| MOB-02 | O app é nativo, híbrido ou multiplataforma? |
| MOB-03 | Armazena dados sensíveis, credenciais ou tokens no dispositivo? |
| MOB-04 | Possui funcionamento offline ou cache local? |
| MOB-05 | Usa câmera, localização, contatos ou outras permissões do dispositivo? |
| MOB-06 | Usa deep links, intents ou comunicação entre aplicativos? |
| MOB-07 | Usa WebView ou carrega conteúdo remoto executável? |
| MOB-08 | Integra SDKs de analytics, publicidade ou terceiros? |
| MOB-09 | Inclui dados em notificações, clipboard, screenshots ou backups do dispositivo? |
| MOB-10 | Há requisito fundamentado de proteção contra adulteração do app/dispositivo? |

### Infraestrutura e rede — infra/cloud ou componentes hospedados

| ID | Pergunta de contexto |
|---|---|
| INF-01 | Usa servidores/VMs próprios, gerenciados ou ambiente on-premises? |
| INF-02 | Quais sistemas operacionais e versões são utilizados? |
| INF-03 | Quais serviços/portas recebem conexões e de quais redes? |
| INF-04 | Existem interfaces administrativas remotas? |
| INF-05 | Como os ambientes e zonas de confiança são separados? |
| INF-06 | Existem recursos compartilhados entre produção e outros ambientes? |
| INF-07 | Quem termina TLS e como certificados são gerenciados? |
| INF-08 | A configuração é mantida por infraestrutura como código? |
| INF-09 | Há proxies, balanceadores, WAF ou gateways? |
| INF-10 | Existem requisitos de alta disponibilidade e recuperação da infraestrutura? |

### Cloud, containers e orquestração — condicionais por tecnologia

| ID | Pergunta de contexto |
|---|---|
| CLD-01 | Quais provedores, contas/subscriptions/projetos e regiões serão usados? |
| CLD-02 | Usa armazenamento de objetos? |
| CLD-03 | Usa bancos/cache/filas gerenciados? |
| CLD-04 | Usa funções/serverless ou serviços com permissões próprias? |
| CLD-05 | Usa containers e registries? |
| CLD-06 | Usa Kubernetes ou outro orquestrador? |
| CLD-07 | Há workloads com privilégio elevado ou acesso ao host? |
| CLD-08 | Como workloads se autenticam nos serviços cloud? |
| CLD-09 | Usa KMS, cofre de segredos ou gestão própria de chaves? |
| CLD-10 | Há recursos intencionalmente públicos ou acessíveis entre contas? |

### Repositórios, build e CI/CD — domínio CI/CD ou build próprio

| ID | Pergunta de contexto |
|---|---|
| PIPE-01 | Onde fica o código e quem pode alterá-lo? |
| PIPE-02 | Qual plataforma executa o pipeline? |
| PIPE-03 | Usa runners hospedados, próprios ou compartilhados? |
| PIPE-04 | Código de PR externo/não confiável pode executar no pipeline? |
| PIPE-05 | Pipeline possui acesso a segredos, cloud ou produção? |
| PIPE-06 | Pipeline utiliza actions/plugins/imagens de terceiros? |
| PIPE-07 | Quais artefatos são gerados e onde ficam armazenados? |
| PIPE-08 | Há exigência de assinatura, SBOM ou proveniência dos artefatos? |
| PIPE-09 | Como promoção entre ambientes e rollback acontecem? |
| PIPE-10 | Quais verificações/aprovações precisam bloquear merge ou deploy? |

### Operação, monitoramento e recuperação — todo projeto em operação

| ID | Pergunta de contexto |
|---|---|
| OPS-01 | Quais eventos precisam ser registrados para investigação e auditoria? |
| OPS-02 | Há dados sensíveis que podem aparecer nos logs? |
| OPS-03 | Onde logs e métricas ficam e quem acessa? |
| OPS-04 | Quais sinais precisam gerar alertas de segurança? |
| OPS-05 | Quais dados/configurações entram em backup? |
| OPS-06 | Quais são os objetivos de tempo de recuperação e perda aceitável de dados? |
| OPS-07 | Quem trata incidentes e como pode conter acesso comprometido? |
| OPS-08 | Como serão recebidos, priorizados e corrigidos achados de vulnerabilidade? |
| OPS-09 | Qual processo mantém versões e configurações do sistema? |
| OPS-10 | Como dados, credenciais e recursos serão retirados no encerramento do sistema? |

## 4. Perguntas a aprofundar por tecnologia

Cada escolha de tecnologia pode abrir subcatálogo específico: Android/iOS; Node/React/Nest e demais linguagens; PostgreSQL/NoSQL; AWS/Azure/GCP; Kubernetes; GitHub Actions e outros pipelines. O inventário atual contém perguntas de entrada para esses ramos, não todos os detalhes de cada produto.

Descrever tecnologia/versionamento e contexto é suficiente para selecionar orientação; não transformar o questionário de entrada em auditoria interminável de todas as configurações já implementadas. Detalhes de configuração e evidência entram no card/controle selecionado quando forem critérios de verificação.

## 5. Modelo de cada pergunta

Campos: ID, versão, rótulo, seção, formato, opções estáveis, ajuda, exemplo, política de obrigatoriedade, regra de visibilidade, fatos produzidos, respostas implicadas, regras de incompatibilidade, fonte de fundamentação e estado editorial.

Resposta registra valor, estado conhecido/desconhecido, autor, data, origem manual/perfil/componente/repositório e confirmação. Uma pergunta precisa produzir um fato usado por controle, perfil, classificação ou contexto necessário; caso contrário, justificar sua presença ou removê-la.

Regra de visibilidade tem grafo acíclico. Implicações são separadas da visibilidade; respostas derivadas mostram causa e não sobrescrevem silenciosamente uma resposta manual incompatível.

## 6. Modelo das boas práticas

Cada controle terá:

| Campo | Conteúdo obrigatório |
|---|---|
| Identidade | ID estável, versão, estado editorial e histórico |
| Propósito | Problema/fraqueza que evita e ativo afetado |
| Aplicabilidade | Expressão de contexto; escopo por componente quando necessário |
| Requisito | Ação concreta que o responsável precisa executar |
| Orientação | Passos de implementação e limites da recomendação |
| How-tos | Exemplos por tecnologia/versão, com condição de seleção |
| Critérios de aceite | Condições observáveis para considerar implementado |
| Verificação | Método manual/automatizado, cobertura, limitações e resultado esperado |
| Evidências | Tipo de referência necessária; sem exigir segredo ou dado real no card |
| Fonte | Organização, documento, versão/edição, seção/ID e link consultado |
| Gestão | Fase do SDLC, prioridade fundamentada, responsável e revisão |
| Jira | Template de card e mapeamentos opcionais por projeto |

Requisito, how-to e complemento de norma são objetos distinguíveis. Um controle de autorização pode ter how-to Node.js e complemento de política interna sem duplicar a obrigação base.

## 7. Famílias candidatas de controles

| Família | Contextos que a acionam | Conteúdo a revisar |
|---|---|---|
| Autenticação | IAM-01/02/03/07 | Fluxos de identidade, recuperação, MFA quando fundamentada |
| Autorização | CTX-08, IAM-05/06, API-03 | Decisão de acesso por ação/recurso/tenant |
| Sessão | IAM-10, WEB-02/03 | Ciclo de sessão, cookies, revogação |
| Validação e injeção | DEV-05/06/07/08 | Validação e uso seguro de interpretadores/parsers |
| Browser | WEB-01/04/05/06/08 | Rendering, origens, headers e CSRF quando pertinente |
| API | API-04/05/06/07/08/09/10 | Campos permitidos, limites, idempotência e confiança em terceiros |
| Dados | DATA-01 a DATA-10 | Minimização, acesso, armazenamento, retenção e exportação |
| Criptografia | DEV-10, CLD-09, INF-07 | Uso e ciclo de vida de chaves/certificados |
| Segredos | IAM-08, CLD-08/09, PIPE-05 | Identidade de workload e gestão de credenciais |
| Dependências | DEV-03/04, WEB-04, PIPE-06 | Inventário, atualização e cadeia de fornecimento |
| Arquivos | DEV-08 | Recepção, processamento, armazenamento e distribuição |
| Integrações | ARCH-03/04/05/07, API-07/10 | Validação, autenticação de chamadas e limites de confiança |
| Mobile | MOB-03 a MOB-10 | Storage, plataforma, rede, privacidade e adulteração conforme risco |
| Hosts e rede | INF-01 a INF-09 | Superfícies expostas, administração, segmentação e hardening |
| Containers/Kubernetes | CLD-05/06/07 | Imagens, identidade, permissões e isolamento |
| Cloud | CLD-01/02/03/04/08/10 | IAM, exposição, configurações e controles do provedor |
| CI/CD | PIPE-01 a PIPE-10 | Alterações autorizadas, execução confiável e artefatos |
| Logs e incidentes | OPS-01 a OPS-04/07/08 | Eventos, acesso e capacidade de resposta |
| Resiliência | INF-10, OPS-05/06 | Backup/restauração, disponibilidade e recuperação |
| Arquitetura/abuso | ARCH-01/02/08/09 | Ameaças, fronteiras de confiança e fluxos de alto impacto |

Essas famílias ainda serão decompostas em controles. Não publicar uma regra baseada em uma lista de IDs de perguntas sem verificar a semântica de cada resposta e o escopo do componente.

## 8. Registro de fontes a usar

| ID | Fonte | Papel no catálogo | Decisão de versão |
|---|---|---|---|
| SRC-ASVS | OWASP ASVS | Requisitos técnicos para aplicações/serviços | Base candidata 5.0.0, confirmar release e IDs antes de importar |
| SRC-CS | OWASP Cheat Sheet Series | Orientações de implementação | Fixar commit/data consultada por orientação |
| SRC-MAS | OWASP MASVS, MASTG e MASWE | Requisitos/testes/fraquezas mobile | Fixar releases de cada artefato antes de importar; não reaproveitar levels de versões antigas |
| SRC-API | OWASP API Security | Taxonomia de riscos API | Classificação complementar; não substituir catálogo de requisitos por Top 10 |
| SRC-SSDF | NIST SP 800-218 | Práticas do ciclo de desenvolvimento | Documento final 1.1 consultado; avaliar revisões futuras separadamente |
| SRC-K8S | Kubernetes security checklists | Controles de workloads/cluster | Vincular à versão suportada do ambiente |
| SRC-AWS | AWS Well-Architected Security | Orientações de workloads AWS | Data/edição e páginas específicas por controle |
| SRC-AZ | Azure Well-Architected Security | Orientações de workloads Azure | Data/edição e páginas específicas por controle |
| SRC-GCP | Google Cloud Well-Architected Security | Orientações de workloads GCP | Data/edição e páginas específicas por controle |
| SRC-INTERNAL | Políticas próprias revisadas | Obrigações específicas da VOLL | Só publicar quando documento e responsável estiverem definidos |

Registro também deve conter condições de reutilização/atribuição da fonte. Não importar biblioteca comercial do SD Elements. Mapeamento normativo não é declaração de certificação ou de atendimento jurídico.

## 9. Rastreabilidade obrigatória

Tabela de trabalho da fase F2: `questionId → resposta/fato → regra → controlId/version → sourceId/section/version → howTo → teste de aplicabilidade → template Jira`.

Exemplo proposto: API-03 + IAM-06 descrevem recursos por usuário/tenant; esses fatos selecionam controle de autorização por recurso. A fonte de orientação pode ser a OWASP Authorization Cheat Sheet. O controle exige decisão de acesso no servidor e seu teste deve incluir tentativa por usuário sem direito ao recurso. Ainda falta a revisão técnica e o mapeamento da seção/ID da versão escolhida do ASVS; não inventar esse ID.

## 10. Produção do conteúdo em lotes

1. Inventariar fontes e fixar versões/atribuição.
2. Mapear domínios e cenários da empresa, sem limitar o escopo total a uma única stack.
3. Decompor famílias em controles atômicos com critérios de aceite e verificação.
4. Elaborar regras; justificar perguntas necessárias à seleção.
5. Redigir how-tos específicos das tecnologias priorizadas.
6. Revisar casos positivos, negativos, desconhecidos e contextos combinados.
7. Publicar versão de catálogo/questionário com changelog e mapa de migração.
8. Verificar a prévia dos cards Jira com conteúdo real revisado.

Enquanto houver um operador, registrar que autor e revisor foram a mesma pessoa; não inventar revisão independente.

## 11. Testes e cobertura editorial

- Todas as opções e fatos possuem identificadores únicos e conhecidos pelas regras.
- Dependências e implicações não têm ciclo nem conflito silencioso.
- Cada controle tem cenário aplicável, não aplicável e, quando pertinente, desconhecido.
- Perfil combinado mobile+API+cloud+pipeline mantém controles comuns uma vez e controles distintos por componente quando necessário.
- Uma resposta negativa sobre existência de tecnologia não equivale a tecnologia configurada corretamente.
- 'Controle já fornecido por plataforma' exige herança e evidência; não remove obrigação por mera seleção.
- Cada fonte mapeada tem versão e seção; nenhum link solto é tratado como demonstração de cobertura completa.
- Alterar versão mostra diferenças antes de promover avaliação; não perde evidências/cards.
- Revisão do catálogo avalia recomendações obsoletas e código de exemplo inseguro.

Métricas editoriais: perguntas justificadas/total; controles com fonte/total; controles com teste de regra/total; controles com orientação/teste/total; cobertura por domínio e fonte. Publicar lacunas explicitamente. Não usar 120 como promessa de completude.

## 12. Referências oficiais

- [OWASP ASVS](https://owasp.org/projects/asvs).
- [Índice ASVS de Cheat Sheets](https://cheatsheetseries.owasp.org/IndexASVS.html).
- [OWASP MASVS](https://mas.owasp.org/MASVS/).
- [Índice MASVS de Cheat Sheets](https://cheatsheetseries.owasp.org/IndexMASVS.html).
- [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- [NIST SSDF 1.1](https://csrc.nist.gov/pubs/sp/800/218/final).
- [Kubernetes Security Checklist](https://kubernetes.io/docs/concepts/security/security-checklist/).
- [AWS Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html).
- [Azure Security](https://learn.microsoft.com/en-us/azure/well-architected/security/).
- [Google Cloud Security](https://docs.cloud.google.com/architecture/framework/security).

Consultadas em 18/09/2026. Este plano prepara conteúdo próprio e rastreável; ainda não executa a importação, revisão integral ou publicação dos padrões.

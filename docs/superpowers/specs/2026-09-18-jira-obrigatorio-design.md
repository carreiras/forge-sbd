# ForgeSBD — integração Jira obrigatória

Data: 18/09/2026. Escopo de produto aprovado: geração de cards é indispensável. Este documento é desenho de integração, não conector implementado nem autorização para enviar cards reais.

## 1. Comportamento esperado

Após preencher e revisar o questionário, o operador publica a avaliação. Se o destino Jira estiver configurado e a automação habilitada, o ForgeSBD enfileira os cards correspondentes aos requisitos aplicáveis e mostra o progresso. Publicação e envio têm estados diferentes: avaliação publicada não significa sincronização concluída.

Salvar rascunho, responder pergunta e gerar prévia não enviam cards. Prévia existe para conferir conteúdo, destino e quantidade. O operador pode configurar criação automática uma vez para o projeto, sem uma confirmação por card. A ativação real exige destino e conta de integração autorizados.

Jira não configurado: avaliação pode ser preparada, mas interface indica 'Integração obrigatória ainda não configurada'. O produto não é considerado pronto para o piloto somente porque gerou requisitos internos.

## 2. Referência do SD Elements

A documentação descreve exportação de todas ou parte das contramedidas para itens de trabalho, sincronização manual/agendada e mapeamento de estados. A configuração por projeto define o destino e o conjunto a sincronizar. Não presumir que salvar qualquer questionário na referência sempre cria cards imediatamente.

No ForgeSBD, o evento de publicação e o modo automático atendem à necessidade expressa do usuário. A sincronização posterior deverá atualizar vínculos/estados de acordo com uma política explícita.

Fontes: [visão da integração](https://docs.sdelements.com/release/latest/guide/docs/integrations/issue_tracker_integration/understand.html) e [conexão por projeto](https://docs.sdelements.com/release/latest/guide/docs/integrations/issue_tracker_integration/project_connection.html).

## 3. Edição e configuração ainda não conhecidas

O usuário respondeu em 18/09/2026 que ainda não sabe se usa Cloud ou Data Center. Essa decisão permanece aberta e não impede o desenho do fluxo, da fila e dos templates.

Antes de implementar o adapter: confirmar edição/versão, URL, projeto, tipos de issue, campos obrigatórios, workflow, parent/épico e autenticação disponível. Não enviar credenciais na conversa nem gravar tokens no Git.

Cloud usa REST v3 e ADF para campos multilinha pertinentes. Data Center exige adapter compatível com a versão instalada e seus recursos de metadados. Não misturar endpoints, formato da descrição e mecanismos de autenticação.

## 4. Fluxo operacional

1. Configurar connector: edição, endereço permitido, referência segura da credencial e saúde da conexão.
2. Configurar destino por projeto ForgeSBD: projeto Jira, issueType, mapeamentos, labels e política de criação.
3. Testar acesso e ler metadados necessários: tipos, campos obrigatórios, prioridades e transições disponíveis.
4. Preencher/revisar questionário e produzir prévia de avaliação/cards.
5. Publicar avaliação com versão do conteúdo, contexto e configuração do destino.
6. Na mesma transação local, criar evento de publicação e itens de outbox de sincronização.
7. Worker resolve cards existentes, cria/atualiza itens e registra vínculo/resultado.
8. Mostrar cards criados, atualizados, aguardando retry, falhos ou com resultado desconhecido.
9. Abrir links Jira a partir do controle e vice-versa, quando a URL ForgeSBD for acessível pelo destinatário.
10. Em avaliações posteriores, comparar mudanças e atualizar o ciclo vigente, sem duplicação indevida.

No notebook, link localhost é apenas referência local e não funciona para a equipe. Template identifica essa limitação e mantém IDs/contexto mínimo suficiente; URL compartilhada será configurada na migração.

## 5. Unidade de card

Padrão: um card por controle aplicável, por componente/escopo e ciclo de trabalho. Um controle geral do projeto gera um card; um controle distinto por componente pode gerar vários, claramente identificados. How-tos e complementos entram no mesmo card quando apenas detalham a mesma obrigação.

Não criar um card por pergunta, uma única tarefa genérica para todos os controles ou cards duplicados por norma. Consolidar obrigações equivalentes com referências de suas fontes. Critérios independentes podem ser desmembrados por política explícita.

Informação desconhecida gera pendência interna. Opcionalmente, criar uma tarefa identificada de esclarecimento; ela nunca é apresentada como controle atendido. Falso não gera tarefa de implementação.

## 6. Template mínimo

```text
Título: [SBD][controle][componente] Ação concreta

Objetivo e problema evitado
Por que este requisito se aplica: fatos e condição resumida
Requisito: ação que precisa ser executada
Boas práticas e passos de implementação
Orientação específica da tecnologia, quando disponível
Critérios de aceite
Método de verificação e evidência esperada
Fontes e versões do conteúdo
Aplicação, projeto, componente, avaliação e ciclo
Link para o requisito no ForgeSBD, quando acessível
Marcador de correlação e versão de sincronização
```

Exemplo de título proposto: `[SBD][AUTHZ-RESOURCE][API de pedidos] Validar acesso ao recurso no servidor`. Não usar esse identificador como mapeamento confirmado de norma: é ID próprio ilustrativo.

Campos Jira: projeto, issueType, summary e description; priority, labels, assignee, components, due date, parent e campos customizados só quando suportados/configurados. Não assumir que todo Jira tem um tipo Security Task ou um campo Epic Link com o mesmo ID.

Conteúdo contextual não inclui respostas completas sensíveis do questionário por padrão. Enviar apenas fatos necessários à justificativa e referências de evidência; não anexar segredo ou dados pessoais reais.

## 7. Modelo de persistência

- JiraConnector: edição, baseURL autorizada, referência da credencial, estado e configuração de timeouts.
- JiraProjectConnection: projeto local, destino, metadados/mapeamentos, modo automático, versão da configuração.
- WorkItemIdentity: projeto, ciclo, controlId estável e componentScope estável.
- JiraIssueLink: connector, identidade, issueId/key/URL, versão de conteúdo enviada e hash dos campos gerenciados.
- RequirementIssueReference: associa cada requisito histórico ao vínculo de trabalho correspondente.
- SyncRun: avaliação, configuração, iniciador, totais e estado.
- SyncItem/Outbox: identidade, ação, payloadHash, correlationId, tentativas, próximo agendamento e resultado.
- SyncAuditEvent: tentativas/resultados sem tokens e sem corpos confidenciais completos.

Avaliação histórica conserva o snapshot. Vínculo de trabalho representa o ciclo em execução. Uma nova avaliação não redefine o que foi historicamente pedido, mesmo quando atualiza o card do ciclo vigente.

## 8. Idempotência e duplicação

Identidade de card: `(connectorId, destinationProject, forgeProjectId, cycleId, controlId, componentScope)`. Versão de controle/avaliação não faz parte da identidade: normalmente modifica o card existente dentro do mesmo ciclo.

Outbox possui unicidade por identidade+operação+payloadHash. Worker tem lease e estados persistidos; a unicidade local sozinha não oferece criação exatamente uma vez no Jira.

Cada criação envia marcador de correlação identificável na descrição e, se suportado, propriedade/campo específico. É preciso demonstrar como localizar esse marcador na edição escolhida. Propriedade Jira não deve ser presumida pesquisável via JQL sem configuração de indexação.

Timeout após POST é ambíguo: Jira pode ter criado o card sem a resposta chegar. Não reenviar cegamente. Marcar resultado desconhecido, tentar reconciliação e, se não houver identificação confiável, solicitar reconciliação ao operador. Não prometer ausência absoluta de duplicação em falhas de rede sem esse mecanismo.

Desconectar/reconectar mantém registro de vínculos salvo política explícita de migração. Issue 404 pode significar falta de visibilidade; não recriar automaticamente antes de esclarecer exclusão/permissões.

## 9. Reavaliação e atualização

| Mudança | Comportamento padrão |
|---|---|
| Mesmo contexto/conteúdo/destino | Sem criação/atualização desnecessária |
| Novo controle aplicável | Criar card no ciclo vigente |
| Orientação alterada | Preparar atualização dos campos gerenciados com diff |
| Critério alterado após execução/verificação | Marcar necessidade de revisão; não herdar aprovação cegamente |
| Controle deixa de ser aplicável | Propor ação e registrar motivo; não excluir card nem apagar história |
| Novo ciclo/release | Reaproveitar ou criar trabalho conforme política de ciclo, mantendo origem |
| Card editado manualmente | Detectar conflito antes de sobrescrever conteúdo |
| Card excluído ou inacessível | Mostrar divergência e reconciliar com o operador |

Campos controlados pelo ForgeSBD são definidos por mapping. Descrição pode usar seção delimitada para conteúdo gerenciado; se a edição não permitir atualização confiável da seção, revisar conflito antes de escrever. Comentários repetidos não servem como substituto de idempotência.

Padrão inicial não altera assignee, prazo ou notas humanas sem mapping explícito. Não fecha automaticamente card de controle removido por simples troca de resposta; a ação fica rastreável e configurável.

## 10. Estados de execução e verificação

Mapping configurado por projeto: estados Jira podem corresponder a pendente, em andamento ou implementado. Reabrir card pode reabrir execução. Done não atribui resultado de verificação automaticamente.

Verificação tem método/evidência própria. Um requisito implementado por Jira continua não verificado até avaliação de evidência. Exceção ou não aplicabilidade exige motivo e decisão próprios; não inferir pela resolução 'Won't do'.

Polling manual/agendado entra antes de webhooks se for mais simples no ambiente. Posteriormente, webhooks precisam da autenticação/validação de origem/evento suportada pela edição escolhida, deduplicação e tolerância a ordem diferente. Não presumir assinatura nativa idêntica em todas as instalações.

## 11. Falhas e observabilidade

- 400 por campos inválidos: item requer correção de configuração; mostrar campo sem expor segredo.
- 401/403: pausar conector e pedir correção de credencial/permissão; não repetir indefinidamente.
- 429: respeitar Retry-After quando recebido e usar backoff com jitter.
- Erros transitórios: tentativas limitadas e estado persistido; POST ambíguo segue reconciliação.
- Falha parcial: conservar cards concluídos e retomar apenas itens restantes; não recriar todo o lote.
- Worker parado: outbox permanece no banco e retoma após reinício.
- Fila por projeto/ciclo evita versões antigas sobrescreverem uma atualização mais recente.
- Mostrar contadores por run, último sucesso, motivo de falha, tentativa e ação possível.

## 12. Segurança/configuração

Secrets ficam no backend em referência de ambiente/cofre ou armazenamento cifrado com chave externa, conforme implantação escolhida. Frontend nunca recebe token de integração. Conta de integração com permissões necessárias no destino, sem presumir admin global.

BaseURL permitida é configurada explicitamente. Não buscar URL arbitrária fornecida por respostas do questionário; controlar redirects e destinos. Data Center pode requerer host privado autorizado, VPN, proxy e CA corporativa; não desabilitar validação TLS.

Log/auditoria registra responsável pela habilitação e envio, destino, IDs, hashes e resultado. Conteúdo do Jira é visível conforme permissões do projeto; definir o mínimo necessário no template.

## 13. Marcos de implementação

| Marco | Resultado |
|---|---|
| J1 — adapter/metadados | Edição definida, conexão testável, campos/tipos descobertos |
| J2 — prévia/template | Conteúdo dos requisitos convertido em cards com ADF/formato adequado |
| J3 — publicação/outbox | Evento durável, worker e criação com vínculo |
| J4 — recuperação | Retry, resultado ambíguo, duplicação e falhas parciais testados |
| J5 — atualização/status | Mapping de campos/estados, conflitos e evolução de requisitos |
| J6 — piloto | Fluxo browser → backend → Jira real de teste validado |

F3 requer J1–J4 e J6 de criação. J5 evolui na F4. Teste mock demonstra lógica, mas não substitui J6. Antes de implementar cada marco, escrever o plano técnico para a edição/configuração confirmadas.

## 14. Critérios de aceite

1. Avaliação publicada dispara criação automática quando configurada.
2. Cada card contém orientação, critérios, origem/versionamento e motivo contextual.
3. Repetição não gera novo card para a mesma identidade e payload.
4. Timeout ambíguo não provoca reenvio cego.
5. Falha em um card não descarta sucesso dos demais; retomada funciona após reinício.
6. Campos obrigatórios/tipos variáveis são validados antes de enviar.
7. Alteração do contexto mostra diff e preserva vínculo/história.
8. Edição manual não é sobrescrita silenciosamente.
9. Done sincroniza execução conforme mapping, mas não aprova verificação.
10. Credenciais e respostas confidenciais não aparecem no frontend/logs/cards.
11. Teste real autorizado da edição selecionada confirma conteúdo e links.
12. Produto indica claramente integração indisponível/não configurada e não esconde a pendência.

## 15. Referências oficiais

- [Jira Cloud REST v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro).
- [Jira Cloud issues e metadados](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/).
- [Jira Cloud rate limiting](https://developer.atlassian.com/cloud/jira/platform/rate-limiting/).
- [Jira Data Center: exemplos REST e metadados por versão](https://developer.atlassian.com/server/jira/platform/jira-rest-api-examples/).

Consultadas em 18/09/2026. Não usar endpoints legados de createmeta sem conferir a edição/versão. Esta integração usa 'ForgeSBD' como nome do produto próprio; não requer que a aplicação seja um app da plataforma Atlassian Forge.

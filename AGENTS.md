# Instruções de desenvolvimento do ForgeSBD

Estas instruções se aplicam a todo o repositório. Manter aqui convenções duradouras; progresso, evidências e pendências pertencem ao status do projeto.

## Continuidade e fontes de referência

- Antes de implementar, conferir `git status` e ler [PROJECT_STATUS](docs/PROJECT_STATUS.md), o [roadmap mestre](docs/roadmap/2026-09-18-forge-sbd-roadmap-master.md) e a especificação/plano da entrega ativa indicados nesses documentos.
- Seguir o escopo aprovado, tarefa por tarefa. Não repetir etapas já concluídas nem apresentar itens planejados como implementados.
- Consultar [DEVELOPMENT](docs/DEVELOPMENT.md) para ambiente e operação; manter comandos detalhados nesse guia, sem duplicar seu conteúdo aqui.
- Registrar mudanças de decisão e sua motivação nos documentos correspondentes. Não transformar uma suposição em requisito confirmado.

## Arquitetura e invariantes

- Monólito modular REST em NestJS, PostgreSQL com Prisma e pacotes compartilhados em npm workspaces. O frontend previsto é React; conferir o status antes de assumir que uma funcionalidade existe.
- `apps/api`: transporte HTTP, serviços e persistência. `packages/contracts`: contratos compartilhados. `packages/rules`: motor declarativo. `content`: questionário e catálogo versionados.
- API e frontend rodam localmente. Docker é usado somente para PostgreSQL. Preservar bind local e porta configurada; não provisionar serviços remotos por iniciativa própria.
- Desconhecimento não equivale a resposta negativa. O motor não executa código do catálogo. Preservar versões, explicações e histórico das avaliações conforme a especificação.
- Catálogo demonstrativo não é conteúdo corporativo aprovado. Jira validado é obrigatório antes do piloto útil; F1 isoladamente não satisfaz esse gate.

## Convenções de implementação

- TypeScript estrito; API e pacotes compartilhados ESM com imports locais `.js`. Seguir os padrões dos arquivos existentes e manter mudanças focadas na tarefa.
- Usar as linhas de versões aprovadas, dependências exatas e `package-lock.json`. Não trocar de gerenciador nem atualizar versões principais sem decisão de escopo.
- Manter regras de negócio fora dos controllers e separar a montagem testável em `createApp` do listen em `main`. Na injeção Nest, considerar a limitação de metadata do tsx descrita em DEVELOPMENT.
- Interface e mensagens ao usuário em português do Brasil. Preservar o contrato de erros `{code,message,requestId}` sem expor detalhes internos ou credenciais.
- Versionar migrations; não editar migrations já aplicadas para introduzir mudanças de schema. Não usar reset ou remoção de volumes como procedimento de atualização.
- Não versionar `.env`, senhas, tokens, cookies reais ou client Prisma gerado. Exemplos e testes usam dados fictícios; auditoria não registra segredos ou corpos arbitrários de requisição.

## REST Client do VS Code — obrigatório

O usuário testa a API pela extensão REST Client. Toda entrega que cria, altera ou remove endpoints deve atualizar `restclient/*.http` na mesma tarefa.

- Organizar por funcionalidade, com `@baseUrl` local configurável e requisições separadas por `###`.
- Incluir método, caminho, headers, corpo quando aplicável e comentários com status/resposta esperados. Cobrir sucesso e erros relevantes, incluindo autenticação, CSRF e conflitos quando implementados.
- Documentar a ordem de execução e como fornecer/reutilizar cookies, tokens CSRF e IDs quando o fluxo depender deles. Não versionar valores reais.
- Manter apenas exemplos de endpoints implementados, com dados fictícios; identificar requisições que criam ou alteram dados.
- Atualizar [restclient/README](restclient/README.md) e DEVELOPMENT se o procedimento mudar. Verificar as requisições na API local e registrar o que foi executado, sem confundir verificação HTTP com uso efetivo da interface da extensão.
- Os exemplos manuais complementam, não substituem, os testes automatizados. A rota não está concluída sem seus exemplos atualizados.

## Verificação e critérios de conclusão

Comandos executados na raiz; preparar ambiente e migrations conforme DEVELOPMENT:

- `npm test`: suíte de regras e integração real com PostgreSQL.
- `npm run typecheck` e `npm run build`: tipos e compilação dos workspaces.
- `npm audit`: verificar dependências quando elas ou o lockfile mudarem.
- `git diff --check`: conferir problemas de whitespace antes de entregar.

Para mudanças de comportamento, escrever testes que capturem a falha e executar a suíte, typecheck e build antes de declarar conclusão. Mudanças apenas documentais exigem revisão dos textos, links e comandos; não precisam de testes de aplicação sem motivo adicional.

Testes de integração usam somente banco local dedicado terminado em `_test`, distinto do principal, com validação antes de qualquer limpeza. Nunca apontar testes para dados a preservar. Banco indisponível é uma limitação a resolver ou registrar, não razão para ignorar testes e declarar sucesso.

Uma tarefa está concluída quando atende ao escopo e critérios de aceite, tem verificações pertinentes executadas, exemplos REST Client atualizados quando aplicável e documentação coerente. Relatar falhas e limitações explicitamente. Atualizar PROJECT_STATUS com evidências reais e próximo passo; não reutilizar resultados antigos como se tivessem sido executados novamente.

## Git e entrega

- Conferir branch, diff e alterações existentes antes de editar. Preservar trabalho do usuário; não sobrescrever nem reverter arquivos fora do escopo.
- Respeitar a preferência vigente de checkout/worktree. Não trocar branch com alterações pendentes sem avaliar seu impacto; não implementar diretamente na main sem autorização.
- Fazer commits locais quando previstos pelo plano ou solicitados, incluindo somente arquivos da tarefa. Não incluir segredos, artefatos gerados ou arquivos temporários.
- Push, merge, publicação e implantação dependem de autorização do usuário. Não executar reset destrutivo, clean abrangente ou force push por iniciativa própria.
- Ao entregar, resumir o que mudou, verificações e limitações; informar branch/commit quando pertinente. Manter o progresso em PROJECT_STATUS, sem duplicá-lo neste arquivo.

# Execução da tarefa 4

Plano: docs/superpowers/plans/2026-09-18-forge-sbd-entrega-1-plan.md
Base: 6051647, main com PR #2 integrado. Branch feat/admin-auth, checkout original solicitado.

## Escopo e interfaces

- Implementar somente tarefa 4: senha, bootstrap do administrador, sessão, CSRF, limitação de tentativas e exemplos REST Client.
- Tarefa 3 fornece DatabaseService e schema de usuários/sessões. Sem mudança de schema prevista.
- Tarefas 5/6 consumirão request.user e guards globais; novas rotas devem exigir sessão e mutações devem exigir Origin/CSRF por padrão.
- Bootstrap será um comando local interativo; não criar administrador real automaticamente. Testes usam credenciais fictícias apenas em banco _test.
- API/frontend locais; Docker somente PostgreSQL. Jira continua obrigatório antes do piloto.
- Aprovação anterior de push foi específica da branch da tarefa 3. Esta tarefa termina em commit local; não fazer push/merge automaticamente.

## Verificações

- Baseline: npm test passou, 42 testes.
- RED inicial: hash ausente e seedTestAdmin ainda ausente. Próximo: criar suporte e confirmar falha por rotas ausentes.

- RED HTTP confirmado após seed: cinco testes falharam por 404 nas rotas ausentes. Hash: três testes passaram.
- Guards globais registrados no módulo Auth; DatabaseModule global fornece o mesmo client ao módulo de autenticação e aos módulos futuros.
- Bootstrap isolado em comando, sem inicialização automática de usuário. Lock transacional serializa criação por emails distintos.
- Limiter inclui tentativas em andamento para não ultrapassar cinco por concorrência; capacidade cheia recusa novas chaves sem expulsar bloqueios ativos.
- Typecheck detectou destructuring de resultado opcional no seed; corrigido com acesso validado à primeira linha.
- npm test: 60 testes passaram (24 API/configuração e 36 motor); typecheck e build passaram.
- Bootstrap testado em TTY real com credenciais fictícias, senha sem eco, confirmação, criação e segunda execução recusada. Banco _test limpo após o teste.
- Os 12 blocos REST Client foram lidos dos arquivos e executados contra processos reais dist/main.js e tsx src/main.ts: 24 requisições com resultados esperados. A interface gráfica do VS Code não foi automatizada.

## Revisão independente e correções

Revisor não encontrou defeito confirmado no núcleo de autenticação. Encontrou dois problemas nos exemplos REST Client: versão instalada 0.25.1 não oculta @prompt password; interpolação direta de senha no JSON quebra aspas/barras.

Correção: comando restclient:credentials reutiliza leitura de senha sem eco do terminal e serializa credenciais em login.local.json, ignorado pelo Git e criado exclusivamente (sem sobrescrever). O login HTTP lê esse arquivo. Teste de serialização falhou por módulo ausente e passou após implementação; smoke agora usa senha fictícia com aspas/barras. Custo: um arquivo local em claro durante os testes, com remoção orientada na documentação. Nenhuma credencial real foi criada ou versionada.

Escopos que o revisor não julgou: CRUD e Jira permanecem fora da tarefa 4; infraestrutura futura será tratada nas respectivas fases; documentação atualizada foi revisada pelo executor.

## Resultado final

- Correção da revisão validada: teste de serialização RED→GREEN, suíte completa 61/61, typecheck e build passaram.
- Comando restclient:credentials executado em TTY real: senha com aspas/barra não apareceu e foi serializada sem alteração. Arquivo local removido pelo ensaio.
- Os 12 blocos HTTP passaram novamente nos processos compilado e tsx (24 requisições), agora com senha contendo aspas/barra. Git confirmou que login.local.json é ignorado; arquivo temporário ausente ao encerrar.
- Não houve alteração de dependências, schema ou migrations; auditoria de dependências não foi repetida nesta tarefa.
- Sem achados pendentes da revisão. A extensão gráfica não foi automatizada; os arquivos foram executados por um leitor de requisições no ensaio local.

Task 4: complete. Próximo passo: tarefa 5. Commit local previsto: feat: add admin sessions and csrf protection. Sem push/merge nesta tarefa.

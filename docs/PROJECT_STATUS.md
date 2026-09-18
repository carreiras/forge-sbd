# ForgeSBD — estado do projeto

Atualizado em 18/09/2026.

## Objetivo permanente

Solução própria com equivalência funcional ao SD Elements, para estabelecer Security by Design. Questionário amplo e contextual, biblioteca real de boas práticas e geração de cards Jira são centrais. Jira é obrigatório para o primeiro piloto útil; não é opcional nem removido do escopo.

## Situação

- Desenho geral aprovado pelo usuário.
- Primeira entrega técnica especificada e planejada; sem código implementado.
- Revisão de escopo autorizada pelo usuário: roadmap completo, continuidade de questionário/conteúdo e Jira obrigatório.
- Matriz de 42 capacidades da referência registrada; nenhuma validada no produto.
- Inventário de 120 perguntas candidatas para expansão, com modelo editorial e fontes.
- Desenho Jira registrado; edição desconhecida, conforme resposta do usuário.
- Repo local: C:\projetos\apps\forge-sbd.
- Remoto observado: https://github.com/carreiras/forge-sbd.git.
- Documentação nova/atualizada ainda não equivale a funcionalidades, catálogo revisado ou tickets criados.

## Ordem de leitura

1. docs/roadmap/2026-09-18-forge-sbd-roadmap-master.md
2. docs/roadmap/2026-09-18-forge-sbd-equivalencia.md
3. docs/content/2026-09-18-questionario-e-boas-praticas.md
4. docs/superpowers/specs/2026-09-18-jira-obrigatorio-design.md
5. Especificação e plano da entrega ativa em docs/superpowers.

## Próximo trabalho

Revisar o desenho ampliado com o usuário e iniciar a fundação técnica F1 quando houver instrução de execução. F1 usa 24 perguntas/10 controles demo; esse incremento não encerra a solução pedida. Planejar F2 por lotes de fontes/domínios e F3 Jira antes do piloto.

Usar Superpowers para cada fase: desenho, plano, execução/testes e revisão. Não criar todos os planos técnicos futuros com premissas inventadas; manter requisitos e critérios de saída no roadmap, detalhando a fase ao iniciá-la.

## Pendências concretas

- Identificar npm na sessão e atualizar Node24 para patch vigente antes de instalar dependências.
- PostgreSQL local/Docker e banco de teste ainda não validados.
- Jira Cloud/Data Center, versão, URL, destino, workflow e credencial autorizada ainda desconhecidos.
- Prioridade de tecnologias reais da VOLL e políticas internas ainda não informadas.
- Seleção de execução inline/subagentes ainda não respondida; não delegar sem escolha aplicável.

## Verificações desta revisão

Documentos foram preparados a partir do planejamento local e documentação pública oficial. Verificação executada: oito pares de documentos com SHA256 idêntico, 120 IDs únicos de perguntas, 42 IDs únicos de capacidades e git diff --check sem erros. Adendos atualizam a prioridade Jira nos documentos anteriores. Não houve instalação, execução de testes da aplicação, conexão Jira, criação de cards, push ou implantação.

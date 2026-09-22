# Testes manuais com REST Client

1. Na raiz, execute `docker compose up -d postgres` e prepare migrations conforme `docs/DEVELOPMENT.md`.
2. Para autenticação, execute uma única vez `npm run admin:bootstrap -w @forge-sbd/api` no terminal. Escolha suas credenciais; não há senha padrão.
3. Execute `npm run restclient:credentials -w @forge-sbd/api` para gerar o arquivo local de login com senha oculta no terminal; depois inicie `npm run dev:api`.
4. No VS Code com REST Client, abra o arquivo `.http` e clique em **Send Request** acima do bloco.
5. Compare status/corpo/headers com os comentários. São verificações manuais, não assertions automáticas da extensão.

`@baseUrl` é configurável em cada arquivo; ajuste a porta conforme API_PORT. Use o mesmo hostname durante o fluxo para que os cookies sejam enviados corretamente.

- `health.http`: saúde pública, HTTP 200 e `{"status":"ok"}`. Não comprova persistência por si só.
- `errors.http`: rota inexistente (404) e JSON malformado (400). Erros têm `{code,message,requestId}`, com requestId igual ao header X-Request-Id; X-Content-Type-Options deve ser nosniff.
- `auth.http`: executar os blocos 1–6 em ordem (login, sessão, recusas por CSRF/origem, logout e sessão revogada). Login cria sessão e logout a revoga; as tentativas recusadas não encerram a sessão. Blocos 7–9 verificam credenciais fictícias inválidas, Origin ausente e campo extra.

## Cookies e credenciais

Manter `rest-client.rememberCookiesForSubsequentRequests` habilitado (padrão da extensão). O login recebe os cookies e os próximos blocos os reutilizam automaticamente. O token do header X-CSRF-Token vem de `{{login.response.body.$.csrfToken}}`, portanto executar o login deste mesmo arquivo antes dos blocos que o referenciam. Após logout, refazer o login antes de repetir o fluxo autenticado.

O login lê `restclient/login.local.json`, gerado pelo comando acima com serialização JSON correta, inclusive para senhas com aspas e barras. A senha é pedida sem eco no terminal. O arquivo contém a senha em claro para envio local e é ignorado pelo Git; remova-o após os testes. Para trocar credenciais, remova o arquivo e execute o comando novamente (ele não sobrescreve um arquivo existente). Não compartilhar esse arquivo ou respostas/cookies de sessão.

A versão instalada do REST Client (0.25.1) não oculta os prompts de senha da extensão; por isso o fluxo não usa `@prompt password`. A interface gráfica da extensão não foi automatizada; foram verificados o terminal e as requisições extraídas dos arquivos.

`@origin` deve ser exatamente WEB_ORIGIN (padrão http://localhost:5173). Os cookies Secure de NODE_ENV=production requerem HTTPS; usar o ambiente de desenvolvimento para estes exemplos HTTP locais.

O bloco de credenciais inválidas usa email fictício. Cinco falhas desse IP+email em quinze minutos fazem a próxima tentativa retornar 429; aguarde a janela para repetir. Não é necessário provocar bloqueio da sua conta real para testar a autenticação. Expiração e limites temporais têm testes automatizados com relógio controlado.

Saúde/erros não alteram dados; os exemplos de autenticação criam/revogam sessões. Cadastro de aplicações e avaliações serão adicionados quando implementados. Os arquivos `.http` complementam `npm test`, que valida persistência e demais contratos no banco dedicado.

Ao alterar endpoints, atualizar esta pasta na mesma entrega, conforme `AGENTS.md`. Referência da sintaxe de prompts, cookies e encadeamento: [REST Client](https://github.com/Huachao/vscode-restclient#usage).

# Testes manuais com REST Client

1. Na raiz do projeto, execute `docker compose up -d postgres` e `npm run dev:api`.
2. No VS Code com a extensão REST Client, abra `health.http` ou `errors.http`.
3. Clique em **Send Request** acima da requisição desejada.
4. Compare a resposta com o status e o corpo esperados no comentário de cada cenário.

`@baseUrl` está definido em cada arquivo; ajuste a porta se mudar `API_PORT`. Os exemplos usam somente o ambiente local e dados fictícios.

- `health.http`: saúde pública, HTTP 200 e `{"status":"ok"}`.
- `errors.http`: rota inexistente (404) e JSON malformado (400). Ambos retornam `{code,message,requestId}`. O header `X-Request-Id` deve corresponder ao campo do corpo; `X-Content-Type-Options` deve ser `nosniff`.

Esses exemplos não alteram dados. Login, portfólio e avaliações serão adicionados quando suas rotas forem implementadas. Saúde confirma que a API responde; os testes de persistência e o cenário de corpo maior que 128 KB estão na suíte automatizada (`npm test`).

Os comentários de resultado esperado são instruções para conferência manual, não assertions executadas automaticamente pela extensão. Os arquivos `.http` complementam os testes automatizados.

Ao adicionar ou alterar uma rota, atualizar os arquivos desta pasta na mesma entrega, conforme `AGENTS.md` e `docs/DEVELOPMENT.md`. Não versionar credenciais, cookies ou tokens reais; quando autenticação existir, documentar como fornecer esses valores localmente.

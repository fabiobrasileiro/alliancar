# Investigação: "Erro ao carregar contatos" / "Erro ao buscar clientes do Asaas"

## 1. Resumo do problema

Na tela **Contatos** (`/contatos`) aparece:
- **"Erro ao carregar contatos"**
- **"Erro ao buscar clientes do Asaas"**

No console podem aparecer também mensagens do tipo `Failed to load resource: net::ERR_`.

---

## 2. Fluxo atual da página Contatos

1. **Perfil (Supabase)**  
   - `useEffect` busca o afiliado em `afiliados` por `auth_id`.  
   - Fonte: Supabase ✅ (tabela `afiliados` existe no schema).

2. **Clientes (Asaas)**  
   - Após ter `perfilData.id`, a página chama em paralelo:
     - `GET /api/customers?externalReference=${perfilData.id}`
     - `GET /api/payments?externalReference=${perfilData.id}`
     - `GET /api/asaas-data?afiliadoId=${perfilData.id}&tipo=subscriptions`
   - Se `!customersResponse.ok`, o front lança **"Erro ao buscar clientes do Asaas"** e não usa o corpo da resposta para detalhar o erro.

3. **Origem dos dados de “contatos”**  
   - A tela **não** usa tabela Supabase `contatos` (essa tabela **não existe** no schema).  
   - Os “contatos” vêm da **API Asaas** via `/api/customers`, que chama:
     - `GET ${ASAAS_BASE_URL}/customers?externalReference=${externalReference}`  
   - Ou seja: **contatos = clientes do Asaas** cujo `externalReference` é o ID do afiliado.

---

## 3. Conformidade com o banco (Supabase)

Com base em `supabase_export_completo_estruturado.json` e `tabelas.md`:

| Recurso              | No schema Supabase | Uso na tela Contatos | Conformidade |
|----------------------|--------------------|----------------------|--------------|
| Tabela `contatos`    | Não existe         | Não usada            | N/A          |
| Tabela `afiliados`   | Existe             | Perfil (auth_id)     | ✅           |
| Tabela `customers`   | Existe (estrutura não inferida) | Hoje não usada; pode servir de fallback | ✅ (fallback possível) |
| Clientes/contatos    | —                  | Via API Asaas        | Decisão de produto: fonte = Asaas |

Conclusão: a tela está **conforme** com o desenho atual (perfil no Supabase, clientes no Asaas). Não há “desconformidade” com tabelas inexistentes ou erradas; o problema é **falha ao chamar a API Asaas** (ou à rota `/api/customers`).

---

## 4. Causas prováveis do erro

### 4.1 API Key / URL do Asaas

- **`ASAAS_API_KEY`**  
  - Se ausente ou inválida, `/api/customers` pode retornar 500 com mensagem de “API key não encontrada”, ou a chamada ao Asaas retorna **401**.

- **`ASAAS_BASE_URL`**  
  - Padrão no código: `"https://api.asaas.com/v3"` (produção).  
  - Sandbox: `"https://api-sandbox.asaas.com/v3"`.  
  - Chave de sandbox com URL de produção (ou o contrário) costuma gerar **401**.

### 4.2 Erro na API Asaas

- Resposta **4xx/5xx** do Asaas (ex.: 401, 403, 429, 500) faz `/api/customers` responder com `!ok` e o front mostrar apenas “Erro ao buscar clientes do Asaas”, sem mostrar `error` / `details` retornados pela API.

### 4.3 Rede / ambiente

- `net::ERR_*` no console pode ser:
  - Falha ao carregar a própria rota `/api/customers` (servidor não sobe, proxy, etc.).
  - Ou outro recurso (ex.: analytics/ingest).  
  O importante é: se a **resposta** de `/api/customers` vem com status ≥ 400, o front trata como “erro ao buscar clientes do Asaas”.

---

## 5. Boas práticas (web + código)

- **Backend como proxy**  
  Chamadas ao Asaas devem ser feitas apenas no servidor (ex.: `/api/customers`), nunca do browser, para evitar CORS e expor a chave. O projeto já segue isso.

- **Autenticação Asaas v3**  
  Documentação Asaas indica header `access_token` com a API key. O código já usa esse header.

- **Resiliência**  
  Quando a API externa falha, usar fallback para dados locais (ex.: Supabase `customers`) reduz “erro ao carregar contatos” e melhora a experiência.

- **Mensagens de erro**  
  Mostrar `error` e, se existir, `details` retornados pela API ajuda a diferenciar “chave/URL errada” de “problema na rede/Asaas”.

---

## 6. Ações recomendadas

1. **Na página Contatos**  
   - Ao receber `!customersResponse.ok`, ler o corpo da resposta (ex.: `customersResponse.json()`) e usar `error` e `details` na mensagem exibida, em vez de só “Erro ao buscar clientes do Asaas”.

2. **Em `/api/customers`**  
   - Se a chamada ao Asaas falhar (ou não houver `ASAAS_API_KEY`), tentar **fallback** na tabela Supabase `customers` filtrando por `afiliado_id = externalReference` e mapeando os campos para o formato esperado pelo front (ex.: camelCase, mesmos nomes que a interface `AsaasCustomer`).

3. **Ambiente**  
   - Garantir em `.env` (ou Vercel):
     - `ASAAS_API_KEY` com a chave correta (sandbox ou produção).
     - `ASAAS_BASE_URL` consistente com a chave (sandbox ↔ `api-sandbox.asaas.com/v3`).

4. **Opcional**  
   - Refatorar a tela para Server Component + dados iniciais (como em conta/perfil), carregando contatos no servidor e passando para um Client; isso reduz loading inicial e centraliza tratamento de env/Asaas no servidor.

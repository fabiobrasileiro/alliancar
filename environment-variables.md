# Variáveis de Ambiente Necessárias

Para fazer o deploy no Vercel, você precisa configurar as seguintes variáveis de ambiente:

## Obrigatórias

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_anonima_aqui
```

### Obtendo as credenciais do Supabase:
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** > **API**
3. Copie a **URL** e **anon key**

## Opcionais

```
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app
NODE_ENV=production
```

## Como configurar no Vercel

1. No dashboard do Vercel, acesse seu projeto
2. Vá em **Settings** > **Environment Variables**
3. Adicione cada variável listada acima
4. Certifique-se de que estão disponíveis para **Production**, **Preview** e **Development**
5. Redeploy o projeto após adicionar as variáveis

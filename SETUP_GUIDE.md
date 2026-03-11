# Rô Naturalis — Guia de Configuração do Supabase

## Passo 1: Criar a Conta e o Projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **"New Project"**.
3. Preencha:
   - **Name:** `ro-naturalis`
   - **Database Password:** crie uma senha forte (ou deixe o Supabase gerar)
   - **Region:** São Paulo (South America / sa-east-1) para menor latência
4. Clique em **"Create new project"** e aguarde ~2 minutos.

## Passo 2: Obter as Chaves de API

1. No painel do projeto, vá em **Settings → API** (menu lateral esquerdo).
2. Copie os dois valores:
   - **Project URL** → cole no `.env` como `VITE_SUPABASE_URL`
   - **anon public key** (em "Project API keys") → cole como `VITE_SUPABASE_ANON_KEY`

## Passo 3: Criar as Tabelas

1. No painel, vá em **SQL Editor** (ícone de banco de dados).
2. Clique em **"New Query"**.
3. Abra o arquivo `supabase/schema.sql` deste projeto, copie **todo** o conteúdo.
4. Cole no editor SQL do Supabase e clique em **"RUN"**.
5. Confirme que aparece "Success. No rows returned" — isso significa que as tabelas foram criadas.

## Passo 4: Criar o Bucket de Fotos e Políticas (RLS)

1. No painel, vá em **Storage** (ícone de pasta).
2. Clique em **"New Bucket"**.
3. Nome: **`product-images`**
4. **Marque a opção "Public bucket"** (necessário para exibir as fotos).
5. Clique em **"Save"**.
6. **Importante:** Se você rodou o `schema.sql` (Passo 3) *antes* de criar este bucket, as políticas de segurança não foram aplicadas ao bucket. Para corrigir, copie as linhas do final do arquivo `schema.sql` (seção "Políticas de acesso ao Storage") e rode novamente no **SQL Editor** para liberar o upload de imagens.

## Passo 5: Criar seu Primeiro Usuário

1. No painel, vá em **Authentication → Users**.
2. Clique em **"Add User" → "Create new user"**.
3. Informe um e-mail e senha (este será seu login no sistema).
4. Marque **"Auto Confirm User"** para pular a verificação de e-mail.
5. Clique em **"Create User"**.

## Passo 6: Testar

1. No terminal, dentro da pasta do projeto, execute: `npm run dev`
2. Acesse `http://localhost:5173`
3. Faça login com o e-mail e senha criados no Passo 5.
4. Pronto! Você deve ver o Dashboard e pode começar a cadastrar produtos.

## Resumo do .env

Depois dos passos acima, seu arquivo `.env` deve ficar assim:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=cole_depois_na_fase_2
```

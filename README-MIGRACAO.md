# GiroLoc — Firebase + Netlify

O app agora usa **Firebase** (login + banco Firestore) e roda na **Netlify**.
As duas ações que precisam de servidor (criar loja e trocar senha de loja) viraram *Netlify Functions*
em `netlify/functions/` — não precisa do plano pago do Firebase.

## 1) Firebase (console.firebase.google.com)

1. **Criar projeto** (pode desativar o Google Analytics).
2. **Authentication → Sign-in method →** ative **E-mail/senha**.
3. **Firestore Database → Criar banco de dados** (modo produção; região `southamerica-east1`, São Paulo).
4. **Firestore → Regras:** apague tudo, cole o conteúdo de `firestore.rules` e clique em **Publicar**.
5. **Configurações do projeto (engrenagem) → Seus apps → Web (`</>`)**: registre um app e copie
   `apiKey`, `authDomain`, `projectId` e `appId`.
6. **Configurações do projeto → Contas de serviço → Gerar nova chave privada.** Baixa um `.json`.
   Dele você vai usar `project_id`, `client_email` e `private_key`. **Nunca suba esse arquivo no GitHub.**

### Criar o primeiro usuário admin
1. **Authentication → Usuários → Adicionar usuário** (e-mail + senha). Copie o **UID** dele.
2. **Firestore → Iniciar coleção** `profiles` → **ID do documento = o UID** copiado → campos:

| Campo        | Tipo    | Valor                          |
|--------------|---------|--------------------------------|
| `email`      | string  | o e-mail do admin              |
| `role`       | string  | `admin`                        |
| `store_name` | null    |                                |
| `active`     | boolean | `true`                         |
| `created_at` | string  | `2026-10-27T00:00:00.000Z`     |

As lojas depois são criadas pela própria tela do admin (botão **Nova Loja**).

## 2) Netlify

1. **Add new site → Import from Git** (o projeto precisa estar num repositório; arrastar a pasta `dist` **não** publica as funções).
2. As configurações de build já vêm do `netlify.toml`.
3. **Site configuration → Environment variables**, crie:

| Variável                    | Valor                                         |
|-----------------------------|-----------------------------------------------|
| `VITE_FIREBASE_API_KEY`     | `apiKey` do passo 5                           |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain`                                  |
| `VITE_FIREBASE_PROJECT_ID`  | `projectId`                                   |
| `VITE_FIREBASE_APP_ID`      | `appId`                                       |
| `FIREBASE_PROJECT_ID`       | `project_id` do JSON                          |
| `FIREBASE_CLIENT_EMAIL`     | `client_email` do JSON                        |
| `FIREBASE_PRIVATE_KEY`      | `private_key` do JSON (cole inteira, com os `\n`) |

4. **Deploys → Trigger deploy → Clear cache and deploy site.** (Variáveis `VITE_` só entram no site em um novo deploy.)

## Rodar no seu computador
```
npm install
cp .env.example .env     # preencha as 4 variáveis VITE_FIREBASE_*
npm run dev              # app (criar loja/trocar senha NÃO funcionam aqui)
```
Para testar também as funções: `npm i -g netlify-cli` e depois `netlify dev` (precisa das 3 variáveis `FIREBASE_*` no ambiente).

## Se der erro
- **Login: "Não foi possível entrar (auth/...)"** → o código entre parênteses diz o motivo
  (`auth/invalid-api-key` = variável `VITE_FIREBASE_API_KEY` errada/ausente; `auth/operation-not-allowed` = E-mail/senha não ativado).
- **"Perfil não encontrado"** → o usuário existe no Authentication, mas falta o documento em `profiles/<UID>`.
- **"Missing or insufficient permissions" no console do navegador** → regras do Firestore não publicadas (passo 4).
- **Criar loja dá erro** → confira as 3 variáveis `FIREBASE_*` na Netlify e veja **Logs → Functions**.

## Observações
- Os dados que estavam no Supabase **não foram copiados**: o Firestore começa vazio.
- Removi do projeto a pasta `supabase/` e o `.env` antigo. Uma das migrations antigas tinha o e-mail e a
  **senha do admin escritas em texto**; se essa senha é usada em outro lugar, troque.

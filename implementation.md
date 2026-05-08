# Phase 3 Task 1 Security Implementation

## 1. Project Context

Equitask is a full stack university group work app for managing team projects, tasks, story point voting, scrum boards, comments, notifications, and analytics. The project is built with Next.js App Router, TypeScript, Tailwind CSS, Next.js API routes, Supabase, and Vercel.

The website now uses Supabase mode for normal access. Earlier demo-login entry points have been
removed, so users enter the app through real Supabase Auth accounts. Seeded data and the old provider
abstraction still exist in the codebase for development history, but the public demo login flow is no
longer exposed.

For Phase 3 Task 1, the security implementation focuses on Supabase mode because that is where real
users, real authentication, and persistent data exist.

The four assessment requirements we implemented are:

1. Secure password storage.
2. Server authentication on login.
3. Secure password transmission.
4. Secure message transmission using end to end encryption.

In Equitask, task comments are treated as the app's messages because there is no separate chat feature. That means comments are the feature used for the end to end encryption requirement.

## 2. Security Requirements Covered

| Marking Criterion | What We Implemented | Main Evidence Files |
|---|---|---|
| Secure Password Storage | The app uses Supabase Auth for email and password accounts. Passwords are never stored in public app tables, localStorage, sessionStorage, comments, logs, or custom user records. Password validation was added before Supabase Auth is called. | `src/services/authService.ts`, `src/app/api/auth/sign-in/route.ts`, `src/app/api/auth/sign-up/route.ts`, `src/lib/security/password.ts` |
| Server Authentication on Login | Login and sign up are blocked on insecure production origins. The app relies on browser TLS certificate verification and Vercel HTTPS certificates for deployed login security. Security headers were added. | `src/lib/security/secureOrigin.ts`, `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/sign-up/page.tsx`, `next.config.mjs` |
| Secure Password Transmission | Passwords are sent through POST request bodies to same-origin API routes. Passwords are not placed in URLs, logged, or stored in browser storage. HTTPS is required in production, while localhost remains allowed for development. | `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/sign-up/page.tsx`, `src/app/api/auth/sign-in/route.ts`, `src/app/api/auth/sign-up/route.ts`, `src/lib/auth/session.ts` |
| End to End Encrypted Message Transmission | Supabase comments are encrypted in the browser with AES-GCM before being sent to the server. Supabase stores ciphertext, IV, and encryption metadata only. The browser decrypts messages for display. | `src/lib/e2ee.ts`, `src/components/shared/TaskDetailClient.tsx`, `src/components/board/BoardTaskModal.tsx`, `src/app/api/tasks/[taskId]/comments/route.ts`, `src/data/providers/supabaseProvider.ts`, `supabase_phase3_security.sql` |

## 3. Files Added and Edited

### Files Added

| File | What It Does | Why It Was Added |
|---|---|---|
| `src/lib/security/password.ts` | Defines shared password validation. It rejects empty passwords and passwords shorter than 8 characters. | Keeps password requirements consistent across the frontend, API routes, and auth service. |
| `src/lib/security/secureOrigin.ts` | Checks whether the current browser origin is safe for credential submission. It allows HTTPS, localhost, and 127.0.0.1. It blocks insecure non-localhost HTTP pages. | Prevents the app from sending login credentials from an insecure production page. |
| `src/lib/e2ee.ts` | Implements browser-side AES-GCM encryption and decryption for comments using the Web Crypto API. | Provides real client-side encryption before comments are sent to Supabase. |
| `supabase_phase3_security.sql` | Adds encrypted comment columns to Supabase without deleting old records. | Gives the database a place to store ciphertext, IVs, encryption metadata, and legacy plaintext comments safely. |
| `implementation.md` | This documentation file. | Gives teammates a clear explanation, test checklist, and video recording guide. |

### Files Edited

| File | What Changed | Why It Matters |
|---|---|---|
| `src/services/authService.ts` | Sign in and sign up now validate passwords before calling Supabase Auth. Sign in errors are generic. | Prevents weak or empty passwords and avoids leaking whether the email or password was wrong. |
| `src/app/api/auth/sign-in/route.ts` | Reads email and password from the POST body, validates the password, calls Supabase Auth, hydrates the user's team, then sets the session cookie. | Keeps login server-side and avoids storing passwords in app tables. |
| `src/app/api/auth/sign-up/route.ts` | Reads sign-up details from the POST body, validates the password, requires a team name, calls Supabase Auth, joins the team, then sets the session cookie. | Creates accounts through Supabase Auth and keeps team setup connected to the authenticated user. |
| `src/app/(auth)/sign-in/page.tsx` | Added secure origin checking before the form sends credentials. | Prevents credential submission if the app is accidentally opened through insecure HTTP in production. |
| `src/app/(auth)/sign-up/page.tsx` | Added secure origin checking and password validation before sign-up submission. | Stops weak passwords and insecure origin submissions before the API route is called. |
| `src/lib/auth/session.ts` | Confirms app sessions use an `httpOnly` cookie, `sameSite=lax`, and `secure` in production. | Keeps app session data out of normal JavaScript access and uses secure cookies in production. |
| `next.config.mjs` | Added security headers for every route. | Improves browser security with HSTS in production, nosniff, frame protection, referrer policy, and disabled unnecessary browser permissions. |
| `src/app/api/tasks/[taskId]/comments/route.ts` | Supabase mode now requires an encrypted comment payload. | Prevents new Supabase comments from being saved as readable plaintext. |
| `src/components/shared/TaskDetailClient.tsx` | Encrypts comments in the browser before posting and decrypts loaded comments in the browser for display. | Gives users a normal comment UI while storing ciphertext in Supabase. |
| `src/components/board/BoardTaskModal.tsx` | Added the same automatic encrypted comment flow inside the scrum board task window. | Allows comments from the board modal while preserving encrypted storage. |
| `src/data/providers/supabaseProvider.ts` | Maps encrypted comment columns from Supabase, inserts new comments with `body: null`, and stores ciphertext plus metadata. | Ensures Supabase receives ciphertext only for new comments. |
| `src/data/providers/demoProvider.ts` | Updated the legacy seeded provider to stay compatible with the shared service layer. | Prevents old development fallback code from breaking TypeScript. |
| `src/data/providers/providerTypes.ts` | Added encrypted comment input types. | Allows API routes and providers to pass encryption metadata cleanly. |
| `src/types/index.ts` | Added comment encryption fields such as `ciphertext`, `iv`, `encryptionVersion`, `encryptionAlgorithm`, and `keyId`. | Lets the UI and data layer know whether a comment is encrypted or legacy plaintext. |

## 4. Task 1: Secure Password Storage

### What The Requirement Means

The requirement asks us to avoid plaintext password storage and avoid weak password hashing. In a custom authentication system, this would mean implementing a strong password hashing algorithm with a salt, such as bcrypt or Argon2id.

However, Equitask already uses Supabase Auth. Because of that, the correct secure approach is not to create our own password table or our own hashing system. Creating a second authentication system would be worse because it could introduce mistakes and duplicate sensitive storage.

### What We Implemented

Equitask uses Supabase Auth for real email and password sign up and sign in. The app calls:

- `client.auth.signUp(...)` for account creation.
- `client.auth.signInWithPassword(...)` for login.

These calls happen inside `src/services/authService.ts`. The public app tables such as `profiles`, `teams`, `team_members`, `tasks`, `task_votes`, `comments`, and `notifications` do not store passwords.

We also added password validation before Supabase Auth is called:

- Empty passwords are rejected.
- Passwords shorter than 8 characters are rejected.
- Sign-in errors are generic, such as `Invalid email or password.`
- Password values are not logged.
- Password values are not returned from API routes.
- Password hashes are not stored in React state, localStorage, or sessionStorage.

### Why Supabase Auth Counts As Secure Password Storage

Supabase Auth stores credentials in Supabase's protected `auth` schema, not in our public application tables. The relevant Supabase Auth column is named `auth.users.encrypted_password`.

The name `encrypted_password` can be confusing. Passwords are not supposed to be reversibly encrypted. They are supposed to be hashed. Supabase Auth stores salted bcrypt password hashes. That means the password cannot simply be decrypted back into the original password.

### Why Bcrypt Is Appropriate

Bcrypt is appropriate for password storage because:

- It is designed specifically for passwords.
- It uses a salt for each password, which protects against simple rainbow table attacks.
- It is deliberately slower than normal hashes, which makes brute force attacks harder.
- It is much safer than MD5, SHA1, or unsalted SHA256 for password storage.

MD5, SHA1, and raw SHA256 are weak choices for passwords because they are very fast. Fast hashing is good for file checksums, but bad for password storage because attackers can test millions or billions of guesses quickly.

### Files To Show In The Video

Show these files:

- `src/services/authService.ts`
- `src/lib/security/password.ts`
- `src/app/api/auth/sign-in/route.ts`
- `src/app/api/auth/sign-up/route.ts`

### What To Say In The Video

A teammate can say:

> For secure password storage, we did not build our own password database. The app uses Supabase Auth, which stores salted bcrypt password hashes in the protected auth schema. Our public tables do not contain passwords. We added validation to reject empty or short passwords before calling Supabase Auth, and login errors are generic so the app does not reveal whether the email or password was wrong.

### Evidence To Show

1. Sign up with a password of at least 8 characters.
2. Open Supabase Table Editor and show `public.profiles` has user information but no password column.
3. Explain that password hashes live in Supabase Auth under the protected `auth.users.encrypted_password` field.
4. Show `authService.ts` calling `client.auth.signUp` and `client.auth.signInWithPassword`.
5. Show `password.ts` enforcing the minimum password rules.

## 5. Task 2: Server Authentication On Login

### What The Requirement Means

The requirement says the client must verify the server's certificate before transmitting credentials. In a browser-based web app, this happens through HTTPS and TLS.

When a user visits the deployed Vercel site over HTTPS, the browser checks the server certificate before JavaScript sends the login request. If the certificate is invalid, the browser blocks or warns before credentials are transmitted.

### What We Implemented

We added a secure origin guard in `src/lib/security/secureOrigin.ts`. This guard is used by both the sign-in and sign-up pages before credentials are sent.

The guard allows:

- `https:` for production.
- `localhost` for local development.
- `127.0.0.1` for local development.

The guard blocks insecure non-localhost pages and shows this message:

```text
Secure HTTPS connection required before sending credentials.
```

This means the app will not submit credentials from an insecure production HTTP origin.

We also added security headers in `next.config.mjs`:

- `Strict-Transport-Security` in production.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `X-Frame-Options: SAMEORIGIN`.
- `Permissions-Policy` disabling camera, microphone, geolocation, payment, and USB.

### Why We Did Not Use A Hardcoded CA Public Key

We did not hardcode a CA public key. For a normal browser app hosted on Vercel, the correct model is browser trust store verification plus Vercel-managed HTTPS certificates.

Hardcoded CA keys can create problems:

- Certificate rotation becomes harder.
- Expired or changed certificates can break login.
- If a pinned key is compromised, fixing it is difficult.
- Incorrect pinning can lock out real users even when the site is safe.

### How The Server Certificate Is Generated

For the deployed app, Vercel manages the HTTPS certificate. Vercel obtains a certificate for the deployment domain from a trusted Certificate Authority. The browser already trusts major public Certificate Authorities through its built-in trust store.

During login:

1. The browser connects to the Vercel HTTPS URL.
2. Vercel presents its certificate.
3. The browser verifies that the certificate matches the domain and chains back to a trusted CA.
4. Only after that TLS verification does the browser send the login POST request.

Vercel supports modern TLS for deployed apps, including TLS 1.2 and TLS 1.3.

### Files To Show In The Video

Show these files:

- `src/lib/security/secureOrigin.ts`
- `src/app/(auth)/sign-in/page.tsx`
- `src/app/(auth)/sign-up/page.tsx`
- `next.config.mjs`

### What To Say In The Video

A teammate can say:

> For server authentication on login, this is a browser app deployed on Vercel, so certificate verification happens through HTTPS before credentials are sent. We added a secure origin guard that blocks login and sign up on insecure non-localhost HTTP origins. We did not hardcode CA keys because browser certificate validation with Vercel-managed certificates is the correct model for this type of app.

### Evidence To Show

1. Show the deployed Vercel URL starts with `https://`.
2. Show `secureOrigin.ts` allowing HTTPS and local development only.
3. Show sign-in or sign-up page code calling the secure origin guard before fetch.
4. Show `next.config.mjs` security headers.
5. Explain why no hardcoded CA key is used.

## 6. Task 3: Secure Password Transmission

### What The Requirement Means

The requirement says passwords must be sent through a secure channel such as TLS 1.2 or higher. Plaintext password transmission is prohibited.

For this app, that means:

- Use HTTPS in production.
- Do not put passwords in URLs.
- Do not log passwords.
- Do not store passwords in browser storage.
- Send passwords through POST request bodies, not query strings.

### What We Implemented

The sign-in and sign-up forms send credentials to same-origin API routes:

- `POST /api/auth/sign-in`
- `POST /api/auth/sign-up`

The password is sent in the request body. It is not sent as a query string, so it does not appear in the URL.

The API routes read the password from `await request.json()`. They validate it and then call Supabase Auth. They do not store it in any public table.

The app session is stored using the session helper in `src/lib/auth/session.ts`. The cookie options are:

- `httpOnly: true`
- `sameSite: "lax"`
- `secure: true` in production
- `path: "/"`

This is not the same as storing a password. The cookie stores the app session, not the raw password.

### Localhost Exception

Local development uses `http://localhost:3000`, which is allowed because local development does not use a public network origin. The secure origin guard only allows HTTP for:

- `localhost`
- `127.0.0.1`

Production must use HTTPS.

### Files To Show In The Video

Show these files:

- `src/app/(auth)/sign-in/page.tsx`
- `src/app/(auth)/sign-up/page.tsx`
- `src/app/api/auth/sign-in/route.ts`
- `src/app/api/auth/sign-up/route.ts`
- `src/lib/auth/session.ts`

### What To Say In The Video

A teammate can say:

> For secure password transmission, passwords are submitted using POST requests to our same-origin Next.js API routes. They are not placed in URLs, not logged, and not saved in localStorage or sessionStorage. In production the app runs on Vercel HTTPS, so the browser sends the password only after TLS certificate verification. Local HTTP is allowed only for localhost development.

### Evidence To Show

1. Open the deployed Vercel app and show the URL uses HTTPS.
2. Open browser DevTools Network tab.
3. Sign in.
4. Show the request goes to `/api/auth/sign-in` using POST.
5. Show the password is not in the URL.
6. Show the code uses `fetch("/api/auth/sign-in", { method: "POST" })` or the equivalent sign-in form logic.
7. Show `session.ts` cookie options.

## 7. Task 4: Secure Message Transmission With End To End Encryption

### What The Requirement Means

The requirement says messages must be encrypted end to end. In Equitask, comments are the communication messages, so new Supabase comments must not be stored as readable plaintext.

For this to count as real end to end encryption in our project:

- The browser must encrypt the message before sending it.
- The server must receive ciphertext, not plaintext.
- Supabase must store ciphertext and encryption metadata, not readable comment text.
- The browser must decrypt the message for display.
- The server/database must not store the raw encryption key.

### What We Implemented

We added `src/lib/e2ee.ts`, which uses the browser Web Crypto API.

Encryption details:

- Algorithm: AES-GCM.
- Key size: 256-bit AES key.
- IV size: 96-bit IV.
- IV source: `crypto.getRandomValues`, not `Math.random`.
- IV behavior: a fresh IV is generated for every comment.
- Ciphertext format: base64 encoded ciphertext and base64 encoded IV.
- Metadata: `e2ee-v1`, `AES-GCM-256`, and a non-secret `keyId`.

The comment UI remains simple. Users do not see encryption settings. They just type a comment and click `Post Comment`. The browser automatically encrypts the comment before sending it.

This automatic encryption flow exists in two places:

- `src/components/shared/TaskDetailClient.tsx`
- `src/components/board/BoardTaskModal.tsx`

Both components call `encryptCommentForTeam(task.teamId, trimmedComment)` before posting a Supabase comment.

### What The API Route Enforces

The API route `src/app/api/tasks/[taskId]/comments/route.ts` checks the request body.

In Supabase mode:

- It requires `encryptedComment`.
- It rejects missing or invalid encrypted payloads.
- It does not accept new plaintext comments.

The old seeded provider path can still handle plaintext development records internally, but the
website no longer exposes demo login. Normal Supabase users must submit encrypted comment payloads.

### What Supabase Stores

The provider `src/data/providers/supabaseProvider.ts` writes new Supabase comments like this:

- `body: null`
- `ciphertext: encryptedComment.ciphertext`
- `iv: encryptedComment.iv`
- `encryption_version: encryptedComment.encryptionVersion`
- `encryption_algorithm: encryptedComment.encryptionAlgorithm`
- `key_id: encryptedComment.keyId`

This means the `public.comments.body` column is not used for new Supabase comments. Old comments can still exist in `body` and are shown as legacy unencrypted comments.

### Key Management Limitation

This is a working educational E2EE prototype, not a full production key-management system.

The AES team key is generated in the browser and stored only on the client device in localStorage. The raw key is not stored in Supabase and is not sent to the server. Because of that, the server cannot decrypt new encrypted comments.

The limitation is that production-grade multi-device and multi-user key sharing would need a better design, such as:

- A public/private key pair per user.
- Public keys stored in Supabase.
- Private keys stored only on the user's device.
- The team AES key encrypted separately for each team member.
- Only encrypted team keys stored in Supabase.

For this assignment, the important security evidence is that new comments are encrypted in the browser and Supabase stores ciphertext only.

### Files To Show In The Video

Show these files:

- `src/lib/e2ee.ts`
- `src/components/board/BoardTaskModal.tsx`
- `src/components/shared/TaskDetailClient.tsx`
- `src/app/api/tasks/[taskId]/comments/route.ts`
- `src/data/providers/supabaseProvider.ts`
- `src/types/index.ts`
- `supabase_phase3_security.sql`

### What To Say In The Video

A teammate can say:

> For secure message transmission, Equitask treats task comments as messages. When a user posts a comment in Supabase mode, the browser encrypts it with AES-GCM before the API request is sent. The API route requires an encrypted payload, and Supabase stores ciphertext, IV, and metadata. The plaintext body is null for new encrypted comments. The browser decrypts the message for display, so users still see normal comments, but the database does not store readable comment text.

### Evidence To Show

1. Open a task on the scrum board.
2. Type a comment normally.
3. Click `Post Comment`.
4. Show the comment appears readable in the UI.
5. Open Supabase `public.comments`.
6. Show the new row has `ciphertext` and `iv` values.
7. Show `body` is null for the new encrypted comment.
8. Refresh the app and show the comment still appears readable after browser decryption.

## 8. Supabase Migration

Run this SQL in the Supabase SQL Editor. It is also saved in `supabase_phase3_security.sql`.

```sql
-- Equitask Phase 3 Task 1 security migration
-- Adds encrypted comment storage while preserving existing legacy plaintext rows.

alter table public.comments
add column if not exists ciphertext text,
add column if not exists iv text,
add column if not exists encryption_version text,
add column if not exists encryption_algorithm text,
add column if not exists key_id text;

alter table public.comments
alter column body drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'comments_encryption_state_check'
      and conrelid = 'public.comments'::regclass
  ) then
    alter table public.comments
    add constraint comments_encryption_state_check
    check (
      (
        ciphertext is null
        and iv is null
        and encryption_version is null
        and encryption_algorithm is null
      )
      or
      (
        ciphertext is not null
        and iv is not null
        and encryption_version = 'e2ee-v1'
        and encryption_algorithm = 'AES-GCM-256'
      )
    );
  end if;
end $$;

comment on column public.comments.body is
'Legacy plaintext comment body. New Supabase comments should leave this null and use ciphertext instead.';

comment on column public.comments.ciphertext is
'AES-GCM encrypted comment text produced in the browser before storage.';

comment on column public.comments.iv is
'Base64 encoded 96-bit AES-GCM initialization vector generated with crypto.getRandomValues.';

comment on column public.comments.encryption_version is
'Client-side encryption format version, currently e2ee-v1.';

comment on column public.comments.encryption_algorithm is
'Encryption algorithm identifier, currently AES-GCM-256.';

comment on column public.comments.key_id is
'Non-secret client key identifier used to match encrypted comments with the local team key.';
```

Column meanings:

- `ciphertext`: encrypted comment content.
- `iv`: unique AES-GCM initialization vector for the comment.
- `encryption_version`: format version, currently `e2ee-v1`.
- `encryption_algorithm`: algorithm label, currently `AES-GCM-256`.
- `key_id`: non-secret key identifier.
- `body`: legacy plaintext field, now nullable for new encrypted comments.

The migration is additive. It does not drop existing comments and does not require a storage bucket.

## 9. Testing Checklist

Use this checklist before recording the video.

1. Run `npm install` if dependencies are missing.
2. Run `npm run dev`.
3. Configure Supabase environment variables.
4. Test Supabase sign up with an 8 character or longer password.
5. Test Supabase sign in.
6. Inspect `public.profiles` and confirm there is no password column.
7. Explain that password hashes live in Supabase Auth under the protected `auth.users.encrypted_password` column.
8. Open the deployed Vercel app and confirm the URL uses HTTPS.
9. Open DevTools Network tab and sign in.
10. Confirm the login request is POST and the password is not in the URL.
11. Open a task on the scrum board.
12. Post a new comment.
13. Inspect Supabase `public.comments`.
14. Confirm the new row has `ciphertext` and `iv`.
15. Confirm `body` is null for the new encrypted comment.
16. Refresh the page and confirm the comment still appears readable in the UI.
17. Test a wrong password and confirm the login error is generic.

## 10. Five Minute Video Demo Script

### Minute 0 to 1: Project And Security Overview

Say:

> Equitask is a Next.js, TypeScript, Supabase, and Vercel app. The live website now uses Supabase sign up and sign in for normal access. For Phase 3, we implemented four security requirements in Supabase mode: secure password storage, server authentication on login, secure password transmission, and end to end encrypted comments.

Show:

- The app running.
- The sign-in page.
- A logged-in workspace or scrum board.

### Minute 1 to 2: Secure Password Storage

Say:

> We use Supabase Auth instead of storing passwords ourselves. Supabase Auth stores salted bcrypt password hashes in the protected auth schema. Our public tables do not contain passwords. We added password validation so empty passwords and passwords under 8 characters are rejected.

Show:

- `src/services/authService.ts` calling Supabase Auth.
- `src/lib/security/password.ts`.
- Supabase `public.profiles` table with no password column.

### Minute 2 to 3: Server Authentication And Secure Password Transmission

Say:

> On Vercel, users access the app over HTTPS. The browser verifies the server certificate during the TLS handshake before credentials are sent. We added a secure origin guard that blocks credential submission on insecure non-localhost origins. Passwords are sent through POST request bodies to same-origin API routes, not in URLs.

Show:

- Vercel HTTPS URL.
- `src/lib/security/secureOrigin.ts`.
- `next.config.mjs` security headers.
- DevTools Network tab showing a POST login request.

### Minute 3 to 4: Encrypted Comments In The App

Say:

> Equitask comments are treated as messages. When a user posts a comment, the browser encrypts it with AES-GCM before sending it to the API. The UI stays simple, so users just type a normal comment. Encryption happens automatically.

Show:

- Open a scrum board task.
- Type and post a comment.
- Show the readable comment in the UI.
- Show `src/lib/e2ee.ts` and `BoardTaskModal.tsx` or `TaskDetailClient.tsx`.

### Minute 4 to 5: Database Evidence And Limitations

Say:

> In Supabase, the new comment is stored as ciphertext. The `body` field is null for new encrypted comments. The database stores ciphertext, IV, encryption version, algorithm, and key id. The raw AES key is not stored in Supabase, so the server cannot read new encrypted comments. The limitation is that this is an educational prototype with a browser-local team key. A production version would use per-user public/private keys and encrypted team keys for each member.

Show:

- Supabase `public.comments` table.
- `ciphertext` column populated.
- `iv` column populated.
- `body` column null for the new comment.
- `supabase_phase3_security.sql`.

## 11. Known Limitations

The E2EE implementation is intentionally simple for a Week 12 demonstrable prototype. The AES team key is generated and stored only on the client device. The normal UI hides key management and automatically encrypts comments before storage.

This keeps the server unable to decrypt new comments, but it is not as smooth as production-grade public key based key distribution across multiple devices.

Legacy comments that already existed in `body` remain readable as legacy plaintext comments. New Supabase comments created after the migration and code update use ciphertext storage.

Content Security Policy was not added because a strict CSP can easily break Next.js, inline styles, Supabase, Vercel scripts, or development tooling if rushed. Safer baseline headers were added instead.

## 12. AI Usage Documentation

| File or Function | Description of AI Assistance | Prompt Summary |
|---|---|---|
| `src/lib/security/password.ts` | Generated shared password validation helper. | Add minimum 8 character password validation and empty password rejection. |
| `src/lib/security/secureOrigin.ts` | Generated secure origin guard. | Block credential submission unless HTTPS or localhost. |
| `src/lib/e2ee.ts` | Generated browser AES-GCM encryption helpers. | Use Web Crypto, random IVs, client-side encryption and decryption. |
| `src/services/authService.ts` | Modified auth service validation and errors. | Keep Supabase Auth and avoid custom password storage. |
| `src/app/api/auth/sign-in/route.ts` | Modified server login validation and generic errors. | Validate password before Supabase Auth and avoid leaking login details. |
| `src/app/api/auth/sign-up/route.ts` | Modified server sign-up validation and team join flow. | Enforce minimum password requirements and keep Supabase Auth. |
| `src/app/(auth)/sign-in/page.tsx` | Modified client sign-in guard. | Check secure origin before sending credentials. |
| `src/app/(auth)/sign-up/page.tsx` | Modified client sign-up guard. | Check secure origin before sending credentials. |
| `src/app/api/tasks/[taskId]/comments/route.ts` | Modified comment API validation. | Require encrypted payloads for Supabase comments. |
| `src/components/shared/TaskDetailClient.tsx` | Modified comment UI encryption/decryption. | Encrypt before POST, decrypt after load, show a minimal encrypted storage notice. |
| `src/components/board/BoardTaskModal.tsx` | Modified board task window comment UI. | Let board comments use the same automatic encryption flow without extra key controls. |
| `src/data/providers/supabaseProvider.ts` | Modified comment row mapping and insertion. | Store ciphertext and metadata only for new Supabase comments. |
| `src/data/providers/demoProvider.ts` | Adjusted legacy seeded-provider comment handling. | Keep old provider abstraction type-safe after encrypted comment inputs were added. |
| `src/data/providers/providerTypes.ts` | Added encrypted comment input type. | Pass encrypted comment payload through service/provider layer. |
| `src/types/index.ts` | Added encrypted comment metadata fields. | Let UI distinguish encrypted and legacy comments. |
| `next.config.mjs` | Added security headers. | Improve baseline browser security controls. |
| `supabase_phase3_security.sql` | Generated additive Supabase migration. | Add ciphertext columns while preserving old data and RLS policies. |
| `implementation.md` | Expanded security implementation evidence document. | Explain implementation, testing, video script, files changed, and limitations in teammate-friendly English. |

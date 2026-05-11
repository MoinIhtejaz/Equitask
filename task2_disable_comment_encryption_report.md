# Task 2 Security Demonstration: Disabled Comment Encryption

## Vulnerability Summary

This demonstration shows what happens when Equitask's end-to-end comment encryption is disabled or misconfigured.

In the secure implementation, task comments are treated as private team messages. When a user posts a comment in Supabase mode, the browser encrypts the comment with AES-GCM before sending it to the API. Supabase stores only ciphertext, an IV, and encryption metadata. The plaintext `public.comments.body` column is left `null` for new encrypted comments.

For the vulnerable demonstration, comment encryption is deliberately disabled with:

```env
NEXT_PUBLIC_DISABLE_COMMENT_ENCRYPTION_DEMO=true
```

When this flag is enabled, new Supabase comments are sent and stored as readable plaintext in `public.comments.body`. This lets an attacker with database access read private team messages directly.

## Security Feature Disabled

The disabled security feature is browser-side end-to-end encryption for task comments.

Secure behavior:

- `src/lib/e2ee.ts` encrypts comments in the browser with AES-GCM.
- `src/components/board/BoardTaskModal.tsx` and `src/components/shared/TaskDetailClient.tsx` encrypt comments before posting them.
- `src/app/api/tasks/[taskId]/comments/route.ts` requires an encrypted payload in Supabase mode.
- `src/data/providers/supabaseProvider.ts` stores `body: null`, plus `ciphertext`, `iv`, `encryption_version`, `encryption_algorithm`, and `key_id`.
- `supabase_phase3_security.sql` adds the encrypted comment columns and allows legacy plaintext rows only for backwards compatibility.

Vulnerable behavior:

- `NEXT_PUBLIC_DISABLE_COMMENT_ENCRYPTION_DEMO=true` disables the encryption path.
- The UI shows a red warning that plaintext demo mode is active.
- The API accepts a plaintext `message` in Supabase mode.
- The Supabase provider stores the message in `public.comments.body`.
- The `ciphertext`, `iv`, `encryption_version`, `encryption_algorithm`, and `key_id` fields are left `null`.

## Attack Scenario

An attacker gains read access to the Supabase database. This could happen through a leaked dashboard account, an over-permissive admin user, a compromised server environment, or an insider threat.

If comment encryption is enabled, the attacker sees only ciphertext and cannot read the message contents from the database.

If comment encryption is disabled, the attacker opens the `public.comments` table and reads the private team comment directly from the `body` column.

Example private message for the video:

```text
Private demo message: Moin is blocked by the database migration.
```

In the vulnerable state, this exact message appears in Supabase as readable plaintext.

## Impact

The impact is loss of confidentiality for team communication.

Private task comments may contain:

- blockers and project issues;
- team member availability;
- assignment ownership;
- personal performance information;
- internal planning notes.

Without encryption, anyone who can read the database can read those messages. This breaks the security goal that the server and database should not be able to read private message contents.

## How Proper Security Mitigates It

Proper security keeps encryption enabled and stores only encrypted comment data.

The secure implementation mitigates the vulnerability by:

- encrypting the comment in the browser before it leaves the user's device;
- using AES-GCM with a fresh IV for each comment;
- rejecting plaintext comments in Supabase mode unless the explicit demo flag is enabled;
- storing `body: null` for new encrypted comments;
- storing only ciphertext and metadata in Supabase;
- decrypting comments in the browser for display.

With the secure implementation restored, database access alone is not enough to read new comment content.

## Demo Setup

Use Supabase mode for this demonstration. Use fake test comments only.

### Secure Baseline Setup

1. Make sure the vulnerable flag is absent or false:

```env
NEXT_PUBLIC_DISABLE_COMMENT_ENCRYPTION_DEMO=false
```

2. Restart the Next.js app after changing environment variables.
3. Sign in to Equitask using a Supabase test account.
4. Open a task from the board or task detail page.
5. Post a comment.
6. Open Supabase Table Editor and inspect `public.comments`.
7. Show:
   - `body` is `null`;
   - `ciphertext` has a long unreadable value;
   - `iv` has a value;
   - `encryption_version` is `e2ee-v1`;
   - `encryption_algorithm` is `AES-GCM-256`.

### Vulnerable Demo Setup

1. Enable the intentional vulnerable mode:

```env
NEXT_PUBLIC_DISABLE_COMMENT_ENCRYPTION_DEMO=true
```

2. Restart the Next.js app.
3. Open the same task page or board modal.
4. Confirm the UI warning appears:

```text
Vulnerability demo: comment encryption is disabled, so new comments are stored as plaintext.
```

5. Post a new fake private comment.
6. Open Supabase Table Editor and inspect `public.comments`.
7. Show:
   - `body` contains the exact readable comment;
   - `ciphertext` is `null`;
   - `iv` is `null`;
   - encryption metadata is `null`.

### Restore Secure Mode

After recording, remove the flag or set it back to false:

```env
NEXT_PUBLIC_DISABLE_COMMENT_ENCRYPTION_DEMO=false
```

Restart the app and confirm new comments are encrypted again.

## Three-Minute Video Plan

### 0:00-0:25 - Introduce the Vulnerability

Say:

> This vulnerability demonstrates what happens when Equitask's comment encryption is disabled. In our app, task comments are treated as private team messages. Normally they are encrypted in the browser before being stored in Supabase. I will show the secure baseline first, then deliberately disable encryption and show how an attacker with database access can read the private comment.

Show:

- The Equitask task comments UI.
- The relevant code file names: `src/lib/e2ee.ts`, the comments API route, and `supabaseProvider.ts`.

### 0:25-1:10 - Show Secure Baseline

Say:

> In the secure version, comments are encrypted with AES-GCM before storage. The database receives ciphertext and an IV, not the readable message.

Show:

1. Post a comment in the app while secure mode is enabled.
2. Open Supabase `public.comments`.
3. Point to the new row.
4. Show that `body` is `null`.
5. Show that `ciphertext` and `iv` contain values.

Say:

> Even though I can see the database row, I cannot read the comment content from the database because only ciphertext is stored.

### 1:10-1:40 - Enable the Misconfiguration

Say:

> Now I will deliberately misconfigure the app by disabling comment encryption using a demo environment flag. This simulates a developer disabling a security feature for debugging or accidentally deploying an insecure configuration.

Show:

1. The environment variable:

```env
NEXT_PUBLIC_DISABLE_COMMENT_ENCRYPTION_DEMO=true
```

2. Restart the app.
3. Refresh the task comments page.
4. Show the red warning that plaintext demo mode is active.

### 1:40-2:25 - Demonstrate the Attack

Say:

> I will now post a private team comment while encryption is disabled. The attacker scenario is a database reader, leaked dashboard account, or insider who can inspect the Supabase table.

Show:

1. Post a comment such as:

```text
Private demo message: Moin is blocked by the database migration.
```

2. Open Supabase `public.comments`.
3. Show the new row.
4. Show that `body` contains the exact readable message.
5. Show that `ciphertext` and `iv` are `null`.

Say:

> This is the vulnerability. The private message is readable directly in the database because encryption was disabled.

### 2:25-3:00 - Explain Impact and Fix

Say:

> The impact is loss of confidentiality. Team comments can include blockers, assignment ownership, availability, or other private project information. If the database is accessed by an attacker or insider, plaintext comments can be read immediately.

Say:

> The fix is to keep browser-side encryption enabled, require encrypted payloads in the API, and store only ciphertext, IV, and encryption metadata in Supabase. In secure mode, new comments have `body` set to null, so database access alone is not enough to read the message.

Show:

- Disable the demo flag or point back to secure code.
- `src/app/api/tasks/[taskId]/comments/route.ts` requiring encrypted payloads when the flag is off.
- `src/data/providers/supabaseProvider.ts` storing `body: null` in secure mode.

## Files and Functions Modified for the Demonstration

| File | AI-assisted change | Purpose |
|---|---|---|
| `src/lib/security/commentEncryptionDemo.ts` | Added `isCommentEncryptionDisabledForDemo()` and the environment flag constant. | Provides an explicit demo-only switch for disabling comment encryption. |
| `src/components/board/BoardTaskModal.tsx` | Added plaintext demo mode handling and warning UI. | Lets the board modal send plaintext comments only when the demo flag is enabled. |
| `src/components/shared/TaskDetailClient.tsx` | Added plaintext demo mode handling and warning UI. | Lets the task detail page send plaintext comments only when the demo flag is enabled. |
| `src/app/api/tasks/[taskId]/comments/route.ts` | Added conditional plaintext acceptance when the demo flag is enabled. | Keeps secure mode strict while allowing the vulnerable demonstration. |
| `src/data/providers/supabaseProvider.ts` | Added conditional storage of plaintext comments in `body` when the demo flag is enabled. | Demonstrates the database confidentiality failure. |
| `task2_disable_comment_encryption_report.md` | Generated this report and video plan. | Documents the attack, impact, mitigation, and recording steps. |

## AI Prompt Appendix

The following user prompt was used to generate this report and demo support code:

> Demonstrate this and then write a report for me and how to show it in the video:
>
> 1. Disable Comment Encryption
> Best fit for your codebase. You already have E2EE comment work in src/lib/e2ee.ts, BoardTaskModal.tsx, TaskDetailClient.tsx, the comments API route, and supabase_phase3_security.sql.
>
> Demo idea: show secure baseline where Supabase stores ciphertext and iv, with body null. Then intentionally misconfigure the app to accept/store plaintext comments in public.comments.body. The "attacker" opens Supabase and reads the private team message.
>
> Why it works: very visual, easy to explain, and directly maps to the assignment's "disable encryption" example.

AI-assisted content produced:

- The demo-only environment flag implementation.
- The vulnerable-mode UI warnings.
- The API and provider conditional logic for plaintext storage.
- This report and video script.

## Important Submission Note

Do not leave `NEXT_PUBLIC_DISABLE_COMMENT_ENCRYPTION_DEMO=true` enabled in the final secure deployment. The insecure flag exists only to demonstrate the vulnerability for Task 2. The secure configuration is with the flag removed or set to `false`.

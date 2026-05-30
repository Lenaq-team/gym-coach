# Edge Functions

Server-side functions that require elevated privileges (service role).
Each function validates the caller's JWT before executing.

---

## `create-client`

**Added:** 2026-05-29  
**Purpose:** Allows a coach to create a new client account from the app.

Creating auth users requires the service role key, which cannot be exposed on the client side. This function handles the full creation flow atomically:

1. Verifies the caller is an authenticated coach.
2. Creates the Supabase auth user (email + password, confirmed immediately).
3. Inserts a record into `public.users` (email, full_name, phone).
4. Inserts a record into `public.clients` linked to the coach.
5. Rolls back the auth user if any step fails.

**Called from:** `src/hooks/useAuth.js` → `useCreateClient`

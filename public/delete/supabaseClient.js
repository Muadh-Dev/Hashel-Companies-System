import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://your-project-id.supabase.co",
  "sb_publishable_..."
)

// ---cut---
async function signUpNewUser() {
  const { data, error } = await supabase.auth.signUp({
    email: "valid.email@supabase.io",
    password: "example-password",
    options: {
      emailRedirectTo: "https://example.com/welcome",
    },
  })
}

import { createClient } from "@supabase/supabase-js"

// const supabase = createClient('https://your-project-id.supabase.co', 'sb_publishable_...')

// ---cut---
// defaults to the global scope
await supabase.auth.signOut()

// sign out from the current session only
await supabase.auth.signOut({ scope: "local" })

import { createClient } from "@/lib/supabase/server";
import { LoginPortalForm } from "./login-portal-form";

export default async function AdminLoginPortalPage() {
  // If the admin is already signed in (Supabase session persists far longer than
  // the 30-min PIN unlock), skip the password step and go straight to the PIN.
  let initialStage: "password" | "pin" = "password";
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") initialStage = "pin";
    }
  } catch {
    initialStage = "password";
  }

  return <LoginPortalForm initialStage={initialStage} />;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetSchema, type Reset } from "@/features/user-auth/schemas";
import { createClient } from "@/lib/supabase/client";
import { AuthField } from "@/components/auth/field";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Reset>({ resolver: zodResolver(resetSchema) });

  async function onSubmit(values: Reset) {
    const supabase = createClient();
    // The reset link established a session via /auth/callback, so updateUser works here.
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setError("root", { message: error.message });
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 1200);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Set a new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Choose a strong password you&apos;ll remember.</p>

      {done ? (
        <p className="mt-8 rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-sm font-medium text-primary">
          Password updated — taking you to your account…
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
          <AuthField
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />

          {errors.root ? (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400"
            >
              {errors.root.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            {isSubmitting ? "Updating…" : "Update password"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

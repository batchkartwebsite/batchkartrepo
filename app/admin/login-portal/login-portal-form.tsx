"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { credsSchema, pinSchema, type Creds, type Pin } from "@/features/admin-auth/schemas";
import { signInAdmin, verifyAdminPin } from "@/features/admin-auth/actions";

type Stage = "password" | "pin";

const inputClass = (invalid?: boolean) =>
  cn(
    "block w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
    "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50",
    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
    "focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:border-emerald-500",
    invalid ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-700",
  );

export function LoginPortalForm({ initialStage }: { initialStage: Stage }) {
  const [stage, setStage] = useState<Stage>(initialStage);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            BatchKart
          </span>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Admin Portal</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {stage === "password" ? (
            <PasswordStep onSuccess={() => setStage("pin")} />
          ) : (
            <PinStep onSwitch={() => setStage("password")} />
          )}
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {(["password", "pin"] as Stage[]).map((s) => (
            <span
              key={s}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors",
                stage === s
                  ? "bg-emerald-600 dark:bg-emerald-400"
                  : stage === "pin" && s === "password"
                    ? "bg-emerald-600/40 dark:bg-emerald-400/40"
                    : "bg-gray-200 dark:bg-gray-700",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PasswordStep({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Creds>({ resolver: zodResolver(credsSchema) });

  async function onSubmit(values: Creds) {
    const result = await signInAdmin(values);
    if (result.ok) onSuccess();
    else setError("root", { message: result.error });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Sign in</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Enter your admin credentials to continue.
        </p>
      </div>

      <fieldset disabled={isSubmitting} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...register("email")}
            className={inputClass(Boolean(errors.email))}
            placeholder="admin@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className={inputClass(Boolean(errors.password))}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>}
        </div>
      </fieldset>

      {errors.root && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
        >
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-9 w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        {isSubmitting ? "Signing in…" : "Continue"}
      </Button>
    </form>
  );
}

function PinStep({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Pin>({ resolver: zodResolver(pinSchema) });

  const isBusy = isSubmitting || isPending;

  async function onSubmit(values: Pin) {
    const result = await verifyAdminPin(values);
    if (result.ok) {
      startTransition(() => {
        router.push("/admin");
        router.refresh();
      });
    } else {
      setError("root", { message: result.error });
    }
  }

  async function switchAccount() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onSwitch();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Enter your PIN</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          You&apos;re signed in — enter your 8-digit security PIN to unlock the panel.
        </p>
      </div>

      <fieldset disabled={isBusy} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Security PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={8}
            {...register("pin")}
            className={cn(inputClass(Boolean(errors.pin)), "tracking-[0.5em] placeholder:tracking-normal")}
            placeholder="••••••••"
          />
          {errors.pin && <p className="text-xs text-red-500 dark:text-red-400">{errors.pin.message}</p>}
        </div>
      </fieldset>

      {errors.root && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
        >
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isBusy}
        className="h-9 w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        {isBusy ? "Verifying…" : "Unlock Panel"}
      </Button>

      <button
        type="button"
        onClick={switchAccount}
        className="mx-auto block text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Sign in with a different account
      </button>
    </form>
  );
}

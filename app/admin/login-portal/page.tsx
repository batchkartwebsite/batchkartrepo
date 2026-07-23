"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { credsSchema, pinSchema, type Creds, type Pin } from "@/features/admin-auth/schemas";
import { signInAdmin, verifyAdminPin } from "@/features/admin-auth/actions";

type Stage = "password" | "pin";

export default function AdminLoginPortalPage() {
  const [stage, setStage] = useState<Stage>("password");
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            BatchKart
          </span>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-8">
          {stage === "password" ? (
            <PasswordStep onSuccess={() => setStage("pin")} />
          ) : (
            <PinStep />
          )}
        </div>

        {/* Stage indicator */}
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

/* ------------------------------------------------------------------ */
/* Stage 1 — Email + Password                                          */
/* ------------------------------------------------------------------ */

function PasswordStep({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Creds>({ resolver: zodResolver(credsSchema) });

  async function onSubmit(values: Creds) {
    const result = await signInAdmin(values);
    if (result.ok) {
      onSuccess();
    } else {
      setError("root", { message: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Sign in
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Enter your admin credentials to continue.
        </p>
      </div>

      <fieldset disabled={isSubmitting} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...register("email")}
            className={cn(
              "block w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:border-emerald-500",
              errors.email
                ? "border-red-400 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700",
            )}
            placeholder="admin@example.com"
          />
          {errors.email && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className={cn(
              "block w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:border-emerald-500",
              errors.password
                ? "border-red-400 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700",
            )}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>
      </fieldset>

      {errors.root && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 h-9"
      >
        {isSubmitting ? "Signing in…" : "Continue"}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Stage 2 — 8-digit PIN                                               */
/* ------------------------------------------------------------------ */

function PinStep() {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Enter your PIN
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Enter your 8-digit security PIN to unlock the admin panel.
        </p>
      </div>

      <fieldset disabled={isBusy} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="pin"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
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
            className={cn(
              "block w-full rounded-lg border px-3 py-2 text-sm outline-none transition tracking-[0.5em]",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:tracking-normal",
              "focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:border-emerald-500",
              errors.pin
                ? "border-red-400 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700",
            )}
            placeholder="••••••••"
          />
          {errors.pin && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {errors.pin.message}
            </p>
          )}
        </div>
      </fieldset>

      {errors.root && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isBusy}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 h-9"
      >
        {isBusy ? "Verifying…" : "Unlock Panel"}
      </Button>
    </form>
  );
}

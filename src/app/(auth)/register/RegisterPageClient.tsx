"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { register as registerApi } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/services/api";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useLegalModalStore } from "@/store/legalModalStore";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[a-zA-Z]/, "Include a letter")
      .regex(/[0-9]/, "Include a number"),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type Form = z.infer<typeof schema>;

export function RegisterPageClient() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const showPrivacy = useLegalModalStore((s) => s.showPrivacy);
  const showTerms = useLegalModalStore((s) => s.showTerms);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      const res = await registerApi({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      setAuth(res.user, res.accessToken);
      toast.success("Account created!");
      window.location.assign("/dashboard");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Registration failed"));
    }
  };

  const inputClass =
    "w-full rounded-full border-none bg-surface-container-highest px-4 py-2.5 text-sm font-medium text-on-background placeholder:text-on-surface-variant/50 transition-all focus:ring-2 focus:ring-primary/40 focus:outline-none sm:px-5";

  const passwordInputClass = `${inputClass} pr-11 sm:pr-12`;

  return (
    <div className="flex w-full flex-col md:min-h-0 md:flex-1">
      <main className="flex grow items-center justify-center px-3 py-4 sm:px-4 md:py-6">
        <div className="editorial-shadow grid w-full max-w-4xl grid-cols-1 gap-0 overflow-hidden rounded-editorial-lg bg-surface-container-low lg:max-w-5xl lg:grid-cols-2 lg:rounded-editorial-xl">
          {/* Side A */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-container p-6 text-on-primary-container lg:flex lg:p-8">
            <div className="hand-drawn-star absolute top-5 right-5 size-14 bg-tertiary-fixed-dim opacity-30 lg:top-6 lg:right-6 lg:size-16" />
            <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-surface-container-lowest opacity-10 lg:-bottom-10 lg:-left-10 lg:size-48" />
            <div className="relative z-10">
              <BrandLogo
                className="mb-3"
                textClassName="font-headline text-lg font-black tracking-tighter text-on-primary-container sm:text-xl"
              />
              <span className="mb-2 inline-block rounded-full bg-on-primary-container px-3 py-0.5 text-[10px] font-bold tracking-widest text-primary-container uppercase">
                The Creator Suite
              </span>
              <h1 className="font-headline text-2xl leading-[0.95] font-black tracking-tighter md:text-3xl lg:text-4xl">
                Every <span className="text-tertiary-fixed">great</span> legacy begins with a single{" "}
                <span className="italic underline decoration-tertiary-fixed/40 decoration-4">word</span>.
              </h1>
            </div>
            <div className="relative z-10 rounded-editorial border border-on-primary-container/10 bg-surface-container-lowest/10 p-3.5 backdrop-blur-md sm:p-4 lg:rounded-editorial-lg">
              <div className="mb-2 flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-on-primary-container/20 bg-on-primary-container/12 text-[0.55rem] font-bold tabular-nums text-on-primary-container">
                  AR
                </div>
                <p className="text-sm leading-none font-bold">Abhishek Rai</p>
              </div>
              <p className="text-sm font-medium leading-snug italic">
                &ldquo;Stories gave me the canvas I didn&apos;t know I was missing. It&apos;s not just a platform;
                it&apos;s a heartbeat for digital journalism.&rdquo;
              </p>
            </div>
            <div className="pointer-events-none absolute right-0 bottom-10 w-48 translate-x-1/3 opacity-20 sm:bottom-12 sm:w-56 lg:bottom-14 lg:w-64">
              <svg
                className="h-auto w-full"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M200 0C250 100 400 150 400 200C400 250 250 300 200 400C150 300 0 250 0 200C0 150 150 100 200 0Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          {/* Side B */}
          <div className="mx-auto flex w-full max-w-[360px] flex-col justify-center bg-surface-container-low p-4 sm:max-w-md sm:p-5 lg:mx-0 lg:max-w-none lg:p-7">
            <BrandLogo
              className="mb-2 self-center lg:hidden"
              textClassName="font-headline text-lg font-black tracking-tighter text-primary"
            />
            <Link
              href="/"
              className="font-login-label mb-3 inline-flex items-center gap-1.5 self-center text-sm font-bold text-primary transition-colors hover:underline lg:mb-2 lg:self-start"
            >
              <span aria-hidden>←</span>
              Back to home
            </Link>
            <div className="mb-4 text-center lg:mb-4 lg:text-left">
              <h2 className="font-headline mb-0.5 text-xl font-black tracking-tighter text-on-background sm:text-2xl md:text-3xl">
                Join the narrative.
              </h2>
              <p className="text-sm font-medium text-on-surface-variant">
                Start your 14-day free trial today. No credit card required.
              </p>
            </div>

            <form className="space-y-2.5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-1">
                <label
                  htmlFor="reg-name"
                  className="font-login-label ml-3 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sm:ml-4 sm:text-xs"
                >
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Julian Barnes"
                  className={inputClass}
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="ml-3 text-xs text-error sm:ml-4 sm:text-sm" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="reg-email"
                  className="font-login-label ml-3 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sm:ml-4 sm:text-xs"
                >
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="writer@stories.com"
                  className={inputClass}
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="ml-3 text-xs text-error sm:ml-4 sm:text-sm" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="reg-password"
                  className="font-login-label ml-3 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sm:ml-4 sm:text-xs"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={passwordInputClass}
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-on-surface-variant/60 transition-colors hover:text-primary sm:right-5"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4 sm:size-5" strokeWidth={1.75} />
                    ) : (
                      <Eye className="size-4 sm:size-5" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="ml-3 text-xs text-error sm:ml-4 sm:text-sm" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="reg-confirm"
                  className="font-login-label ml-3 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sm:ml-4 sm:text-xs"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={passwordInputClass}
                    aria-invalid={!!errors.confirm}
                    {...register("confirm")}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-on-surface-variant/60 transition-colors hover:text-primary sm:right-5"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4 sm:size-5" strokeWidth={1.75} />
                    ) : (
                      <Eye className="size-4 sm:size-5" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="ml-3 text-xs text-error sm:ml-4 sm:text-sm" role="alert">
                    {errors.confirm.message}
                  </p>
                )}
              </div>
              <div className="pt-0.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-headline w-full rounded-full bg-primary py-3 text-sm font-black tracking-tight text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-container active:scale-95 disabled:opacity-70 sm:text-base"
                >
                  {isSubmitting ? "Creating…" : "Create Account"}
                </button>
              </div>
            </form>

            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-on-surface-variant">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="ml-1 font-bold text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
            <p className="mx-auto mt-3 max-w-md text-center text-xs leading-snug text-on-surface-variant">
              By clicking Create Account, you agree to our{" "}
              <button
                type="button"
                className="font-medium text-on-surface underline decoration-primary/40 underline-offset-2 hover:text-primary"
                onClick={showTerms}
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="font-medium text-on-surface underline decoration-primary/40 underline-offset-2 hover:text-primary"
                onClick={showPrivacy}
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

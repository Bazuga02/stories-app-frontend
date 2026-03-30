"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Lottie from "lottie-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Quote, Sparkles, Star } from "lucide-react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/services/api";
import { Footer } from "@/components/ui/footer";
import loginAnimation from "../../../public/login-anim.json";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type Form = z.infer<typeof schema>;

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      const res = await login(data);
      setAuth(res.user, res.token);
      toast.success("Welcome back!");
      window.location.assign(next);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Login failed"));
    }
  };

  return (
    <div className="flex w-full flex-col md:min-h-0 md:flex-1">
      <main className="flex w-full flex-col text-on-surface md:min-h-0 md:flex-1 md:flex-row md:overflow-hidden">
        {/* Left: illustration */}
        <section className="relative hidden w-full flex-col items-center justify-center overflow-hidden bg-surface-container-low p-6 md:flex md:w-1/2 md:p-7 lg:w-[55%]">
          <div className="absolute top-12 left-12 text-primary opacity-20 md:top-14 md:left-14">
            <Star aria-hidden className="size-11 md:size-12" strokeWidth={1.25} />
          </div>
          <div className="absolute right-7 bottom-28 rotate-12 text-tertiary-container opacity-20 md:bottom-26">
            <Sparkles aria-hidden className="size-13 md:size-17" strokeWidth={1.25} />
          </div>
          <div className="relative z-10 w-full max-w-lg lg:max-w-xl">
            <div className="editorial-cloud -rotate-2 transform bg-surface-container-lowest p-2 shadow-2xl">
              <Lottie
                animationData={loginAnimation}
                loop
                className="h-[min(40vh,380px)] w-full md:h-[380px] lg:h-[440px] [&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain"
                aria-label="Animated illustration for Stories sign-in"
              />
            </div>
            <div className="absolute -right-3 -bottom-2 max-w-[190px] -translate-y-2 rotate-3 rounded-editorial border border-outline-variant/10 bg-surface-container-lowest p-3 shadow-lg sm:max-w-[220px] sm:p-4 sm:-translate-y-3">
              <Quote aria-hidden className="mb-1 size-5 text-primary" strokeWidth={2} />
              <p className="font-headline text-sm leading-snug text-on-surface sm:text-base">
                Every word is a <span className="text-primary">new world</span> waiting to be built.
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[0.5rem] font-bold tabular-nums text-primary sm:size-6 sm:text-[0.55rem]">
                  AR
                </div>
                <span className="text-on-secondary-container text-[9px] font-bold tracking-wide sm:text-[10px]">
                  Abhishek Rai
                </span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-6 left-6 md:bottom-7 md:left-7">
            <Link
              href="/"
              className="font-headline text-3xl font-black tracking-tighter text-primary transition-colors hover:text-primary-container"
            >
              Stories
            </Link>
          </div>
        </section>

        {/* Right: form */}
        <section className="relative flex w-full shrink-0 flex-col items-center justify-start bg-editorial-surface px-5 pb-10 pt-5 md:min-h-0 md:w-1/2 md:justify-center md:px-10 md:pb-12 md:pt-12 lg:w-[45%] lg:px-12">
          <div className="w-full max-w-[340px] space-y-4 pb-6 sm:max-w-md sm:space-y-6 md:space-y-6 md:pb-0">
            <Link
              href="/"
              className="font-login-label inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:underline"
            >
              <span aria-hidden>←</span>
              Back to home
            </Link>
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl lg:text-4xl">
                Welcome back.
              </h2>
              <p className="text-on-surface-variant text-sm sm:text-base">Your narrative continues here.</p>
            </div>

            <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="login-email"
                    className="font-login-label mb-1 ml-3 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sm:text-xs"
                  >
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@editorial.com"
                    className="w-full rounded-full border-none bg-surface-container-highest px-5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-2 focus:ring-primary/40 focus:outline-none sm:px-6 sm:text-base"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-0.5 ml-3 text-xs text-error sm:text-sm" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="login-password"
                    className="font-login-label mb-1 ml-3 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase sm:text-xs"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-full border-none bg-surface-container-highest px-5 py-3 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:ring-2 focus:ring-primary/40 focus:outline-none sm:px-6 sm:pr-14 sm:text-base"
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
                    <p className="mt-0.5 ml-3 text-xs text-error sm:text-sm" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 px-1">
                <label className="group flex min-w-0 cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    className="size-3.5 shrink-0 rounded border-outline-variant text-primary focus:ring-primary/30 sm:size-4"
                  />
                  <span className="text-on-surface-variant text-xs font-medium transition-colors group-hover:text-on-surface sm:text-sm">
                    Remember me
                  </span>
                </label>
                <Link
                  href="#"
                  className="shrink-0 text-xs font-bold text-primary transition-colors hover:text-primary-container sm:text-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="font-headline w-full rounded-full bg-primary py-3.5 text-base font-bold text-on-primary shadow-lg shadow-primary/10 transition-all duration-300 hover:bg-primary-container active:scale-95 disabled:opacity-70 sm:py-4"
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </button>

              <p className="text-center text-on-surface-variant text-sm sm:text-base md:hidden">
                New to Stories?{" "}
                <Link
                  href={next !== "/" ? `/register?next=${encodeURIComponent(next)}` : "/register"}
                  className="font-headline font-bold text-primary underline decoration-primary/40 decoration-2 underline-offset-[5px] transition-colors hover:text-primary-container"
                >
                  Create an account
                </Link>
              </p>
            </form>

            <div className="hidden pt-2 text-center md:block md:pt-5">
              <p className="text-on-surface-variant text-sm sm:text-base">
                Don&apos;t have an account?{" "}
                <Link
                  href={next !== "/" ? `/register?next=${encodeURIComponent(next)}` : "/register"}
                  className="ml-1 font-bold text-on-surface underline decoration-primary/30 decoration-2 underline-offset-4 transition-colors hover:text-primary"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 size-72 rounded-full bg-tertiary-fixed-dim/20 blur-[80px] sm:size-80" />
        <div className="absolute top-1/2 -right-36 size-72 rounded-full bg-primary-fixed-dim/10 blur-[100px] sm:-right-40 sm:size-80" />
      </div>

      <Footer className="relative z-10 mt-auto w-full shrink-0 py-6 sm:py-8 md:py-12" />
    </div>
  );
}

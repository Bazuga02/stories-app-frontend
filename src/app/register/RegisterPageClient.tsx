"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { register as registerApi } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/services/api";
import { Footer } from "@/components/ui/footer";
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

const portraitSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAnZ9ofwMsSOQSbDZJ9i7J0SZ2EobXoy6nfUXqH0f32SFOJgsiipJihTq7VJvs26EyuvckuqW9umx4LWcHKt7hB6q0uXgwNJ0Gj_LLTgfAk-nvBWwbKGwauw9C1nVC0rlP_qi1R3zRSfYs1iPtOPbXh6M6acbWla5toDEt41p0WG3CaozpTTI_u9Pc6yzykdsFw6a_rf5FAku2YNzMim1s6A_DazNUuhyKRiqCmyc1gLRNhSBVSLMhXChnoTwxRt2EWmcmKzRHGUA8";

export function RegisterPageClient() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const showPrivacy = useLegalModalStore((s) => s.showPrivacy);
  const showTerms = useLegalModalStore((s) => s.showTerms);

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
      setAuth(res.user, res.token);
      toast.success("Account created!");
      window.location.assign("/dashboard");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Registration failed"));
    }
  };

  const inputClass =
    "w-full rounded-full border-none bg-surface-container-highest px-5 py-3 text-sm font-medium text-on-background placeholder:text-on-surface-variant/50 transition-all focus:ring-2 focus:ring-primary/40 focus:outline-none sm:px-6 sm:text-base";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="top-0 z-50 w-full shrink-0 bg-editorial-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
          <Link
            href="/"
            className="font-headline text-xl font-black tracking-tighter text-on-surface transition-colors hover:text-primary md:text-2xl"
          >
            Stories
          </Link>
          <Link
            href="/"
            className="font-login-label text-sm font-bold text-primary transition-colors hover:underline"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="flex grow items-center justify-center px-3 py-6 sm:px-4 md:py-10">
        <div className="editorial-shadow grid w-full max-w-5xl grid-cols-1 gap-0 overflow-hidden rounded-editorial-lg bg-surface-container-low lg:max-w-6xl lg:grid-cols-2 lg:rounded-editorial-xl">
          {/* Side A */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-container p-8 text-on-primary-container lg:flex lg:p-10">
            <div className="hand-drawn-star absolute top-6 right-6 size-16 bg-tertiary-fixed-dim opacity-30 lg:top-8 lg:right-8 lg:size-20" />
            <div className="absolute -bottom-8 -left-8 size-48 rounded-full bg-surface-container-lowest opacity-10 lg:-bottom-10 lg:-left-10 lg:size-56" />
            <div className="relative z-10">
              <span className="mb-3 inline-block rounded-full bg-on-primary-container px-3 py-0.5 text-[10px] font-bold tracking-widest text-primary-container uppercase sm:px-4 sm:py-1 sm:text-xs lg:mb-4">
                The Creator Suite
              </span>
              <h1 className="font-headline text-3xl leading-[0.92] font-black tracking-tighter md:text-4xl lg:text-5xl">
                Every <span className="text-tertiary-fixed">great</span> legacy begins with a single{" "}
                <span className="italic underline decoration-tertiary-fixed/40 decoration-4 sm:decoration-8">word</span>.
              </h1>
            </div>
            <div className="relative z-10 rounded-editorial border border-on-primary-container/10 bg-surface-container-lowest/10 p-4 backdrop-blur-md sm:p-5 lg:rounded-editorial-lg lg:p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="size-10 shrink-0 overflow-hidden rounded-full bg-tertiary-fixed-dim sm:size-11">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portraitSrc}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm leading-none font-bold sm:text-base">Elena Rossi</p>
                  <p className="text-[10px] opacity-70 sm:text-xs">Editor-in-Chief</p>
                </div>
              </div>
              <p className="text-sm font-medium leading-relaxed italic sm:text-base">
                &ldquo;Stories gave me the canvas I didn&apos;t know I was missing. It&apos;s not just a platform;
                it&apos;s a heartbeat for digital journalism.&rdquo;
              </p>
            </div>
            <div className="pointer-events-none absolute right-0 bottom-14 w-56 translate-x-1/3 opacity-20 sm:bottom-16 sm:w-64 lg:bottom-20 lg:w-72">
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
          <div className="mx-auto flex w-full max-w-[380px] flex-col justify-center bg-surface-container-low p-5 sm:max-w-md md:p-8 lg:mx-0 lg:max-w-none lg:p-10">
            <Link
              href="/"
              className="font-login-label mb-4 inline-flex items-center gap-1.5 self-center text-sm font-bold text-primary transition-colors hover:underline lg:self-start"
            >
              <span aria-hidden>←</span>
              Back to home
            </Link>
            <div className="mb-5 text-center lg:mb-6 lg:text-left">
              <h2 className="font-headline mb-1 text-2xl font-black tracking-tighter text-on-background sm:text-3xl md:text-4xl">
                Join the narrative.
              </h2>
              <p className="text-sm font-medium text-on-surface-variant sm:text-base">
                Start your 14-day free trial today. No credit card required.
              </p>
            </div>

            <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClass}
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
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
                <input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClass}
                  aria-invalid={!!errors.confirm}
                  {...register("confirm")}
                />
                {errors.confirm && (
                  <p className="ml-3 text-xs text-error sm:ml-4 sm:text-sm" role="alert">
                    {errors.confirm.message}
                  </p>
                )}
              </div>
              <div className="pt-1 sm:pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-headline w-full rounded-full bg-primary py-3.5 text-base font-black tracking-tight text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-container active:scale-95 disabled:opacity-70 sm:py-4"
                >
                  {isSubmitting ? "Creating…" : "Create Account"}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center sm:mt-5">
              <p className="text-sm font-medium text-on-surface-variant sm:text-base">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="ml-1 font-bold text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
            <p className="mx-auto mt-4 max-w-md text-center text-xs leading-relaxed text-on-surface-variant sm:mt-5 sm:text-sm">
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

      <Footer className="mt-auto shrink-0" />
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { CardInner } from "@/components/ui/card";
import { HomeHeroLottie } from "@/features/home/HomeHeroLottie";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type Form = z.infer<typeof schema>;

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const setAuth = useAuthStore((s) => s.setAuth);

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
    <main className="container-design flex flex-1 flex-col items-center justify-center py-[var(--spacing-section)]">
      <div className="grid w-full max-w-5xl items-stretch gap-[var(--spacing-xl)] lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <section className="hidden rounded-[var(--radius-xl)] border border-dark/10 bg-white/70 p-[var(--spacing-xl)] shadow-card lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-label mb-2 uppercase tracking-wider text-dark/55">
              Your writing space
            </p>
            <h2 className="font-hero text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.05] text-accent">
              Pick up where you left off.
            </h2>
            <p className="mt-3 max-w-sm text-dark/75">
              Continue drafting, follow authors, and keep your reading list in sync.
            </p>
          </div>
          <HomeHeroLottie className="mt-6" src="/Book Lover.json" />
        </section>

        <section className="w-full max-w-md justify-self-center lg:max-w-none">
          <p className="text-hero-heading mb-2 text-center text-[clamp(1.75rem,5vw,2.5rem)]">
            Welcome back
          </p>
          <p className="mb-[var(--spacing-xl)] text-center text-[1rem] text-dark/75">
            Sign in to write, bookmark, and manage your stories.
          </p>
          <CardInner className="!border !border-dark/10 !bg-white/95 !p-[var(--spacing-lg)] !shadow-card">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-[var(--spacing-md)]"
            >
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <PasswordInput
                label="Password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Log in
              </Button>
            </form>
            <p className="mt-[var(--spacing-lg)] text-center text-[0.875rem] text-dark/70">
              No account?{" "}
              <Link href="/register" className="font-semibold text-accent underline-offset-2 hover:underline">
                Create one
              </Link>
            </p>
          </CardInner>
        </section>
      </div>
    </main>
  );
}

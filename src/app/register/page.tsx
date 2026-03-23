"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { register as registerApi } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { CardInner } from "@/components/ui/card";
import { HomeHeroLottie } from "@/features/home/HomeHeroLottie";

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

export default function RegisterPage() {
  const setAuth = useAuthStore((s) => s.setAuth);

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

  return (
    <main className="container-design flex flex-1 flex-col items-center justify-center py-[var(--spacing-section)]">
      <div className="grid w-full max-w-5xl items-stretch gap-[var(--spacing-xl)] lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1fr)]">
        <section className="w-full max-w-md justify-self-center lg:order-2 lg:max-w-none">
          <p className="text-hero-heading mb-2 text-center text-[clamp(1.75rem,5vw,2.5rem)]">
            Join Stories
          </p>
          <p className="mb-[var(--spacing-xl)] text-center text-[1rem] text-dark/75">
            Publish drafts, get feedback, and grow your readership.
          </p>
          <CardInner className="!border !border-dark/10 !bg-white/95 !p-[var(--spacing-lg)] !shadow-card">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-[var(--spacing-md)]"
            >
              <Input
                label="Display name"
                autoComplete="name"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <PasswordInput
                label="Password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordInput
                label="Confirm password"
                autoComplete="new-password"
                error={errors.confirm?.message}
                {...register("confirm")}
              />
              <Button type="submit" variant="accent" className="w-full" isLoading={isSubmitting}>
                Create account
              </Button>
            </form>
            <p className="mt-[var(--spacing-lg)] text-center text-[0.875rem] text-dark/70">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-accent underline-offset-2 hover:underline">
                Log in
              </Link>
            </p>
          </CardInner>
        </section>

        <section className="hidden rounded-[var(--radius-xl)] border border-dark/10 bg-white/70 p-[var(--spacing-xl)] shadow-card lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-label mb-2 uppercase tracking-wider text-dark/55">
              Start publishing
            </p>
            <h2 className="font-hero text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.05] text-accent">
              Create your account in under a minute.
            </h2>
            <p className="mt-3 max-w-sm text-dark/75">
              Draft your first story, share it instantly, and build your audience over time.
            </p>
          </div>
          <HomeHeroLottie className="mt-6" src="/Back to school!.json" />
        </section>
      </div>
    </main>
  );
}

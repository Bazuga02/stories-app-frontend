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
      <div className="w-full max-w-md">
        <p className="text-hero-heading mb-2 text-center text-[clamp(1.75rem,5vw,2.5rem)]">
          Welcome back
        </p>
        <p className="mb-[var(--spacing-xl)] text-center text-[1rem] text-dark/75">
          Sign in to write, bookmark, and manage your stories.
        </p>
        <CardInner className="!p-[var(--spacing-lg)]">
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
      </div>
    </main>
  );
}

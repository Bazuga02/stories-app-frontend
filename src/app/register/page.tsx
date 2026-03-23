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
      <div className="w-full max-w-md">
        <p className="text-hero-heading mb-2 text-center text-[clamp(1.75rem,5vw,2.5rem)]">
          Join Stories
        </p>
        <p className="mb-[var(--spacing-xl)] text-center text-[1rem] text-dark/75">
          Publish drafts, get feedback, and grow your readership.
        </p>
        <CardInner className="!p-[var(--spacing-lg)]">
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
      </div>
    </main>
  );
}

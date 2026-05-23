"use client";

import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAppDependencies } from "@/shared/providers/AppDependenciesContext";

export default function LoginPage() {
  const { loginUseCase } = useAppDependencies();
  const { login, isLoading, error } = useLogin({ loginUseCase });

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
      </div>
    </main>
  );
}

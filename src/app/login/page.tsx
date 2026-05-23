"use client";

import { useMemo } from "react";
import { FetchHttpClient } from "@/shared/services/fetch-http.client";
import { HttpAuthRepository } from "@/features/auth/repositories/http-auth.repository";
import { LoginUseCase } from "@/features/auth/application/usecases/login.use-case";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  const loginUseCase = useMemo(() => {
    const httpClient = new FetchHttpClient();
    const authRepository = new HttpAuthRepository(httpClient);
    return new LoginUseCase(authRepository);
  }, []);

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

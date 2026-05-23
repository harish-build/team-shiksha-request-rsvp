"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { LoginUseCase } from "../application/usecases/login.use-case";
import { InvalidCredentialsError } from "../errors/invalid-credentials.error";
import { ValidationError } from "../errors/validation.error";

export interface UseLoginDependencies {
  loginUseCase: LoginUseCase;
}

export interface UseLoginReturn {
  login: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useLogin({ loginUseCase }: UseLoginDependencies): UseLoginReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await loginUseCase.execute(email, password);
        router.push("/projects");
      } catch (err) {
        if (err instanceof InvalidCredentialsError || err instanceof ValidationError) {
          setError(err.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loginUseCase, router]
  );

  return { login, isLoading, error };
}

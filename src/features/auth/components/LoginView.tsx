"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PublicShell } from "@/components/public/PublicShell";
import { CardBody } from "@/components/ui/Card";
import {
  AuthCard,
  AuthShell,
  Control,
  ErrorPanel,
  Field,
  Form,
  Hero,
  MetaRow,
  PasswordInput
} from "@/features/auth/components/AuthFormPrimitives";
import { LoginError, authService, readStoredAccessToken } from "@/services/authService";
import type { LoginInput } from "@/types/domain";

const initialLogin: LoginInput = {
  emailAddress: "",
  password: ""
};

function getLoginErrorMessage(error: unknown) {
  if (!(error instanceof LoginError)) {
    return "We could not reach the server. Please try again.";
  }

  switch (error.code) {
    case "USER_NOT_FOUND":
      return "No account exists for this email address.";
    case "WRONG_PASSWORD":
      return "The password you entered is incorrect.";
    case "ROLE_NOT_ALLOWED":
      return "This account cannot log in here.";
    case "VALIDATION_ERROR":
      return error.message || "Email and password are required.";
    case "SERVER_ERROR":
      return "We could not reach the server. Please try again.";
  }
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNextPath = searchParams.get("next");
  const nextPath = requestedNextPath?.startsWith("/") ? requestedNextPath : "/dashboard";
  const [form, setForm] = useState<LoginInput>(initialLogin);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (readStoredAccessToken()) {
      router.replace(nextPath);
    }
  }, [nextPath, router]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.emailAddress.trim() || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      await authService.loginByRole(
        {
          emailAddress: form.emailAddress.trim().toLowerCase(),
          password: form.password
        },
        "player"
      );
      router.replace(nextPath);
    } catch (loginError) {
      setError(getLoginErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PublicShell>
      <AuthShell>
        <AuthCard>
          <CardBody>
            <Hero>
              <ShieldCheck size={34} />
              <span>Player Access</span>
              <h1>Login to Legacy Gaming</h1>
              <p>Use your approved player account to enter the arena.</p>
            </Hero>

            <Form onSubmit={submitLogin}>
              <Field>
                <span>Email address</span>
                <Control>
                  <Mail size={18} />
                  <input
                    autoComplete="email"
                    inputMode="email"
                    type="email"
                    value={form.emailAddress}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, emailAddress: event.target.value }));
                      setError(undefined);
                    }}
                  />
                </Control>
              </Field>

              <Field>
                <span>Password</span>
                <PasswordInput
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, password: event.target.value }));
                    setError(undefined);
                  }}
                />
              </Field>

              <MetaRow>
                <Link href="/register">Create player account</Link>
                <Link href="/forgot-password">Forgot password?</Link>
              </MetaRow>

              {error ? (
                <ErrorPanel role="alert">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </ErrorPanel>
              ) : null}

              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </Form>
          </CardBody>
        </AuthCard>
      </AuthShell>
    </PublicShell>
  );
}

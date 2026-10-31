"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { PublicShell } from "@/components/public/PublicShell";
import { Card, CardBody } from "@/components/ui/Card";
import {
  Control,
  ErrorPanel,
  Field,
  Form,
  FormHeader,
  PasswordInput,
  Spinner
} from "@/features/auth/components/AuthFormPrimitives";
import { AuthSplitLayout } from "@/features/auth/components/AuthSplitLayout";
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
  const [errorCode, setErrorCode] = useState<string>();
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
      setErrorCode("VALIDATION_ERROR");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);
    setErrorCode(undefined);

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
      setErrorCode(loginError instanceof LoginError ? loginError.code : "SERVER_ERROR");
    } finally {
      setIsSubmitting(false);
    }
  }

  const emailInvalid = errorCode === "USER_NOT_FOUND" || (errorCode === "VALIDATION_ERROR" && !form.emailAddress.trim());
  const passwordInvalid = errorCode === "WRONG_PASSWORD" || (errorCode === "VALIDATION_ERROR" && !form.password);

  function clearError() {
    setError(undefined);
    setErrorCode(undefined);
  }

  return (
    <PublicShell>
      <AuthSplitLayout
        eyebrow="Player access"
        title={
          <>
            Welcome back,
            <br />
            player.
          </>
        }
        points={[
          "Check your group standings and upcoming matches",
          "Submit results with screenshot evidence",
          "Track your path to the grand finale"
        ]}
      >
        <FormCard>
          <CardBody>
            <FormHeader>
              <span>
                <ShieldCheck size={16} aria-hidden="true" />
                Player login
              </span>
              <h1>Login to Legacy</h1>
              <p>Use your approved player account to enter the arena.</p>
            </FormHeader>

            <Form onSubmit={submitLogin} noValidate aria-busy={isSubmitting}>
              <Field htmlFor="login-email">
                <span>Email address</span>
                <Control data-invalid={emailInvalid ? "true" : undefined}>
                  <Mail size={18} aria-hidden="true" />
                  <input
                    id="login-email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    type="email"
                    placeholder="you@example.com"
                    autoFocus
                    aria-invalid={emailInvalid || undefined}
                    aria-describedby={error ? "login-error" : undefined}
                    value={form.emailAddress}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, emailAddress: event.target.value }));
                      clearError();
                    }}
                  />
                </Control>
              </Field>

              <Field as="div">
                <PasswordLabelRow>
                  <label htmlFor="login-password">Password</label>
                  <Link href="/forgot-password">Forgot password?</Link>
                </PasswordLabelRow>
                <PasswordInput
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  aria-invalid={passwordInvalid || undefined}
                  aria-describedby={error ? "login-error" : undefined}
                  value={form.password}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, password: event.target.value }));
                    clearError();
                  }}
                />
              </Field>

              {error ? (
                <ErrorPanel role="alert" id="login-error">
                  <AlertTriangle size={18} aria-hidden="true" />
                  <span>
                    {error}
                    {errorCode === "USER_NOT_FOUND" ? (
                      <>
                        {" "}
                        <Link href="/register">Create an account</Link>
                      </>
                    ) : null}
                  </span>
                </ErrorPanel>
              ) : null}

              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Logging in…
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </Button>
            </Form>

            <Divider>
              <span>New to Legacy?</span>
            </Divider>
            <SecondaryAction href="/register">Create a player account</SecondaryAction>
          </CardBody>
        </FormCard>
      </AuthSplitLayout>
    </PublicShell>
  );
}

const FormCard = styled(Card)`
  width: min(100%, 30rem);
  margin: 0 auto;
  border-color: ${({ theme }) => theme.colors.borderStrong};

  > div {
    padding: 1.5rem 1.25rem;

    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      padding: 2.25rem 2rem;
    }
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin: 2rem 0 0;
  }

  ${ErrorPanel} a {
    color: ${({ theme }) => theme.colors.gold};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const PasswordLabelRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;

  label {
    font-size: 0.9rem;
  }

  a {
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.85rem;
    font-weight: 700;
  }

  a:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0 1rem;
  color: ${({ theme }) => theme.colors.textDim};
  font-size: 0.8rem;
  font-weight: 700;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const SecondaryAction = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.9rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.surfaceGlass};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  transition: background ${({ theme }) => theme.animations.fast}, border-color ${({ theme }) => theme.animations.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.goldSoft};
    border-color: ${({ theme }) => theme.colors.gold};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gold};
    outline-offset: 3px;
  }
`;

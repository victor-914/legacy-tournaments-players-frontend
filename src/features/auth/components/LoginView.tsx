"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
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
    case "PLAYER_NOT_APPROVED":
      return "Your player account is not yet approved.";
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
    <LoginShell>
      <LoginCard>
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
              <Control>
                <LockKeyhole size={18} />
                <input
                  autoComplete="current-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, password: event.target.value }));
                    setError(undefined);
                  }}
                />
              </Control>
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
      </LoginCard>
    </LoginShell>
  );
}

const LoginShell = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
`;

const LoginCard = styled(Card)`
  width: min(100%, 30rem);
  border-color: ${({ theme }) => theme.colors.borderStrong};
`;

const Hero = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  margin-bottom: 1.4rem;
  text-align: center;

  svg,
  span {
    color: ${({ theme }) => theme.colors.gold};
  }

  span {
    font-size: 0.74rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 8vw, 3.3rem);
    line-height: 0.98;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const Field = styled.label`
  display: grid;
  gap: 0.42rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 800;
`;

const Control = styled.div`
  min-height: 3rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  padding: 0 0.9rem;

  svg {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.gold};
  }

  input {
    min-width: 0;
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.borderStrong};
    outline-offset: 1px;
  }
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.88rem;
  font-weight: 800;

  a {
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const ErrorPanel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  border: 1px solid rgba(255, 59, 48, 0.36);
  border-radius: 8px;
  background: rgba(255, 59, 48, 0.1);
  padding: 0.8rem 0.9rem;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.35;

  svg {
    flex: 0 0 auto;
    margin-top: 0.05rem;
  }
`;

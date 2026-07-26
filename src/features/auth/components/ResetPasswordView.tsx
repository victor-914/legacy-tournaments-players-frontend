"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, LockKeyhole, ShieldCheck } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PasswordResetError, authService } from "@/services/authService";

function getResetErrorMessage(error: unknown) {
  if (!(error instanceof PasswordResetError)) {
    return "We could not reach the server. Please try again.";
  }

  switch (error.code) {
    case "BAD_REQUEST":
      return "This reset link is invalid or has expired. Request a new one.";
    case "VALIDATION_ERROR":
      return error.message || "Enter a valid new password.";
    default:
      return "We could not reach the server. Please try again.";
  }
}

export function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("This reset link is invalid or has expired. Request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      await authService.resetPassword(token, password);
      setIsSubmitted(true);
    } catch (resetError) {
      setError(getResetErrorMessage(resetError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ResetShell>
      <ResetCard>
        <CardBody>
          <Hero>
            <ShieldCheck size={34} />
            <span>Account Recovery</span>
            <h1>Reset password</h1>
            <p>Choose a new password for your player account.</p>
          </Hero>

          {isSubmitted ? (
            <>
              <SuccessPanel role="status">Your password has been reset. You can now log in with your new password.</SuccessPanel>
              <Button type="button" fullWidth onClick={() => router.replace("/login")}>
                Go to login
              </Button>
            </>
          ) : (
            <Form onSubmit={submitReset}>
              <Field>
                <span>New password</span>
                <Control>
                  <LockKeyhole size={18} />
                  <input
                    autoComplete="new-password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError(undefined);
                    }}
                  />
                </Control>
              </Field>

              <Field>
                <span>Confirm new password</span>
                <Control>
                  <LockKeyhole size={18} />
                  <input
                    autoComplete="new-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError(undefined);
                    }}
                  />
                </Control>
              </Field>

              {!token ? (
                <ErrorPanel role="alert">
                  <AlertTriangle size={18} />
                  <span>This reset link is invalid or has expired. Request a new one.</span>
                </ErrorPanel>
              ) : error ? (
                <ErrorPanel role="alert">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </ErrorPanel>
              ) : null}

              <Button type="submit" fullWidth disabled={isSubmitting || !token}>
                {isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </Form>
          )}

          <MetaRow>
            <Link href="/forgot-password">Request a new link</Link>
            <Link href="/login">Back to login</Link>
          </MetaRow>
        </CardBody>
      </ResetCard>
    </ResetShell>
  );
}

const ResetShell = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
`;

const ResetCard = styled(Card)`
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
  margin-top: 1.2rem;
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

const SuccessPanel = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  padding: 0.9rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.92rem;
  line-height: 1.45;
`;

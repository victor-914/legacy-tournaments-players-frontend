"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { CardBody } from "@/components/ui/Card";
import { PublicShell } from "@/components/public/PublicShell";
import {
  AuthCard,
  AuthShell,
  ErrorPanel,
  Field,
  Form,
  Hero,
  MetaRow,
  PasswordInput,
  SuccessPanel
} from "@/features/auth/components/AuthFormPrimitives";
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
    <PublicShell>
      <AuthShell>
        <AuthCard>
          <CardBody>
            <Hero>
              <ShieldCheck size={34} />
              <span>Account Recovery</span>
              <h1>Reset password</h1>
              <p>Choose a new password for your player account.</p>
            </Hero>

            {isSubmitted ? (
              <>
                <ResetSuccessPanel role="status">Your password has been reset. You can now log in with your new password.</ResetSuccessPanel>
                <Button type="button" fullWidth onClick={() => router.replace("/login")}>
                  Go to login
                </Button>
              </>
            ) : (
              <Form onSubmit={submitReset}>
                <Field>
                  <span>New password</span>
                  <PasswordInput
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError(undefined);
                    }}
                  />
                </Field>

                <Field>
                  <span>Confirm new password</span>
                  <PasswordInput
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError(undefined);
                    }}
                  />
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

            <FooterRow>
              <Link href="/forgot-password">Request a new link</Link>
              <Link href="/login">Back to login</Link>
            </FooterRow>
          </CardBody>
        </AuthCard>
      </AuthShell>
    </PublicShell>
  );
}

const FooterRow = styled(MetaRow)`
  margin-top: 1.2rem;
`;

const ResetSuccessPanel = styled(SuccessPanel)`
  margin-bottom: 1rem;
`;

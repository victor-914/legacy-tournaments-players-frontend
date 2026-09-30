"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Mail, ShieldCheck } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { CardBody } from "@/components/ui/Card";
import { PublicShell } from "@/components/public/PublicShell";
import {
  AuthCard,
  AuthShell,
  Control,
  ErrorPanel,
  Field,
  Form,
  Hero,
  MetaRow,
  SuccessPanel
} from "@/features/auth/components/AuthFormPrimitives";
import { authService, readStoredAccessToken } from "@/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (readStoredAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Enter the email address on your player account.");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      await authService.requestPasswordReset(email.trim().toLowerCase());
      setIsSubmitted(true);
    } catch {
      setError("We could not reach the server. Please try again.");
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
              <h1>Forgot password</h1>
              <p>Enter your account email and we&apos;ll send a link to reset your password.</p>
            </Hero>

            {isSubmitted ? (
              <SuccessPanel role="status">
                If an account exists for {email.trim().toLowerCase()}, a password reset email is on its way. Check your inbox and spam folder.
              </SuccessPanel>
            ) : (
              <Form onSubmit={submitRequest}>
                <Field>
                  <span>Email address</span>
                  <Control>
                    <Mail size={18} />
                    <input
                      autoComplete="email"
                      inputMode="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError(undefined);
                      }}
                    />
                  </Control>
                </Field>

                {error ? (
                  <ErrorPanel role="alert">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                  </ErrorPanel>
                ) : null}

                <Button type="submit" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </Button>
              </Form>
            )}

            <FooterRow>
              <Link href="/login">Back to login</Link>
            </FooterRow>
          </CardBody>
        </AuthCard>
      </AuthShell>
    </PublicShell>
  );
}

const FooterRow = styled(MetaRow)`
  justify-content: center;
  margin-top: 1.2rem;
`;

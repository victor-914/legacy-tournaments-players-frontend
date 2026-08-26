"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Mail, ShieldCheck } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PublicShell } from "@/components/public/PublicShell";
import { authService } from "@/services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      <Shell>
        <Panel>
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

            <MetaRow>
              <Link href="/login">Back to login</Link>
            </MetaRow>
          </CardBody>
        </Panel>
      </Shell>
    </PublicShell>
  );
}

const Shell = styled.section`
  min-height: calc(100vh - 4.5rem);
  display: grid;
  place-items: center;
  padding: 1rem;
`;

const Panel = styled(Card)`
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
  justify-content: center;
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
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.92rem;
  line-height: 1.45;
`;

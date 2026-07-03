"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trophy, Upload } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { createPlayerAccount, submitQualificationEvidence } from "@/services/registrationService";
import type { RegisterPasswordPayload, RegisterQualificationPayload } from "@/types/domain";

const minimumXp = 1000;

const initialQualification: RegisterQualificationPayload = {
  email: "",
  gameTag: "",
  phoneNumber: "",
  discordUsername: "",
  currentXp: 1000,
  statScreenshot: null
};

const initialPassword: RegisterPasswordPayload = {
  password: "",
  confirmPassword: ""
};

export function RegisterView() {
  const router = useRouter();
  const [step, setStep] = useState<"qualification" | "password" | "success">("qualification");
  const [qualification, setQualification] = useState<RegisterQualificationPayload>(initialQualification);
  const [passwords, setPasswords] = useState<RegisterPasswordPayload>(initialPassword);
  const [screenshotPreview, setScreenshotPreview] = useState<string>();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const qualificationErrors = useMemo(() => validateQualification(qualification), [qualification]);
  const passwordErrors = useMemo(() => validatePasswords(passwords), [passwords]);

  function updateQualification<Key extends keyof RegisterQualificationPayload>(
    key: Key,
    value: RegisterQualificationPayload[Key]
  ) {
    setQualification((current) => ({ ...current, [key]: value }));
    setError(undefined);
  }

  function handleScreenshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setQualification((current) => ({
      ...current,
      statScreenshot: file,
      statScreenshotUrl: undefined,
      statScreenshotKey: undefined,
      statScreenshotFileName: undefined
    }));
    setError(undefined);
    setScreenshotPreview(file ? URL.createObjectURL(file) : undefined);
  }

  async function submitQualification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (qualificationErrors.length > 0) {
      setError(qualificationErrors[0]);
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      const evidence = await submitQualificationEvidence(qualification);
      setQualification((current) => ({
        ...current,
        statScreenshotUrl: evidence.statScreenshot.url,
        statScreenshotKey: evidence.statScreenshot.key,
        statScreenshotFileName: evidence.statScreenshot.fileName
      }));
      setStep("password");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit qualification evidence.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      await createPlayerAccount(qualification, passwords);
      setStep("success");
      window.setTimeout(() => router.push("/login"), 1400);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to create player account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "success") {
    return (
      <RegisterShell>
        <SuccessCard>
          <CheckCircle2 size={34} />
          <h1>Registration successful. Your qualification evidence has been submitted for review.</h1>
          <p>Redirecting to login...</p>
        </SuccessCard>
      </RegisterShell>
    );
  }

  return (
    <RegisterShell>
      <Hero>
        <Trophy size={32} />
        <div>
          <h1>Ready to compete for the Championship?</h1>
          <p>Submit your player details and stat screenshot to qualify for the current cycle.</p>
          <LoginLink href="/login">Already approved? Login</LoginLink>
        </div>
      </Hero>

      <IntroGrid>
        <Card>
          <CardBody>
            <Kicker>Championship Entry</Kicker>
            <h2>Qualification review</h2>
            <p>Legacy reviews submitted stats before opening account access for this cycle.</p>
          </CardBody>
        </Card>
        <RequirementCard>
          <CardBody>
            <Kicker>Requirement</Kicker>
            <h2>You need at least 1,000 XP to register for this cycle.</h2>
            <p>Upload a screenshot showing your game tag and XP.</p>
          </CardBody>
        </RequirementCard>
      </IntroGrid>

      {step === "qualification" ? (
        <FormGrid onSubmit={submitQualification}>
          <Card>
            <CardBody>
              <SectionHead>
                <Kicker>Step 1</Kicker>
                <h2>Player details</h2>
              </SectionHead>
              <FieldsGrid>
                <Field>
                  <span>Email address</span>
                  <input type="email" value={qualification.email} onChange={(event) => updateQualification("email", event.target.value)} />
                </Field>
                <Field>
                  <span>Game tag</span>
                  <input value={qualification.gameTag ?? ""} onChange={(event) => updateQualification("gameTag", event.target.value)} />
                </Field>
                <Field>
                  <span>Phone number</span>
                  <input value={qualification.phoneNumber} onChange={(event) => updateQualification("phoneNumber", event.target.value)} />
                </Field>
                <Field>
                  <span>Discord username</span>
                  <input value={qualification.discordUsername} onChange={(event) => updateQualification("discordUsername", event.target.value)} />
                </Field>
                <Field>
                  <span>Current XP</span>
                  <input
                    type="number"
                    min={0}
                    value={qualification.currentXp || ""}
                    onChange={(event) => updateQualification("currentXp", Number(event.target.value))}
                  />
                  {(qualification.currentXp ?? 0) > 0 && (qualification.currentXp ?? 0) < minimumXp ? (
                    <InlineError>You need at least 1,000 XP to qualify for this cycle.</InlineError>
                  ) : null}
                </Field>
              </FieldsGrid>
            </CardBody>
          </Card>

          <EvidenceCard>
            <CardBody>
              <SectionHead>
                <Kicker>Evidence</Kicker>
                <h2>Stat screenshot</h2>
                <p>Accepted formats: PNG, JPG, JPEG.</p>
              </SectionHead>
              <UploadLabel>
                <Upload size={24} />
                <strong>{qualification.statScreenshot?.name ?? "Upload screenshot proof"}</strong>
                <span>Upload a screenshot showing your game tag and XP.</span>
                <input type="file" accept="image/png,image/jpeg" onChange={handleScreenshot} />
              </UploadLabel>
              {screenshotPreview ? <PreviewImage src={screenshotPreview} alt="Uploaded stat screenshot preview" /> : null}
              {error ? <ErrorText>{error}</ErrorText> : null}
              <Button type="submit" disabled={isSubmitting || qualificationErrors.length > 0}>
                {isSubmitting ? "Submitting..." : "Continue to Password"}
              </Button>
            </CardBody>
          </EvidenceCard>
        </FormGrid>
      ) : (
        <PasswordCard>
          <CardBody>
            <SectionHead>
              <Kicker>Step 2</Kicker>
              <h2>Create password</h2>
              <p>Use at least 8 characters.</p>
            </SectionHead>
            <PasswordForm onSubmit={submitPassword}>
              <Field>
                <span>Password</span>
                <input
                  type="password"
                  value={passwords.password}
                  onChange={(event) => {
                    setPasswords((current) => ({ ...current, password: event.target.value }));
                    setError(undefined);
                  }}
                />
              </Field>
              <Field>
                <span>Confirm password</span>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(event) => {
                    setPasswords((current) => ({ ...current, confirmPassword: event.target.value }));
                    setError(undefined);
                  }}
                />
              </Field>
              {error ? <ErrorText>{error}</ErrorText> : null}
              <Button type="submit" disabled={isSubmitting || passwordErrors.length > 0}>
                {isSubmitting ? "Creating account..." : "Complete Registration"}
              </Button>
            </PasswordForm>
          </CardBody>
        </PasswordCard>
      )}
    </RegisterShell>
  );
}

function validateQualification(payload: RegisterQualificationPayload): string[] {
  const errors: string[] = [];

  if (!payload.email.trim()) errors.push("Email address is required.");
  if (!/^\S+@\S+\.\S+$/.test(payload.email.trim())) errors.push("Email address must be valid.");
  if (!payload.gameTag?.trim()) errors.push("Game tag is required.");
  if (!payload.phoneNumber?.trim()) errors.push("Phone number is required.");
  if ((payload.currentXp ?? 0) < minimumXp) errors.push("You need at least 1,000 XP to qualify for this cycle.");
  if (!payload.statScreenshot) errors.push("Screenshot evidence is required.");

  return errors;
}

function validatePasswords(payload: RegisterPasswordPayload): string[] {
  const errors: string[] = [];

  if (!payload.password) errors.push("Password is required.");
  if (payload.password && payload.password.length < 8) errors.push("Password should be at least 8 characters.");
  if (payload.password !== payload.confirmPassword) errors.push("Confirm password must match password.");

  return errors;
}

const RegisterShell = styled.main`
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: 1rem 1rem calc(2.5rem + env(safe-area-inset-bottom));

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem 1.5rem 3rem;
  }
`;

const Hero = styled.section`
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;
  padding: 1.25rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.goldSoft}, ${({ theme }) => theme.colors.surfaceElevated});

  svg {
    color: ${({ theme }) => theme.colors.gold};
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 8vw, 4.5rem);
    line-height: 0.98;
  }

  p {
    max-width: 44rem;
    margin: 0.8rem 0 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const LoginLink = styled(Link)`
  display: inline-flex;
  margin-top: 0.9rem;
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 900;
`;

const IntroGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.8fr);
  }

  h2,
  p {
    margin: 0.35rem 0 0;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const RequirementCard = styled(Card)`
  border-color: ${({ theme }) => theme.colors.borderStrong};
`;

const Kicker = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const FormGrid = styled.form`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 1.15fr) minmax(20rem, 0.85fr);
    align-items: start;
  }
`;

const SectionHead = styled.div`
  margin-bottom: 1rem;

  h2,
  p {
    margin: 0.3rem 0 0;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
  }
`;

const FieldsGrid = styled.div`
  display: grid;
  gap: 0.9rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Field = styled.label`
  display: grid;
  gap: 0.42rem;
  color: ${({ theme }) => theme.colors.textMuted};

  input {
    min-height: 3rem;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.surfaceGlass};
    color: ${({ theme }) => theme.colors.text};
    padding: 0 0.9rem;
  }

  input:focus {
    outline: 2px solid ${({ theme }) => theme.colors.borderStrong};
    outline-offset: 1px;
  }
`;

const EvidenceCard = styled(Card)`
  border-color: ${({ theme }) => theme.colors.borderStrong};
`;

const UploadLabel = styled.label`
  display: grid;
  place-items: center;
  gap: 0.55rem;
  min-height: 11rem;
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.goldSoft};
  color: ${({ theme }) => theme.colors.gold};
  cursor: pointer;
  text-align: center;

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.88rem;
  }

  input {
    display: none;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 16rem;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-top: 1rem;
`;

const PasswordCard = styled(Card)`
  max-width: 34rem;
  margin: 0 auto;
`;

const PasswordForm = styled.form`
  display: grid;
  gap: 1rem;
`;

const ErrorText = styled.p`
  margin: 1rem 0 0;
  color: ${({ theme }) => theme.colors.error};
`;

const InlineError = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.82rem;
`;

const SuccessCard = styled(CardBody)`
  min-height: 24rem;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  text-align: center;

  svg {
    color: ${({ theme }) => theme.colors.success};
  }

  h1 {
    max-width: 42rem;
    margin: 0;
    font-size: clamp(1.35rem, 5vw, 2.4rem);
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

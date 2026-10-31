"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Gamepad2,
  ImageUp,
  Mail,
  MessageSquare,
  Phone,
  Trophy,
  X,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PublicShell } from "@/components/public/PublicShell";
import {
  Control,
  ErrorPanel,
  FieldHint,
  FormHeader,
  PasswordInput,
  Spinner
} from "@/features/auth/components/AuthFormPrimitives";
import { AuthSplitLayout } from "@/features/auth/components/AuthSplitLayout";
import { createPlayerAccount, submitQualificationEvidence } from "@/services/registrationService";
import type { RegisterPasswordPayload, RegisterQualificationPayload } from "@/types/domain";

const minimumXp = 1000;
// Mirrors the backend presign limits (upload.controller.ts) so a bad file is
// rejected instantly instead of after a round trip.
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

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

type Step = "qualification" | "password" | "success";
type QualificationField = "email" | "gameTag" | "phoneNumber" | "currentXp" | "statScreenshot";
type QualificationErrors = Partial<Record<QualificationField, string>>;
type PasswordErrors = Partial<Record<"password" | "confirmPassword", string>>;

const STEPS: { id: Exclude<Step, "success">; label: string }[] = [
  { id: "qualification", label: "Details & evidence" },
  { id: "password", label: "Password" }
];

export function RegisterView() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("qualification");
  const [qualification, setQualification] = useState<RegisterQualificationPayload>(initialQualification);
  const [passwords, setPasswords] = useState<RegisterPasswordPayload>(initialPassword);
  const [screenshotPreview, setScreenshotPreview] = useState<string>();
  const [fileError, setFileError] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const qualificationErrors = useMemo(() => validateQualification(qualification), [qualification]);
  const passwordErrors = useMemo(() => validatePasswords(passwords), [passwords]);

  // Object URLs hold the file in memory until revoked.
  useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  function showError(field: string, message?: string) {
    return message && (attempted || touched[field]) ? message : undefined;
  }

  function markTouched(field: string) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

  function updateQualification<Key extends keyof RegisterQualificationPayload>(
    key: Key,
    value: RegisterQualificationPayload[Key]
  ) {
    setQualification((current) => ({ ...current, [key]: value }));
    setError(undefined);
  }

  function acceptFile(file: File | null) {
    setFileError(undefined);
    setError(undefined);

    if (file && !ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Use a PNG, JPG or WebP image.");
      return;
    }
    if (file && file.size > MAX_FILE_BYTES) {
      setFileError(`That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 5MB.`);
      return;
    }

    setQualification((current) => ({
      ...current,
      statScreenshot: file,
      statScreenshotUrl: undefined,
      statScreenshotKey: undefined,
      statScreenshotFileName: undefined
    }));
    setScreenshotPreview(file ? URL.createObjectURL(file) : undefined);
    markTouched("statScreenshot");
  }

  function handleScreenshot(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0] ?? null);
    // Allow re-selecting the same file after removing it.
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0] ?? null);
  }

  function focusFirstInvalid() {
    // Wait a frame so the error attributes are rendered before we look them up.
    requestAnimationFrame(() => {
      const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      invalid?.focus();
      invalid?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function submitQualification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);

    if (Object.keys(qualificationErrors).length > 0) {
      focusFirstInvalid();
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
      setAttempted(false);
      setStep("password");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit qualification evidence.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);

    if (Object.keys(passwordErrors).length > 0) {
      focusFirstInvalid();
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      await createPlayerAccount(qualification, passwords);
      setStep("success");
      window.setTimeout(() => router.push("/login"), 2200);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to create player account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const xp = qualification.currentXp ?? 0;
  const strength = passwordStrength(passwords.password);
  const confirmMatches = passwords.confirmPassword.length > 0 && passwords.confirmPassword === passwords.password;

  return (
    <PublicShell>
      <AuthSplitLayout
        wide
        eyebrow="Championship entry"
        title={
          <>
            Claim your
            <br />
            spot.
          </>
        }
        points={[
          `At least ${minimumXp.toLocaleString()} XP to qualify for this cycle`,
          "A screenshot showing your game tag and XP",
          "Our team reviews your stats, then opens your account"
        ]}
      >
        <FormCard>
          <CardBody>
            {step === "success" ? (
              <Success role="status">
                <SuccessIcon>
                  <CheckCircle2 size={34} aria-hidden="true" />
                </SuccessIcon>
                <h1>You&apos;re in the queue</h1>
                <p>
                  Registration successful. Your qualification evidence has been submitted for review. You can log in
                  once it&apos;s approved.
                </p>
                <RedirectNote>
                  <Spinner /> Taking you to login…
                </RedirectNote>
              </Success>
            ) : (
              <>
                <FormHeader>
                  <span>
                    <Trophy size={16} aria-hidden="true" />
                    Player registration
                  </span>
                  <h1>{step === "qualification" ? "Ready to compete?" : "Secure your account"}</h1>
                  <p>
                    {step === "qualification"
                      ? "Submit your player details and stat screenshot to qualify for the current cycle."
                      : "Last step. Choose a password you'll use to log in once you're approved."}
                  </p>
                </FormHeader>

                <Stepper aria-label="Registration progress">
                  {STEPS.map((item, index) => {
                    const currentIndex = STEPS.findIndex((s) => s.id === step);
                    const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "todo";
                    return (
                      <StepItem key={item.id} data-state={state} aria-current={state === "current" ? "step" : undefined}>
                        <StepDot>{state === "done" ? <Check size={14} aria-hidden="true" /> : index + 1}</StepDot>
                        <span>{item.label}</span>
                      </StepItem>
                    );
                  })}
                </Stepper>

                {step === "qualification" ? (
                  <form ref={formRef} onSubmit={submitQualification} noValidate aria-busy={isSubmitting}>
                    <FieldsGrid>
                      <TextField
                        id="reg-email"
                        label="Email address"
                        icon={Mail}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={qualification.email}
                        error={showError("email", qualificationErrors.email)}
                        onChange={(value) => updateQualification("email", value)}
                        onBlur={() => markTouched("email")}
                      />
                      <TextField
                        id="reg-gametag"
                        label="Game tag"
                        icon={Gamepad2}
                        autoComplete="nickname"
                        placeholder="Your in-game name"
                        value={qualification.gameTag ?? ""}
                        error={showError("gameTag", qualificationErrors.gameTag)}
                        onChange={(value) => updateQualification("gameTag", value)}
                        onBlur={() => markTouched("gameTag")}
                      />
                      <TextField
                        id="reg-phone"
                        label="Phone number"
                        icon={Phone}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+234 800 000 0000"
                        value={qualification.phoneNumber ?? ""}
                        error={showError("phoneNumber", qualificationErrors.phoneNumber)}
                        onChange={(value) => updateQualification("phoneNumber", value)}
                        onBlur={() => markTouched("phoneNumber")}
                      />
                      <TextField
                        id="reg-discord"
                        label="Discord username"
                        optional
                        icon={MessageSquare}
                        autoComplete="off"
                        placeholder="username"
                        value={qualification.discordUsername ?? ""}
                        onChange={(value) => updateQualification("discordUsername", value)}
                      />
                      <TextField
                        id="reg-xp"
                        label="Current XP"
                        icon={Zap}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={qualification.currentXp ? String(qualification.currentXp) : ""}
                        error={showError("currentXp", qualificationErrors.currentXp)}
                        hint={
                          xp >= minimumXp
                            ? { tone: "success", text: "Meets the 1,000 XP requirement" }
                            : { tone: "muted", text: "Minimum 1,000 XP" }
                        }
                        onChange={(value) => updateQualification("currentXp", Number(value))}
                        onBlur={() => markTouched("currentXp")}
                      />
                    </FieldsGrid>

                    <EvidenceBlock>
                      <EvidenceLabel id="reg-evidence-label">
                        Stat screenshot
                        <small>PNG, JPG or WebP · up to 5MB</small>
                      </EvidenceLabel>

                      {screenshotPreview && qualification.statScreenshot ? (
                        <PreviewCard>
                          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                          <img src={screenshotPreview} alt="Your stat screenshot" />
                          <PreviewMeta>
                            <span>
                              <CheckCircle2 size={16} aria-hidden="true" />
                              {qualification.statScreenshot.name}
                            </span>
                            <RemoveButton type="button" onClick={() => acceptFile(null)}>
                              <X size={16} aria-hidden="true" />
                              Replace
                            </RemoveButton>
                          </PreviewMeta>
                        </PreviewCard>
                      ) : (
                        <Dropzone
                          htmlFor="reg-screenshot"
                          data-dragging={isDragging || undefined}
                          data-invalid={Boolean(fileError || showError("statScreenshot", qualificationErrors.statScreenshot)) || undefined}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                        >
                          <ImageUp size={28} aria-hidden="true" />
                          <strong>Drop your screenshot here, or browse</strong>
                          <span>Make sure your game tag and XP are clearly visible.</span>
                          {/* Visually hidden rather than display:none, so it stays in the tab order. */}
                          <input
                            id="reg-screenshot"
                            type="file"
                            accept={ACCEPTED_TYPES.join(",")}
                            aria-labelledby="reg-evidence-label"
                            aria-invalid={Boolean(fileError || showError("statScreenshot", qualificationErrors.statScreenshot)) || undefined}
                            aria-describedby="reg-screenshot-error"
                            onChange={handleScreenshot}
                          />
                        </Dropzone>
                      )}
                      {fileError || showError("statScreenshot", qualificationErrors.statScreenshot) ? (
                        <FieldHint $tone="error" id="reg-screenshot-error">
                          <AlertTriangle size={14} aria-hidden="true" />
                          {fileError ?? qualificationErrors.statScreenshot}
                        </FieldHint>
                      ) : null}
                    </EvidenceBlock>

                    {error ? (
                      <ErrorPanel role="alert">
                        <AlertTriangle size={18} aria-hidden="true" />
                        <span>{error}</span>
                      </ErrorPanel>
                    ) : null}

                    <Footer>
                      <LoginPrompt>
                        Already approved? <Link href="/login">Login</Link>
                      </LoginPrompt>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Spinner />
                            Uploading evidence…
                          </>
                        ) : (
                          <>
                            Continue
                            <ArrowRight size={18} aria-hidden="true" />
                          </>
                        )}
                      </Button>
                    </Footer>
                  </form>
                ) : (
                  <PasswordForm ref={formRef} onSubmit={submitPassword} noValidate aria-busy={isSubmitting}>
                    {/* Lets password managers pair the new password with the account. */}
                    <input type="email" autoComplete="username" value={qualification.email} readOnly hidden />

                    <FieldStack>
                      <label htmlFor="reg-password">Password</label>
                      <PasswordInput
                        id="reg-password"
                        autoComplete="new-password"
                        autoFocus
                        aria-invalid={Boolean(showError("password", passwordErrors.password)) || undefined}
                        aria-describedby="reg-password-strength"
                        value={passwords.password}
                        onChange={(event) => {
                          setPasswords((current) => ({ ...current, password: event.target.value }));
                          setError(undefined);
                        }}
                        onBlur={() => markTouched("password")}
                      />
                      <Strength id="reg-password-strength" aria-live="polite">
                        <StrengthBar>
                          {[0, 1, 2, 3].map((index) => (
                            <i key={index} data-on={index < strength.score || undefined} data-level={strength.score} />
                          ))}
                        </StrengthBar>
                        <FieldHint $tone={showError("password", passwordErrors.password) ? "error" : "muted"}>
                          {showError("password", passwordErrors.password) ??
                            (passwords.password ? strength.label : "Use at least 8 characters.")}
                        </FieldHint>
                      </Strength>
                    </FieldStack>

                    <FieldStack>
                      <label htmlFor="reg-confirm">Confirm password</label>
                      <PasswordInput
                        id="reg-confirm"
                        autoComplete="new-password"
                        aria-invalid={Boolean(showError("confirmPassword", passwordErrors.confirmPassword)) || undefined}
                        aria-describedby="reg-confirm-hint"
                        value={passwords.confirmPassword}
                        onChange={(event) => {
                          setPasswords((current) => ({ ...current, confirmPassword: event.target.value }));
                          setError(undefined);
                        }}
                        onBlur={() => markTouched("confirmPassword")}
                      />
                      <span id="reg-confirm-hint">
                        {showError("confirmPassword", passwordErrors.confirmPassword) ? (
                          <FieldHint $tone="error">
                            <AlertTriangle size={14} aria-hidden="true" />
                            {passwordErrors.confirmPassword}
                          </FieldHint>
                        ) : confirmMatches ? (
                          <FieldHint $tone="success">
                            <Check size={14} aria-hidden="true" />
                            Passwords match
                          </FieldHint>
                        ) : null}
                      </span>
                    </FieldStack>

                    {error ? (
                      <ErrorPanel role="alert">
                        <AlertTriangle size={18} aria-hidden="true" />
                        <span>{error}</span>
                      </ErrorPanel>
                    ) : null}

                    <Footer>
                      <BackButton
                        type="button"
                        onClick={() => {
                          setAttempted(false);
                          setError(undefined);
                          setStep("qualification");
                        }}
                        disabled={isSubmitting}
                      >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Back
                      </BackButton>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Spinner />
                            Creating account…
                          </>
                        ) : (
                          <>
                            Complete registration
                            <ArrowRight size={18} aria-hidden="true" />
                          </>
                        )}
                      </Button>
                    </Footer>
                  </PasswordForm>
                )}
              </>
            )}
          </CardBody>
        </FormCard>
      </AuthSplitLayout>
    </PublicShell>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: { tone: "muted" | "success"; text: string };
  optional?: boolean;
  type?: string;
  inputMode?: "email" | "tel" | "numeric" | "text";
  autoComplete?: string;
  placeholder?: string;
  min?: number;
}

function TextField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  hint,
  optional,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  min
}: TextFieldProps) {
  const describedBy = error || hint ? `${id}-msg` : undefined;
  return (
    <FieldStack>
      <label htmlFor={id}>
        {label}
        {optional ? <small> (optional)</small> : null}
      </label>
      <Control data-invalid={error ? "true" : undefined}>
        <Icon size={18} aria-hidden="true" />
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          min={min}
          value={value}
          required={!optional}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      </Control>
      {error ? (
        <FieldHint $tone="error" id={describedBy}>
          <AlertTriangle size={14} aria-hidden="true" />
          {error}
        </FieldHint>
      ) : hint ? (
        <FieldHint $tone={hint.tone} id={describedBy}>
          {hint.tone === "success" ? <Check size={14} aria-hidden="true" /> : null}
          {hint.text}
        </FieldHint>
      ) : null}
    </FieldStack>
  );
}

function validateQualification(payload: RegisterQualificationPayload): QualificationErrors {
  const errors: QualificationErrors = {};
  const email = payload.email.trim();

  if (!email) errors.email = "Email address is required.";
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
  if (!payload.gameTag?.trim()) errors.gameTag = "Game tag is required.";
  if (!payload.phoneNumber?.trim()) errors.phoneNumber = "Phone number is required.";
  if ((payload.currentXp ?? 0) < minimumXp) errors.currentXp = "You need at least 1,000 XP to qualify for this cycle.";
  if (!payload.statScreenshot) errors.statScreenshot = "Screenshot evidence is required.";

  return errors;
}

function validatePasswords(payload: RegisterPasswordPayload): PasswordErrors {
  const errors: PasswordErrors = {};

  if (!payload.password) errors.password = "Password is required.";
  else if (payload.password.length < 8) errors.password = "Password should be at least 8 characters.";
  if (payload.password !== payload.confirmPassword) errors.confirmPassword = "Passwords don't match.";

  return errors;
}

// Lightweight heuristic for feedback only; the backend owns the real rules.
function passwordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length < 8) return { score: 1, label: `Too short: ${8 - password.length} more character${password.length === 7 ? "" : "s"}` };
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  return { score: Math.max(1, score), label: `${labels[score]} password` };
}

const FormCard = styled(Card)`
  border-color: ${({ theme }) => theme.colors.borderStrong};

  > div {
    padding: 1.5rem 1.25rem;

    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      padding: 2.25rem 2rem;
    }
  }

  ${ErrorPanel} {
    margin-top: 1.25rem;
  }
`;

const Stepper = styled.ol`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 0 0 1.75rem;
  padding: 0;
  list-style: none;
`;

const StepItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: 0.75rem;
  border-top: 3px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textDim};
  font-size: 0.85rem;
  font-weight: 700;
  transition: border-color ${({ theme }) => theme.animations.normal}, color ${({ theme }) => theme.animations.normal};

  &[data-state="current"],
  &[data-state="done"] {
    border-top-color: ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const StepDot = styled.span`
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 1px solid currentColor;
  font-size: 0.75rem;
  font-weight: 900;

  li[data-state="current"] > & {
    border-color: ${({ theme }) => theme.colors.gold};
    color: ${({ theme }) => theme.colors.gold};
  }

  li[data-state="done"] > & {
    border-color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.gold};
    color: #090909;
  }
`;

const FieldsGrid = styled.div`
  display: grid;
  gap: 1.1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FieldStack = styled.div`
  display: grid;
  gap: 0.42rem;
  align-content: start;

  > label {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
    font-weight: 800;
  }

  > label small {
    color: ${({ theme }) => theme.colors.textDim};
    font-weight: 600;
  }

  /* Hide the native number spinner; it is a poor touch target. */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

const EvidenceBlock = styled.div`
  display: grid;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const EvidenceLabel = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
  font-weight: 800;

  small {
    color: ${({ theme }) => theme.colors.textDim};
    font-size: 0.8rem;
    font-weight: 600;
  }
`;

const Dropzone = styled.label`
  position: relative;
  display: grid;
  place-items: center;
  gap: 0.45rem;
  min-height: 10rem;
  padding: 1.5rem 1rem;
  border: 1.5px dashed ${({ theme }) => theme.colors.borderStrong};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.goldSoft};
  color: ${({ theme }) => theme.colors.gold};
  cursor: pointer;
  text-align: center;
  transition: background ${({ theme }) => theme.animations.fast}, border-color ${({ theme }) => theme.animations.fast};

  strong {
    color: ${({ theme }) => theme.colors.text};
  }

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.86rem;
  }

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  &:hover,
  &[data-dragging="true"] {
    border-color: ${({ theme }) => theme.colors.gold};
    background: rgba(212, 175, 55, 0.24);
  }

  &:focus-within {
    outline: 3px solid ${({ theme }) => theme.colors.goldSoft};
    border-color: ${({ theme }) => theme.colors.gold};
  }

  &[data-invalid="true"] {
    border-color: rgba(255, 59, 48, 0.6);
    background: rgba(255, 59, 48, 0.08);
  }
`;

const PreviewCard = styled.div`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};

  img {
    display: block;
    width: 100%;
    max-height: 15rem;
    object-fit: cover;
  }
`;

const PreviewMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.86rem;
    font-weight: 700;
  }

  span svg {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.success};
  }
`;

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex: 0 0 auto;
  min-height: 2.25rem;
  padding: 0 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gold};
    outline-offset: 2px;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 1rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  > button[type="submit"] {
    width: 100%;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    > button[type="submit"] {
      width: auto;
      min-width: 12rem;
    }
  }
`;

const LoginPrompt = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.gold};
    font-weight: 800;
  }

  a:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const PasswordForm = styled.form`
  display: grid;
  gap: 1.25rem;
  max-width: 30rem;

  ${Footer} {
    margin-top: 0.5rem;
  }
`;

const Strength = styled.div`
  display: grid;
  gap: 0.4rem;
`;

const StrengthBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.3rem;

  i {
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    transition: background ${({ theme }) => theme.animations.normal};
  }

  i[data-on="true"][data-level="1"] {
    background: ${({ theme }) => theme.colors.error};
  }

  i[data-on="true"][data-level="2"] {
    background: ${({ theme }) => theme.colors.warning};
  }

  i[data-on="true"][data-level="3"],
  i[data-on="true"][data-level="4"] {
    background: ${({ theme }) => theme.colors.success};
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  padding: 0 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 800;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gold};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Success = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.85rem;
  padding: 2rem 0.5rem;
  text-align: center;

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: clamp(2rem, 6vw, 2.8rem);
    line-height: 1;
    text-transform: uppercase;
  }

  p {
    max-width: 28rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.55;
  }
`;

const SuccessIcon = styled.span`
  display: grid;
  place-items: center;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background: rgba(0, 200, 83, 0.12);
  color: ${({ theme }) => theme.colors.success};
  box-shadow: ${({ theme }) => theme.shadows.glowGreen};
`;

const RedirectNote = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.textDim};
  font-size: 0.85rem;
`;

"use client";

import { InputHTMLAttributes, KeyboardEvent, useState } from "react";
import { AlertTriangle, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import styled, { keyframes } from "styled-components";
import { Card } from "@/components/ui/Card";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ onKeyUp, onBlur, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLockOn(event.getModifierState?.("CapsLock") ?? false);
    onKeyUp?.(event);
  }

  return (
    <>
      <Control data-invalid={props["aria-invalid"] ? "true" : undefined}>
        <LockKeyhole size={18} aria-hidden="true" />
        <input
          {...props}
          type={isVisible ? "text" : "password"}
          onKeyUp={handleKeyUp}
          onBlur={(event) => {
            setCapsLockOn(false);
            onBlur?.(event);
          }}
        />
        <VisibilityToggle
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </VisibilityToggle>
      </Control>
      {capsLockOn ? (
        <FieldHint $tone="warning" role="status">
          <AlertTriangle size={14} aria-hidden="true" />
          Caps Lock is on
        </FieldHint>
      ) : null}
    </>
  );
}

export function Spinner() {
  return <SpinIcon size={18} aria-hidden="true" />;
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const SpinIcon = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
`;

export const AuthShell = styled.section`
  min-height: calc(100vh - 4.5rem);
  display: grid;
  place-items: center;
  padding: 1rem;
`;

export const AuthCard = styled(Card)`
  width: min(100%, 30rem);
  border-color: ${({ theme }) => theme.colors.borderStrong};
`;

export const Hero = styled.div`
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

export const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

export const Field = styled.label`
  display: grid;
  gap: 0.42rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 800;

  > span:first-child {
    font-size: 0.9rem;
  }
`;

export const Control = styled.div`
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

  transition: border-color ${({ theme }) => theme.animations.fast}, background ${({ theme }) => theme.animations.fast};

  input::placeholder {
    color: ${({ theme }) => theme.colors.textDim};
  }

  /* Browser autofill paints a light background over the dark control. */
  input:-webkit-autofill {
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text};
    -webkit-box-shadow: 0 0 0 1000px #1b1b1b inset;
    caret-color: ${({ theme }) => theme.colors.text};
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.gold};
    background: rgba(255, 255, 255, 0.08);
    outline: 3px solid ${({ theme }) => theme.colors.goldSoft};
    outline-offset: 0;
  }

  &[data-invalid="true"] {
    border-color: rgba(255, 59, 48, 0.6);
  }

  &[data-invalid="true"] svg:first-child {
    color: ${({ theme }) => theme.colors.error};
  }
`;

export const FieldHint = styled.span<{ $tone?: "error" | "warning" | "muted" | "success" }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.35;
  color: ${({ theme, $tone = "muted" }) =>
    $tone === "error"
      ? theme.colors.error
      : $tone === "warning"
        ? theme.colors.warning
        : $tone === "success"
          ? theme.colors.success
          : theme.colors.textDim};
`;

export const FormHeader = styled.header`
  display: grid;
  gap: 0.45rem;
  margin-bottom: 1.5rem;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.displayFontFamily};
    font-weight: 400;
    font-size: clamp(2.1rem, 7vw, 3rem);
    line-height: 0.98;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.5;
  }
`;

const VisibilityToggle = styled.button`
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  padding: 0.35rem;
  margin-right: -0.35rem;
  cursor: pointer;

  svg {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:hover svg,
  &:focus-visible svg {
    color: ${({ theme }) => theme.colors.gold};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.borderStrong};
  }
`;

export const MetaRow = styled.div`
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

export const ErrorPanel = styled.div`
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

export const SuccessPanel = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  padding: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.92rem;
  line-height: 1.45;
`;

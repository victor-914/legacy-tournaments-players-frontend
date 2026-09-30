"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import styled from "styled-components";
import { Card } from "@/components/ui/Card";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Control>
      <LockKeyhole size={18} />
      <input {...props} type={isVisible ? "text" : "password"} />
      <VisibilityToggle
        type="button"
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </VisibilityToggle>
    </Control>
  );
}

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

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.borderStrong};
    outline-offset: 1px;
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

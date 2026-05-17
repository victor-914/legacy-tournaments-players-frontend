"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import styled, { css } from "styled-components";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  fullWidth?: boolean;
}

export function Button({ children, variant = "primary", fullWidth = false, ...props }: ButtonProps) {
  return (
    <StyledButton
      $variant={variant}
      $fullWidth={fullWidth}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </StyledButton>
  );
}

const StyledButton = styled(motion.button)<{ $variant: NonNullable<ButtonProps["variant"]>; $fullWidth: boolean }>`
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 0.85rem 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 800;
  letter-spacing: 0;
  transition: ${({ theme }) => theme.animations.normal};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${({ $variant, theme }) =>
    $variant === "primary" &&
    css`
      background: linear-gradient(135deg, ${theme.colors.gold}, #8d6d16);
      color: #090909;
      box-shadow: ${theme.shadows.glowGold};
    `}

  ${({ $variant, theme }) =>
    $variant === "secondary" &&
    css`
      background: ${theme.colors.surfaceGlass};
      border-color: ${theme.colors.borderStrong};
    `}

  ${({ $variant, theme }) =>
    $variant === "danger" &&
    css`
      background: rgba(255, 59, 48, 0.16);
      border-color: rgba(255, 59, 48, 0.5);
      color: ${theme.colors.error};
    `}

  ${({ $variant, theme }) =>
    $variant === "ghost" &&
    css`
      background: transparent;
      border-color: ${theme.colors.border};
    `}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
  }
`;

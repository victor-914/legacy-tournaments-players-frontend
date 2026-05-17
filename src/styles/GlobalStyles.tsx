"use client";

import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    background: ${({ theme }) => theme.colors.background};
    color-scheme: dark;
  }

  body {
    margin: 0;
    min-height: 100vh;
    color: ${({ theme }) => theme.colors.text};
    background:
      radial-gradient(circle at 18% 12%, rgba(212, 175, 55, 0.13), transparent 34%),
      radial-gradient(circle at 85% 18%, rgba(58, 134, 255, 0.11), transparent 32%),
      linear-gradient(135deg, #080808 0%, #101010 44%, #070707 100%);
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-weight: ${({ theme }) => theme.typography.bodyWeight};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button, input, textarea, select {
    font: inherit;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.goldSoft};
    color: ${({ theme }) => theme.colors.text};
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borderStrong};
    border-radius: 999px;
  }
`;

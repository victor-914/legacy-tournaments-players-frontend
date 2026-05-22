"use client";

import Link from "next/link";
import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  return (
    <Shell>
      <Panel>
        <CardBody>
          <Kicker>Account Recovery</Kicker>
          <h1>Forgot password</h1>
          <p>Password recovery is not available yet. Contact tournament support to reset your player account password.</p>
          <Link href="/login">Back to login</Link>
        </CardBody>
      </Panel>
    </Shell>
  );
}

const Shell = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
`;

const Panel = styled(Card)`
  width: min(100%, 32rem);
  border-color: ${({ theme }) => theme.colors.borderStrong};

  h1 {
    margin: 0.45rem 0;
    font-size: clamp(2rem, 8vw, 3.3rem);
    line-height: 0.98;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  a {
    color: ${({ theme }) => theme.colors.gold};
    font-weight: 900;
  }
`;

const Kicker = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
`;

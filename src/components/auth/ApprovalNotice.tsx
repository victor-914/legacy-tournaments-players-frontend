"use client";

import styled from "styled-components";
import { Card, CardBody } from "@/components/ui/Card";

export function ApprovalNotice({ title = "Pending Approval" }: { title?: string }) {
  return (
    <Panel>
      <CardBody>
        <h2>{title}</h2>
        <p>Your account is waiting for admin approval. Tournament actions will be available after approval.</p>
      </CardBody>
    </Panel>
  );
}

const Panel = styled(Card)`
  width: min(100%, 42rem);

  h2 {
    margin: 0;
  }

  p {
    margin: 0.6rem 0 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

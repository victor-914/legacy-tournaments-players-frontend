"use client";

import { Bell, Gamepad2, Globe2, Lock, Shield, UserRound } from "lucide-react";
import styled from "styled-components";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Grid, PageStack, SectionTitle } from "@/components/ui/PagePrimitives";

const sections = [
  { title: "Account", icon: UserRound, fields: ["Gamer tag", "Email", "Password"] },
  { title: "Notifications", icon: Bell, fields: ["Match ready", "Qualification alerts", "Dispute updates"] },
  { title: "Privacy", icon: Lock, fields: ["Profile visibility", "Match history", "Leaderboard display"] },
  { title: "Match Preferences", icon: Gamepad2, fields: ["Preferred mode", "Input type", "Ready check"] },
  { title: "Connected Accounts", icon: Shield, fields: ["Epic", "PlayStation", "Xbox"] },
  { title: "Region Settings", icon: Globe2, fields: ["Region", "Timezone", "Latency guard"] }
];

export function SettingsView() {
  return (
    <PageStack>
      <SectionTitle>
        <div>
          <h2>Settings</h2>
          <p>Player controls for account, match, notification, and region behavior.</p>
        </div>
      </SectionTitle>
      <Grid $columns={2}>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardBody>
                <SectionHeader>
                  <Icon size={22} />
                  <h3>{section.title}</h3>
                  <Badge label="Active" tone="gold" />
                </SectionHeader>
                <Fields>
                  {section.fields.map((field) => (
                    <label key={field}>
                      <span>{field}</span>
                      <input defaultValue={field.includes("alert") ? "Enabled" : ""} placeholder={field} />
                    </label>
                  ))}
                </Fields>
                <Button variant="secondary">Save {section.title}</Button>
              </CardBody>
            </Card>
          );
        })}
      </Grid>
    </PageStack>
  );
}

const SectionHeader = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

  svg {
    color: ${({ theme }) => theme.colors.gold};
  }

  h3 {
    margin: 0;
  }
`;

const Fields = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;

  label {
    display: grid;
    gap: 0.35rem;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.82rem;
  }

  input {
    min-height: 2.8rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: rgba(255, 255, 255, 0.06);
    color: ${({ theme }) => theme.colors.text};
    padding: 0 0.8rem;
  }
`;

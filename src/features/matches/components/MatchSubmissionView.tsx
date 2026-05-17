"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { z } from "zod";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/PageLoader";
import { Grid, PageStack, SectionTitle } from "@/components/ui/PagePrimitives";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { UploadDropzone } from "@/components/ui/UploadDropzone";
import { mockApi } from "@/services/mockApi";

const submissionSchema = z.object({
  playerScore: z.coerce.number().int().min(0).max(99),
  opponentScore: z.coerce.number().int().min(0).max(99),
  screenshot: z
    .custom<File>((value): value is File => typeof File !== "undefined" && value instanceof File, "Screenshot is required")
    .refine((file) => file.size <= 5 * 1024 * 1024, "Screenshot must be under 5MB")
    .refine((file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type), "Screenshot must be an image")
});

type SubmissionForm = z.infer<typeof submissionSchema>;
type SubmissionState = "form" | "waiting" | "verifying" | "confirmed" | "dispute";

export function MatchSubmissionView() {
  const [state, setState] = useState<SubmissionState>("form");
  const [fileName, setFileName] = useState<string>();
  const { data, isLoading } = useQuery({ queryKey: ["match"], queryFn: mockApi.getMatch });
  const { register, handleSubmit, setValue, formState } = useForm<SubmissionForm>({
    resolver: zodResolver(submissionSchema)
  });

  if (isLoading || !data) {
    return <PageLoader label="Loading match" />;
  }

  function submit(values: SubmissionForm) {
    setState("waiting");
    window.setTimeout(() => setState("verifying"), 800);
    window.setTimeout(() => setState(values.playerScore === values.opponentScore ? "dispute" : "confirmed"), 1700);
  }

  return (
    <PageStack>
      <Header>
        <CardBody>
          <Badge label={data.groupName} tone="gold" />
          <h1>{data.tournamentName}</h1>
          <p>Match ID {data.id} / external match result submission</p>
        </CardBody>
      </Header>

      <Grid $columns={2}>
        <PlayerCard player={data.opponent} rankLabel="Opponent" />
        <Card>
          <CardBody>
            <SectionTitle>
              <div>
                <h2>Match Timer</h2>
                <p>Submit proof after your match concludes.</p>
              </div>
            </SectionTitle>
            <Timer>24:18</Timer>
            <Badge label="Group Stage" tone="blue" />
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardBody>
          <SectionTitle>
            <div>
              <h2>Result Submission</h2>
              <p>Scores are verified against opponent submission. XP is calculated automatically.</p>
            </div>
          </SectionTitle>
          <Form onSubmit={handleSubmit(submit)}>
            <Field>
              <span>Your Score</span>
              <input type="number" min={0} max={99} {...register("playerScore")} />
            </Field>
            <Field>
              <span>Opponent Score</span>
              <input type="number" min={0} max={99} {...register("opponentScore")} />
            </Field>
            <UploadDropzone
              fileName={fileName}
              onChange={(file) => {
                if (file) {
                  setFileName(file.name);
                  setValue("screenshot", file, { shouldValidate: true });
                }
              }}
            />
            <Button type="submit" disabled={state !== "form"}>Submit Result</Button>
            {formState.errors.screenshot ? <ErrorText>{formState.errors.screenshot.message}</ErrorText> : null}
          </Form>
        </CardBody>
      </Card>

      {state !== "form" ? (
        <StateCard $danger={state === "dispute"}>
          <CardBody>
            {state === "dispute" ? <AlertTriangle /> : <CheckCircle2 />}
            <h2>{state === "waiting" ? "Waiting for opponent" : state === "verifying" ? "Verifying result" : state === "confirmed" ? "Match confirmed" : "Dispute detected"}</h2>
            <p>{state === "confirmed" ? "XP earned and leaderboard update queued." : state === "dispute" ? "Score mismatch under review. Admin pending." : "Hold position while verification completes."}</p>
          </CardBody>
        </StateCard>
      ) : null}
    </PageStack>
  );
}

const Header = styled(Card)`
  h1 {
    margin: 0.8rem 0 0.35rem;
    font-size: clamp(2rem, 7vw, 4rem);
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Timer = styled.div`
  color: ${({ theme }) => theme.colors.gold};
  font-size: 3rem;
  font-weight: 900;
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const Field = styled.label`
  display: grid;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.textMuted};

  input {
    min-height: 3rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: rgba(255, 255, 255, 0.06);
    color: ${({ theme }) => theme.colors.text};
    padding: 0 0.9rem;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
`;

const StateCard = styled(Card)<{ $danger: boolean }>`
  border-color: ${({ $danger, theme }) => ($danger ? "rgba(255, 59, 48, 0.6)" : theme.colors.borderStrong)};

  svg {
    color: ${({ $danger, theme }) => ($danger ? theme.colors.error : theme.colors.success)};
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

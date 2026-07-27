"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { playerService } from "@/services/playerService";
import type { PlayerMeDashboard, UpdateProfilePayload } from "@/types/domain";

interface ProfileEditFormProps {
  data: PlayerMeDashboard;
  onClose: () => void;
}

function getInitialValues(data: PlayerMeDashboard): Required<UpdateProfilePayload> {
  return {
    fullname: data.user?.fullName ?? data.user?.fullname ?? "",
    gameTag: data.player?.gameTag ?? data.user?.gameTag ?? "",
    phoneNumber: data.user?.phoneNumber ?? "",
    discordUsername: data.user?.discordUsername ?? "",
    telegramUsername: data.user?.telegramUsername ?? ""
  };
}

export function ProfileEditForm({ data, onClose }: ProfileEditFormProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Required<UpdateProfilePayload>>(() => getInitialValues(data));
  const [error, setError] = useState<string>();

  const mutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => playerService.updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["players-me"], updated);
      onClose();
    },
    onError: (mutationError: unknown) => {
      if (axios.isAxiosError(mutationError)) {
        setError(mutationError.response?.data?.message ?? "Unable to update profile.");
        return;
      }
      setError("Unable to update profile.");
    }
  });

  function updateField<Key extends keyof UpdateProfilePayload>(key: Key, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setError(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.fullname.trim() || !values.gameTag.trim()) {
      setError("Full name and game tag are required.");
      return;
    }

    setError(undefined);
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardBody>
        <h2>Edit Profile</h2>
        <Form onSubmit={handleSubmit}>
          <Field>
            <span>Full Name</span>
            <input value={values.fullname} onChange={(event) => updateField("fullname", event.target.value)} />
          </Field>
          <Field>
            <span>Game Tag</span>
            <input value={values.gameTag} onChange={(event) => updateField("gameTag", event.target.value)} />
          </Field>
          <Field>
            <span>Phone Number</span>
            <input value={values.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} />
          </Field>
          <Field>
            <span>Discord Username</span>
            <input value={values.discordUsername} onChange={(event) => updateField("discordUsername", event.target.value)} />
          </Field>
          <Field>
            <span>Telegram Username</span>
            <input value={values.telegramUsername} onChange={(event) => updateField("telegramUsername", event.target.value)} />
          </Field>
          {error ? <ErrorText>{error}</ErrorText> : null}
          <Actions>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
          </Actions>
        </Form>
      </CardBody>
    </Card>
  );
}

const Form = styled.form`
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Field = styled.label`
  display: grid;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.82rem;

  input {
    min-height: 2.8rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: rgba(255, 255, 255, 0.06);
    color: ${({ theme }) => theme.colors.text};
    padding: 0 0.8rem;
  }
`;

const ErrorText = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
`;

const Actions = styled.div`
  grid-column: 1 / -1;
  display: flex;
  gap: 0.75rem;
`;

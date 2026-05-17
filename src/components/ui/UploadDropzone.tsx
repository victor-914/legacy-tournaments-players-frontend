"use client";

import { Upload } from "lucide-react";
import styled from "styled-components";

interface UploadDropzoneProps {
  fileName?: string;
  onChange: (file: File | null) => void;
}

export function UploadDropzone({ fileName, onChange }: UploadDropzoneProps) {
  return (
    <Label>
      <Upload size={22} />
      <span>{fileName ?? "Upload screenshot proof"}</span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </Label>
  );
}

const Label = styled.label`
  display: grid;
  place-items: center;
  gap: 0.7rem;
  min-height: 9rem;
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.goldSoft};
  color: ${({ theme }) => theme.colors.gold};
  cursor: pointer;
  text-align: center;

  input {
    display: none;
  }
`;

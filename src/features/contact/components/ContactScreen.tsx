"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, MapPin, MessageCircle } from "lucide-react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PublicShell } from "@/components/public/PublicShell";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialForm: ContactForm = { name: "", email: "", subject: "", message: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: ContactForm) {
  if (!form.name.trim()) return "Please enter your name.";
  if (!EMAIL_PATTERN.test(form.email.trim())) return "Please enter a valid email address.";
  if (!form.subject.trim()) return "Please enter a subject.";
  if (form.message.trim().length < 10) return "Message must be at least 10 characters.";
  return undefined;
}

const CONTACT_CARDS = [
  { icon: Mail, label: "Email", value: "hello@legacyesports.gg" },
  { icon: MessageCircle, label: "Discord Community", value: "discord.gg/legacyesports" },
  { icon: MapPin, label: "HQ", value: "Remote-first · events run globally" }
];

export function ContactScreen() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function updateField<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(undefined);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    await new Promise((resolve) => setTimeout(resolve, 700));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setForm(initialForm);
  }

  return (
    <PublicShell>
      <Wrap>
        <Hero
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Kicker>Contact</Kicker>
          <Headline>Get in touch</Headline>
          <Subcopy>Questions about a tournament, a partnership, or joining the team? Send us a message.</Subcopy>
        </Hero>

        <Grid>
          <FormCard
            as={motion.article}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <CardBody>
              {isSubmitted ? (
                <SuccessPanel>
                  <CheckCircle2 size={34} />
                  <h2>Message sent.</h2>
                  <p>Thanks for reaching out — we typically reply within 1-2 business days.</p>
                  <Button variant="secondary" type="button" onClick={() => setIsSubmitted(false)}>
                    Send another message
                  </Button>
                </SuccessPanel>
              ) : (
                <Form onSubmit={submitForm}>
                  <Field>
                    <span>Name</span>
                    <Control>
                      <input
                        autoComplete="name"
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                      />
                    </Control>
                  </Field>

                  <Field>
                    <span>Email</span>
                    <Control>
                      <input
                        autoComplete="email"
                        inputMode="email"
                        type="email"
                        value={form.email}
                        onChange={(event) => updateField("email", event.target.value)}
                      />
                    </Control>
                  </Field>

                  <Field>
                    <span>Subject</span>
                    <Control>
                      <input value={form.subject} onChange={(event) => updateField("subject", event.target.value)} />
                    </Control>
                  </Field>

                  <Field>
                    <span>Message</span>
                    <TextAreaControl>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={(event) => updateField("message", event.target.value)}
                      />
                    </TextAreaControl>
                  </Field>

                  {error ? <ErrorPanel role="alert">{error}</ErrorPanel> : null}

                  <Button type="submit" fullWidth disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </Form>
              )}
            </CardBody>
          </FormCard>

          <InfoColumn
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {CONTACT_CARDS.map(({ icon: Icon, label, value }) => (
              <InfoCard key={label}>
                <IconMark>
                  <Icon size={20} />
                </IconMark>
                <div>
                  <strong>{label}</strong>
                  <span>{value}</span>
                </div>
              </InfoCard>
            ))}
          </InfoColumn>
        </Grid>
      </Wrap>
    </PublicShell>
  );
}

const Wrap = styled.div`
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 3rem 1.25rem 4.5rem;
  display: grid;
  gap: 2rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 4.5rem 1.5rem 6rem;
    gap: 2.5rem;
  }
`;

const Hero = styled(motion.div)`
  display: grid;
  gap: 0.6rem;
  max-width: 34rem;
`;

const Kicker = styled.p`
  margin: 0;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
`;

const Headline = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 2.7rem);
`;

const Subcopy = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Grid = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1.4fr 1fr;
    align-items: start;
  }
`;

const FormCard = styled(Card)`
  border-color: ${({ theme }) => theme.colors.borderStrong};
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const Field = styled.label`
  display: grid;
  gap: 0.42rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 800;
  font-size: 0.88rem;
`;

const Control = styled.div`
  min-height: 3rem;
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surfaceGlass};
  padding: 0 0.9rem;

  input {
    min-width: 0;
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.borderStrong};
    outline-offset: 1px;
  }
`;

const TextAreaControl = styled(Control)`
  min-height: unset;
  padding: 0.75rem 0.9rem;
  align-items: stretch;

  textarea {
    width: 100%;
    border: 0;
    outline: 0;
    resize: vertical;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    font-family: inherit;
    font-size: 0.95rem;
  }
`;

const ErrorPanel = styled.div`
  border: 1px solid rgba(255, 59, 48, 0.36);
  border-radius: 8px;
  background: rgba(255, 59, 48, 0.1);
  padding: 0.8rem 0.9rem;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.88rem;
  font-weight: 700;
`;

const SuccessPanel = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  text-align: center;
  padding: 1.5rem 0.5rem;

  svg {
    color: ${({ theme }) => theme.colors.success};
  }

  h2 {
    margin: 0;
    font-size: 1.3rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const InfoColumn = styled(motion.div)`
  display: grid;
  gap: 1rem;
  align-content: start;
`;

const InfoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1.15rem 1.25rem;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.neumorphicRaised};

  strong {
    display: block;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textDim};
  }

  span {
    font-size: 0.95rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const IconMark = styled.div`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.gold};
  background: ${({ theme }) => theme.colors.goldSoft};
  box-shadow: ${({ theme }) => theme.shadows.neumorphicInset};
`;

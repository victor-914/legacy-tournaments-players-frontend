import type { Metadata } from "next";
import { ContactScreen } from "@/features/contact/components/ContactScreen";

export const metadata: Metadata = {
  title: "Contact | Legacy Esports",
  description: "Get in touch with the Legacy Esports team."
};

export default function ContactPage() {
  return <ContactScreen />;
}

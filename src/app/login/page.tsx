import { Suspense } from "react";
import { PageLoader } from "@/components/ui/PageLoader";
import { LoginView } from "@/features/auth/components/LoginView";

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading login" />}>
      <LoginView />
    </Suspense>
  );
}

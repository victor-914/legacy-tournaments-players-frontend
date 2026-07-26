import { Suspense } from "react";
import { PageLoader } from "@/components/ui/PageLoader";
import { ResetPasswordView } from "@/features/auth/components/ResetPasswordView";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading password reset" />}>
      <ResetPasswordView />
    </Suspense>
  );
}

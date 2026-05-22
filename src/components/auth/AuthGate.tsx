"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/PageLoader";
import { readStoredAccessToken } from "@/services/authService";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = readStoredAccessToken();

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsAuthenticated(true);
  }, [pathname, router]);

  if (!isAuthenticated) {
    return <PageLoader label="Checking player session" />;
  }

  return children;
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/common/Button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={logout} disabled={loading}>
      <LogOut className="size-4" />
      {loading ? "در حال خروج…" : "خروج از حساب"}
    </Button>
  );
}

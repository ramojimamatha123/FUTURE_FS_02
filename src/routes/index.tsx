import { createFileRoute, redirect } from "@tanstack/react-router";
import { getState } from "@/lib/store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const s = getState();
    if (s.currentUserId) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/signin" });
  },
});

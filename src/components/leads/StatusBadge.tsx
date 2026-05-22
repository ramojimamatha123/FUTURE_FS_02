import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const map: Record<LeadStatus, string> = {
  New: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
  Contacted: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
  Interested: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
  Converted: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
  Closed: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant="outline" className={cn("font-medium", map[status])}>{status}</Badge>;
}
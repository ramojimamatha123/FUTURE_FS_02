import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { StatusBadge } from "@/components/leads/StatusBadge";
import { CalendarClock } from "lucide-react";

export const Route = createFileRoute("/_app/followups")({
  component: Followups,
});

function Followups() {
  const leads = useStore((s) => s.leads);
  const employees = useStore((s) => s.employees);
  const today = new Date(new Date().toDateString());
  const upcoming = leads
    .filter((l) => l.followUpDate)
    .sort((a, b) => +new Date(a.followUpDate) - +new Date(b.followUpDate));
  const overdue = upcoming.filter((l) => new Date(l.followUpDate) < today);
  const future = upcoming.filter((l) => new Date(l.followUpDate) >= today);

  const Section = ({ title, list, tone }: { title: string; list: typeof leads; tone: string }) => (
    <Card className="p-5 border-0 shadow-sm">
      <div className={`font-semibold mb-4 ${tone}`}>{title} ({list.length})</div>
      <div className="space-y-2">
        {list.length === 0 && <div className="text-sm text-muted-foreground">Nothing here</div>}
        {list.map((l) => (
          <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition">
            <div className="flex items-center gap-3 min-w-0">
              <CalendarClock className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate">{l.clientName} <span className="text-xs text-muted-foreground">· {l.company}</span></div>
                <div className="text-xs text-muted-foreground truncate">
                  {new Date(l.followUpDate).toLocaleDateString()} · {employees.find((e) => e.id === l.assignedEmployeeId)?.name || "Unassigned"}
                </div>
              </div>
            </div>
            <StatusBadge status={l.status} />
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <p className="text-muted-foreground text-sm">Scheduled reminders for your leads</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Overdue" list={overdue} tone="text-destructive" />
        <Section title="Upcoming" list={future} tone="text-primary" />
      </div>
    </div>
  );
}
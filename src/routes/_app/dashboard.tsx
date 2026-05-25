import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import {
  Users,
  UserPlus,
  PhoneCall,
  CheckCircle2,
  CalendarClock,
  UserCog,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/leads/StatusBadge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Stat({ label, value, icon: Icon, tint }: { label: string; value: number | string; icon: any; tint: string }) {
  return (
    <Card className="p-5 shadow-sm hover:shadow-md transition-shadow border-0 bg-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
        </div>
        <div className={`size-11 rounded-xl grid place-items-center ${tint}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const leads = useStore((s) => s.leads);
  const employees = useStore((s) => s.employees);
  const activity = useStore((s) => s.activity);

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "New").length,
    contacted: leads.filter((l) => l.status === "Contacted").length,
    converted: leads.filter((l) => l.status === "Converted").length,
    pending: leads.filter((l) => l.followUpDate && new Date(l.followUpDate) >= new Date(new Date().toDateString())).length,
    employees: employees.length,
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthly = months.map((m, i) => ({ month: m, leads: Math.round(10 + Math.abs(Math.sin(i * 1.3)) * 30 + i * 2) }));

  const conv = [
    { name: "New", v: stats.new },
    { name: "Contacted", v: stats.contacted },
    { name: "Interested", v: leads.filter((l) => l.status === "Interested").length },
    { name: "Converted", v: stats.converted },
    { name: "Closed", v: leads.filter((l) => l.status === "Closed").length },
  ];

  const sources = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#3b5bd9", "#5b8def", "#7ac4a8", "#f4b860", "#e07a7a"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your sales pipeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat label="Total Leads" value={stats.total} icon={Users} tint="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" />
        <Stat label="New Leads" value={stats.new} icon={UserPlus} tint="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" />
        <Stat label="Contacted" value={stats.contacted} icon={PhoneCall} tint="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" />
        <Stat label="Converted" value={stats.converted} icon={CheckCircle2} tint="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" />
        <Stat label="Pending Follow-ups" value={stats.pending} icon={CalendarClock} tint="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" />
        <Stat label="Employees" value={stats.employees} icon={UserCog} tint="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 border-0 shadow-sm">
          <div className="font-semibold mb-4">Monthly Lead Growth</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#3b5bd9" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 border-0 shadow-sm">
          <div className="font-semibold mb-4">Lead Sources</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sources} dataKey="value" nameKey="name" outerRadius={80} label>
                  {sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 border-0 shadow-sm">
          <div className="font-semibold mb-4">Lead Conversion Analytics</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conv}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="v" fill="#3b5bd9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 border-0 shadow-sm">
          <div className="font-semibold mb-4">Recent Activity</div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activity.slice(0, 10).map((a) => (
              <div key={a.id} className="text-sm border-l-2 border-primary pl-3">
                <div>{a.text}</div>
                <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="p-5 pb-3">
          <div className="font-semibold">Contact Log — Who Contacted Whom</div>
          <p className="text-xs text-muted-foreground mt-1">
            Each client lead and the employee responsible for the contact.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead ID</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead>Contacted By</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Follow-up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((l) => {
                const emp = employees.find((e) => e.id === l.assignedEmployeeId);
                return (
                  <TableRow key={l.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">{l.id}</TableCell>
                    <TableCell className="font-medium">{l.clientName}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{l.company}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
                          {emp ? emp.name.charAt(0) : "—"}
                        </div>
                        <span className="text-sm">{emp?.name ?? "Unassigned"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{emp?.role ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{l.followUpDate || "—"}</TableCell>
                  </TableRow>
                );
              })}
              {leads.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No contacts yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
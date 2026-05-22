import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

export const Route = createFileRoute("/_app/reports")({
  component: Reports,
});

const COLORS = ["#3b5bd9", "#5b8def", "#7ac4a8", "#f4b860", "#e07a7a", "#9b87f5"];

function Reports() {
  const leads = useStore((s) => s.leads);
  const employees = useStore((s) => s.employees);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthly = months.map((m, i) => ({
    month: m,
    leads: Math.round(8 + Math.abs(Math.cos(i)) * 25 + i),
    converted: Math.round(2 + Math.abs(Math.sin(i)) * 8),
  }));

  const total = leads.length || 1;
  const converted = leads.filter((l) => l.status === "Converted").length;
  const rate = ((converted / total) * 100).toFixed(1);

  const empPerf = employees.map((e) => ({
    name: e.name.split(" ")[0],
    leads: leads.filter((l) => l.assignedEmployeeId === e.id).length,
    converted: leads.filter((l) => l.assignedEmployeeId === e.id && l.status === "Converted").length,
  }));

  const sources = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => { acc[l.source] = (acc[l.source] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm">Performance insights at a glance</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5 border-0 shadow-sm"><div className="text-sm text-muted-foreground">Total Leads</div><div className="text-3xl font-bold mt-1">{leads.length}</div></Card>
        <Card className="p-5 border-0 shadow-sm"><div className="text-sm text-muted-foreground">Converted</div><div className="text-3xl font-bold mt-1">{converted}</div></Card>
        <Card className="p-5 border-0 shadow-sm"><div className="text-sm text-muted-foreground">Conversion Rate</div><div className="text-3xl font-bold mt-1">{rate}%</div></Card>
      </div>

      <Card className="p-5 border-0 shadow-sm">
        <div className="font-semibold mb-4">Monthly Leads vs Conversions</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b5bd9" stopOpacity={0.4} /><stop offset="95%" stopColor="#3b5bd9" stopOpacity={0} /></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7ac4a8" stopOpacity={0.4} /><stop offset="95%" stopColor="#7ac4a8" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend />
              <Area type="monotone" dataKey="leads" stroke="#3b5bd9" fill="url(#g1)" />
              <Area type="monotone" dataKey="converted" stroke="#7ac4a8" fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 border-0 shadow-sm">
          <div className="font-semibold mb-4">Employee Performance</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={empPerf}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend />
                <Bar dataKey="leads" fill="#3b5bd9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="converted" fill="#7ac4a8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 border-0 shadow-sm">
          <div className="font-semibold mb-4">Leads by Source</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sources} dataKey="value" nameKey="name" outerRadius={90} label>
                  {sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/leads/StatusBadge";
import { Eye, Pencil, Trash2, Plus, Download, Search } from "lucide-react";
import { useStore, setState, nextLeadId, logActivity, type Lead, type LeadStatus } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/leads")({
  component: Leads,
});

const statuses: LeadStatus[] = ["New", "Contacted", "Interested", "Converted", "Closed"];
const sources = ["Website", "LinkedIn", "Referral", "Instagram", "Facebook", "Email", "Other"];

function emptyLead(): Lead {
  return {
    id: nextLeadId(),
    clientName: "", email: "", phone: "", company: "",
    source: "Website", assignedEmployeeId: "",
    status: "New", followUpDate: "", notes: "", createdAt: new Date().toISOString(),
  };
}

function Leads() {
  const leads = useStore((s) => s.leads);
  const employees = useStore((s) => s.employees);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fEmp, setFEmp] = useState("all");
  const [fSrc, setFSrc] = useState("all");
  const [sortLatest, setSortLatest] = useState(true);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [viewing, setViewing] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    let r = leads.filter((l) => {
      const q = search.toLowerCase();
      const hit = !q || [l.clientName, l.email, l.company, l.phone].some((v) => v.toLowerCase().includes(q));
      return hit
        && (fStatus === "all" || l.status === fStatus)
        && (fEmp === "all" || l.assignedEmployeeId === fEmp)
        && (fSrc === "all" || l.source === fSrc);
    });
    r = [...r].sort((a, b) => sortLatest
      ? +new Date(b.createdAt) - +new Date(a.createdAt)
      : +new Date(a.createdAt) - +new Date(b.createdAt));
    return r;
  }, [leads, search, fStatus, fEmp, fSrc, sortLatest]);

  const openNew = () => { setEditing(emptyLead()); setDialogOpen(true); };
  const openEdit = (l: Lead) => { setEditing({ ...l }); setDialogOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.clientName.trim()) return toast.error("Client name required");
    const exists = leads.some((l) => l.id === editing.id);
    setState((s) => ({
      ...s,
      leads: exists ? s.leads.map((l) => (l.id === editing.id ? editing : l)) : [editing, ...s.leads],
    }));
    logActivity(`${exists ? "Updated" : "Created"} lead ${editing.clientName}`);
    toast.success(exists ? "Lead updated" : "Lead created");
    setDialogOpen(false);
  };

  const remove = (l: Lead) => {
    if (!confirm(`Delete lead "${l.clientName}"?`)) return;
    setState((s) => ({ ...s, leads: s.leads.filter((x) => x.id !== l.id) }));
    logActivity(`Deleted lead ${l.clientName}`);
    toast.success("Lead deleted");
  };

  const exportCsv = () => {
    const headers = ["ID", "Client", "Email", "Phone", "Company", "Source", "Assigned", "Status", "Follow-up"];
    const rows = filtered.map((l) => [
      l.id, l.clientName, l.email, l.phone, l.company, l.source,
      employees.find((e) => e.id === l.assignedEmployeeId)?.name || "",
      l.status, l.followUpDate,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} of {leads.length} leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="size-4 mr-2" />Export</Button>
          <Button onClick={openNew}><Plus className="size-4 mr-2" />New Lead</Button>
        </div>
      </div>

      <Card className="p-4 border-0 shadow-sm">
        <div className="grid md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fEmp} onValueChange={setFEmp}>
            <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fSrc} onValueChange={setFSrc}>
            <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={() => setSortLatest(!sortLatest)}>
            Sort: {sortLatest ? "Latest first" : "Oldest first"}
          </Button>
        </div>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead className="hidden lg:table-cell">Source</TableHead>
                <TableHead className="hidden md:table-cell">Assigned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Follow-up</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">{l.id}</TableCell>
                  <TableCell className="font-medium">{l.clientName}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{l.email}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{l.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{l.company}</TableCell>
                  <TableCell className="hidden lg:table-cell">{l.source}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {employees.find((e) => e.id === l.assignedEmployeeId)?.name || "—"}
                  </TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{l.followUpDate || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(l)}><Eye className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(l)}><Pencil className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(l)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-10">No leads found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lead details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">ID:</span> {viewing.id}</div>
              <div><span className="text-muted-foreground">Name:</span> {viewing.clientName}</div>
              <div><span className="text-muted-foreground">Email:</span> {viewing.email}</div>
              <div><span className="text-muted-foreground">Phone:</span> {viewing.phone}</div>
              <div><span className="text-muted-foreground">Company:</span> {viewing.company}</div>
              <div><span className="text-muted-foreground">Source:</span> {viewing.source}</div>
              <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={viewing.status} /></div>
              <div><span className="text-muted-foreground">Follow-up:</span> {viewing.followUpDate || "—"}</div>
              <div><span className="text-muted-foreground">Notes:</span> {viewing.notes || "—"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing && leads.some((l) => l.id === editing.id) ? "Edit Lead" : "New Lead"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Client Name</Label><Input className="mt-1.5" value={editing.clientName} onChange={(e) => setEditing({ ...editing, clientName: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" className="mt-1.5" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input className="mt-1.5" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
              <div><Label>Company</Label><Input className="mt-1.5" value={editing.company} onChange={(e) => setEditing({ ...editing, company: e.target.value })} /></div>
              <div><Label>Lead Source</Label>
                <Select value={editing.source} onValueChange={(v) => setEditing({ ...editing, source: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Assigned Employee</Label>
                <Select value={editing.assignedEmployeeId} onValueChange={(v) => setEditing({ ...editing, assignedEmployeeId: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Status</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as LeadStatus })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Follow-up Date</Label><Input type="date" className="mt-1.5" value={editing.followUpDate} onChange={(e) => setEditing({ ...editing, followUpDate: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Notes</Label><Textarea className="mt-1.5" rows={3} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
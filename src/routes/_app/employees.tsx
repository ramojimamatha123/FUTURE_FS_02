import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Plus, Pencil, Trash2 } from "lucide-react";
import { useStore, setState, logActivity, type Employee } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/employees")({
  component: Employees,
});

const statusColors: Record<Employee["status"], string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
  "On Leave": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
  Inactive: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
};

function Employees() {
  const employees = useStore((s) => s.employees);
  const leads = useStore((s) => s.leads);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const openNew = () => { setEditing({ id: crypto.randomUUID(), name: "", email: "", phone: "", role: "Sales Executive", status: "Active" }); setOpen(true); };
  const openEdit = (e: Employee) => { setEditing({ ...e }); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Name required");
    const exists = employees.some((x) => x.id === editing.id);
    setState((s) => ({ ...s, employees: exists ? s.employees.map((x) => x.id === editing.id ? editing : x) : [...s.employees, editing] }));
    logActivity(`${exists ? "Updated" : "Added"} employee ${editing.name}`);
    toast.success(exists ? "Updated" : "Added");
    setOpen(false);
  };

  const remove = (e: Employee) => {
    if (!confirm(`Remove ${e.name}?`)) return;
    setState((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== e.id) }));
    toast.success("Removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground text-sm">{employees.length} team members</p>
        </div>
        <Button onClick={openNew}><Plus className="size-4 mr-2" />Add Employee</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {employees.map((e) => {
          const leadCount = leads.filter((l) => l.assignedEmployeeId === e.id).length;
          return (
            <Card key={e.id} className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-lg">
                    {e.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.role}</div>
                  </div>
                </div>
                <Badge variant="outline" className={statusColors[e.status]}>{e.status}</Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="size-3.5" />{e.email}</div>
                <div className="flex items-center gap-2"><Phone className="size-3.5" />{e.phone}</div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="text-xs"><span className="font-semibold">{leadCount}</span> <span className="text-muted-foreground">leads</span></div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(e)}><Pencil className="size-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(e)}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing && employees.some((x) => x.id === editing.id) ? "Edit" : "Add"} Employee</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input className="mt-1.5" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input className="mt-1.5" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input className="mt-1.5" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
              <div><Label>Role</Label><Input className="mt-1.5" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} /></div>
              <div><Label>Status</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as Employee["status"] })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
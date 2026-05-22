import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, setState, logActivity } from "@/lib/store";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/notes")({
  component: Notes,
});

function Notes() {
  const notes = useStore((s) => s.notes);
  const leads = useStore((s) => s.leads);
  const [leadId, setLeadId] = useState(leads[0]?.id ?? "");
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const add = () => {
    if (!text.trim() || !leadId) return toast.error("Pick a lead and enter text");
    if (editingId) {
      setState((s) => ({ ...s, notes: s.notes.map((n) => n.id === editingId ? { ...n, text } : n) }));
      toast.success("Note updated");
    } else {
      setState((s) => ({ ...s, notes: [{ id: crypto.randomUUID(), leadId, text, createdAt: new Date().toISOString() }, ...s.notes] }));
      logActivity(`Added note to ${leads.find((l) => l.id === leadId)?.clientName}`);
      toast.success("Note added");
    }
    setText(""); setEditingId(null);
  };

  const remove = (id: string) => {
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notes</h1>
        <p className="text-muted-foreground text-sm">Capture context for every lead</p>
      </div>

      <Card className="p-5 border-0 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger className="md:w-64"><SelectValue placeholder="Select lead" /></SelectTrigger>
            <SelectContent>{leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.clientName} · {l.company}</SelectItem>)}</SelectContent>
          </Select>
          <Textarea placeholder="Write a note..." value={text} onChange={(e) => setText(e.target.value)} rows={2} className="flex-1" />
          <Button onClick={add} className="md:self-start"><Plus className="size-4 mr-2" />{editingId ? "Update" : "Add"}</Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {notes.map((n) => {
          const lead = leads.find((l) => l.id === n.leadId);
          return (
            <Card key={n.id} className="p-4 border-0 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{lead?.clientName} · {lead?.company}</div>
                  <div className="mt-2 text-sm whitespace-pre-wrap">{n.text}</div>
                  <div className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingId(n.id); setText(n.text); setLeadId(n.leadId); }}><Pencil className="size-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(n.id)}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
        {notes.length === 0 && <div className="text-muted-foreground text-sm">No notes yet</div>}
      </div>
    </div>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signUp, type Role } from "@/lib/store";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [f, setF] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "", role: "Employee" as Role });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.fullName.trim()) return toast.error("Full name required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return toast.error("Invalid email");
    if (f.password.length < 8 || !/[A-Z]/.test(f.password) || !/[0-9]/.test(f.password))
      return toast.error("Password must be 8+ chars with uppercase & number");
    if (f.password !== f.confirm) return toast.error("Passwords do not match");
    const user = signUp({ fullName: f.fullName, email: f.email, phone: f.phone, password: f.password, role: f.role });
    if (!user) return toast.error("Email already registered");
    toast.success("Account created");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
      <Card className="w-full max-w-md p-8 shadow-xl border-0">
        <h2 className="text-2xl font-bold mb-1">Create account</h2>
        <p className="text-sm text-muted-foreground mb-6">Join LeadFlow CRM</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Full name</Label>
            <Input value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Password</Label>
              <Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Confirm</Label>
              <Input type="password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label>Role</Label>
            <Select value={f.role} onValueChange={(v) => setF({ ...f, role: v as Role })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-2">Create account</Button>
        </form>
        <div className="mt-4 text-sm text-center text-muted-foreground">
          Already have an account? <Link to="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
        </div>
      </Card>
      <Toaster richColors position="top-right" />
    </div>
  );
}
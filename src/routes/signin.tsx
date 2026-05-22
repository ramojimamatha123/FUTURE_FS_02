import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/store";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/signin")({
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@leadflowcrm.com");
  const [password, setPassword] = useState("LeadFlow@123");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = signIn(email.trim(), password);
    if (!u) return toast.error("Invalid credentials");
    toast.success(`Welcome back, ${u.fullName}`);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-background to-secondary">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sidebar-primary grid place-items-center font-bold text-sidebar-primary-foreground">L</div>
          <div className="text-xl font-semibold">LeadFlow CRM</div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Manage leads.<br/>Grow revenue.</h1>
          <p className="text-sidebar-foreground/70 max-w-md">A clean, modern CRM to track clients, follow-ups, and team performance — all in one place.</p>
        </div>
        <div className="text-xs opacity-60">© 2026 LeadFlow CRM</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 shadow-xl border-0">
          <h2 className="text-2xl font-bold mb-1">Sign in</h2>
          <p className="text-sm text-muted-foreground mb-6">Welcome back to LeadFlow CRM</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <div className="mt-4 text-sm text-center text-muted-foreground">
            New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
          </div>
          <div className="mt-6 p-3 rounded-lg bg-secondary text-xs space-y-1">
            <div className="font-semibold">Demo credentials</div>
            <div>Admin: admin@leadflowcrm.com / LeadFlow@123</div>
            <div>Employee: employee@leadflowcrm.com / Employee@123</div>
          </div>
        </Card>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/forgot-password")({
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Invalid email");
    toast.success("Reset link sent (demo)");
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
      <Card className="w-full max-w-md p-8 shadow-xl border-0">
        <h2 className="text-2xl font-bold mb-1">Forgot password</h2>
        <p className="text-sm text-muted-foreground mb-6">We'll send a reset link to your email</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
        <div className="mt-4 text-sm text-center text-muted-foreground">
          <Link to="/signin" className="text-primary font-medium hover:underline">Back to sign in</Link>
        </div>
      </Card>
      <Toaster richColors position="top-right" />
    </div>
  );
}
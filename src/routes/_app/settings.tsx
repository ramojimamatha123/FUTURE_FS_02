import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { currentUser, setState, useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

function Settings() {
  const user = useStore(() => currentUser());
  const theme = useStore((s) => s.theme);
  const notifications = useStore((s) => s.notifications);
  const [profile, setProfile] = useState({ fullName: user?.fullName ?? "", email: user?.email ?? "", phone: user?.phone ?? "" });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  if (!user) return null;

  const saveProfile = () => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => u.id === user.id ? { ...u, ...profile } : u),
    }));
    toast.success("Profile updated");
  };

  const changePwd = () => {
    if (pwd.current !== user.password) return toast.error("Current password incorrect");
    if (pwd.next.length < 8) return toast.error("New password too short");
    if (pwd.next !== pwd.confirm) return toast.error("Passwords do not match");
    setState((s) => ({ ...s, users: s.users.map((u) => u.id === user.id ? { ...u, password: pwd.next } : u) }));
    setPwd({ current: "", next: "", confirm: "" });
    toast.success("Password changed");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account preferences</p>
      </div>

      <Card className="p-6 border-0 shadow-sm space-y-4">
        <div className="font-semibold">Profile</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Full name</Label><Input className="mt-1.5" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></div>
          <div><Label>Email</Label><Input className="mt-1.5" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input className="mt-1.5" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <div><Label>Role</Label><Input className="mt-1.5" value={user.role} disabled /></div>
        </div>
        <Button onClick={saveProfile}>Save profile</Button>
      </Card>

      <Card className="p-6 border-0 shadow-sm space-y-4">
        <div className="font-semibold">Change password</div>
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label>Current</Label><Input className="mt-1.5" type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} /></div>
          <div><Label>New</Label><Input className="mt-1.5" type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} /></div>
          <div><Label>Confirm</Label><Input className="mt-1.5" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} /></div>
        </div>
        <Button onClick={changePwd}>Update password</Button>
      </Card>

      <Card className="p-6 border-0 shadow-sm space-y-4">
        <div className="font-semibold">Preferences</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Dark mode</div>
            <div className="text-xs text-muted-foreground">Switch theme appearance</div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={(v) => setState((s) => ({ ...s, theme: v ? "dark" : "light" }))} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Email notifications</div>
            <div className="text-xs text-muted-foreground">Get notified about follow-ups</div>
          </div>
          <Switch checked={notifications} onCheckedChange={(v) => setState((s) => ({ ...s, notifications: v }))} />
        </div>
      </Card>
    </div>
  );
}
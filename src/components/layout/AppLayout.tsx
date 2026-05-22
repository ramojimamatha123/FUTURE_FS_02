import { Link, useNavigate, useLocation, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarClock,
  StickyNote,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { currentUser, signOut, useStore } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/employees", label: "Employees", icon: UserCog },
  { to: "/followups", label: "Follow-ups", icon: CalendarClock },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = useStore((s) => s.currentUserId);
  const user = useStore(() => currentUser());
  const pendingFollowups = useStore((s) =>
    s.leads.filter((l) => l.followUpDate && new Date(l.followUpDate) >= new Date(new Date().toDateString())).length,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId) navigate({ to: "/signin" });
  }, [userId, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 shadow-xl",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="size-9 rounded-xl bg-sidebar-primary grid place-items-center text-sidebar-primary-foreground font-bold">L</div>
          <div className="ml-3">
            <div className="font-semibold text-base">LeadFlow</div>
            <div className="text-[11px] opacity-70 -mt-0.5">CRM</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "hover:bg-sidebar-accent",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => {
              signOut();
              navigate({ to: "/signin" });
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-sidebar-accent transition"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card/80 backdrop-blur sticky top-0 z-20 flex items-center px-4 lg:px-6 gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Welcome back,</div>
            <div className="font-semibold leading-tight">{user.fullName}</div>
          </div>
          <div className="relative">
            <Bell className="size-5 text-muted-foreground" />
            {pendingFollowups > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center">
                {pendingFollowups}
              </span>
            )}
          </div>
          <div className="size-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">
            {user.fullName.charAt(0)}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
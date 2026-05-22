import { useSyncExternalStore } from "react";

export type Role = "Admin" | "Employee";
export type LeadStatus = "New" | "Contacted" | "Interested" | "Converted" | "Closed";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "On Leave" | "Inactive";
}

export interface Note {
  id: string;
  leadId: string;
  text: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  assignedEmployeeId: string;
  status: LeadStatus;
  followUpDate: string;
  notes: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  text: string;
  createdAt: string;
}

interface DB {
  users: User[];
  employees: Employee[];
  leads: Lead[];
  notes: Note[];
  activity: Activity[];
  currentUserId: string | null;
  theme: "light" | "dark";
  notifications: boolean;
}

const KEY = "leadflow-crm-db-v1";

const seedEmployees: Employee[] = [
  { id: "e1", name: "Rahul Sharma", email: "rahul@leadflowcrm.com", phone: "+91 9876543210", role: "Sales Executive", status: "Active" },
  { id: "e2", name: "Priya Verma", email: "priya@leadflowcrm.com", phone: "+91 9123456780", role: "CRM Manager", status: "Active" },
  { id: "e3", name: "Arjun Patel", email: "arjun@leadflowcrm.com", phone: "+91 9988776655", role: "Marketing Executive", status: "On Leave" },
  { id: "e4", name: "Sneha Reddy", email: "sneha@leadflowcrm.com", phone: "+91 9012345678", role: "Team Lead", status: "Active" },
];

const today = new Date();
const future = (d: number) => new Date(today.getTime() + d * 86400000).toISOString().slice(0, 10);

const seedLeads: Lead[] = [
  { id: "L-1001", clientName: "John Smith", email: "johnsmith@gmail.com", phone: "+1 9876543210", company: "TechNova Solutions", source: "Website", assignedEmployeeId: "e1", status: "New", followUpDate: future(2), notes: "", createdAt: new Date().toISOString() },
  { id: "L-1002", clientName: "Emma Johnson", email: "emma@gmail.com", phone: "+1 9123456780", company: "Bright Digital", source: "LinkedIn", assignedEmployeeId: "e2", status: "Contacted", followUpDate: future(4), notes: "", createdAt: new Date().toISOString() },
  { id: "L-1003", clientName: "Michael Brown", email: "michael@gmail.com", phone: "+1 9988776655", company: "SkyTech", source: "Referral", assignedEmployeeId: "e1", status: "Interested", followUpDate: future(1), notes: "", createdAt: new Date().toISOString() },
  { id: "L-1004", clientName: "Sophia Wilson", email: "sophia@gmail.com", phone: "+1 9234567810", company: "CloudSync", source: "Instagram", assignedEmployeeId: "e4", status: "Converted", followUpDate: future(10), notes: "", createdAt: new Date().toISOString() },
];

const seedUsers: User[] = [
  { id: "u1", fullName: "Admin User", email: "admin@leadflowcrm.com", phone: "+1 0000000000", password: "LeadFlow@123", role: "Admin" },
  { id: "u2", fullName: "Employee User", email: "employee@leadflowcrm.com", phone: "+1 0000000001", password: "Employee@123", role: "Employee" },
];

function initial(): DB {
  return {
    users: seedUsers,
    employees: seedEmployees,
    leads: seedLeads,
    notes: [],
    activity: [{ id: "a1", text: "System initialized", createdAt: new Date().toISOString() }],
    currentUserId: null,
    theme: "light",
    notifications: true,
  };
}

let state: DB = load();
const listeners = new Set<() => void>();

function load(): DB {
  if (typeof window === "undefined") return initial();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const init = initial();
      localStorage.setItem(KEY, JSON.stringify(init));
      return init;
    }
    return { ...initial(), ...JSON.parse(raw) };
  } catch {
    return initial();
  }
}

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
    if (state.theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
  listeners.forEach((l) => l());
}

export function setState(updater: (s: DB) => DB) {
  state = updater(state);
  persist();
}

export function getState() {
  return state;
}

export function useStore<T>(selector: (s: DB) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}

export function logActivity(text: string) {
  setState((s) => ({
    ...s,
    activity: [{ id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }, ...s.activity].slice(0, 50),
  }));
}

export function signIn(email: string, password: string): User | null {
  const u = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!u) return null;
  setState((s) => ({ ...s, currentUserId: u.id }));
  logActivity(`${u.fullName} signed in`);
  return u;
}

export function signUp(data: Omit<User, "id">): User | null {
  if (state.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) return null;
  const user: User = { ...data, id: crypto.randomUUID() };
  setState((s) => ({ ...s, users: [...s.users, user], currentUserId: user.id }));
  logActivity(`${user.fullName} signed up`);
  return user;
}

export function signOut() {
  setState((s) => ({ ...s, currentUserId: null }));
}

export function currentUser(): User | null {
  return state.users.find((u) => u.id === state.currentUserId) ?? null;
}

export function nextLeadId() {
  const max = state.leads.reduce((m, l) => {
    const n = parseInt(l.id.replace(/\D/g, ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 1000);
  return `L-${max + 1}`;
}

if (typeof window !== "undefined") {
  if (state.theme === "dark") document.documentElement.classList.add("dark");
}
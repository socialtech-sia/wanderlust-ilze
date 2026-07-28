import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarCheck,
  Compass,
  FileText,
  HelpCircle,
  Home,
  Image as ImageIcon,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminSignOut, useAdminAuth } from "@/hooks/use-admin-auth";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const NAV: NavItem[] = [
  { to: "/admin", label: "Pārskats", icon: Home },
  { to: "/admin/services", label: "Pakalpojumi", icon: Compass },
  { to: "/admin/bookings", label: "Rezervācijas", icon: CalendarCheck },
  { to: "/admin/media", label: "Mediji", icon: ImageIcon },
  { to: "/admin/faq", label: "BUJ", icon: HelpCircle },
  { to: "/admin/testimonials", label: "Atsauksmes", icon: MessageSquareQuote },
  { to: "/admin/blog", label: "Blogs", icon: FileText },
  { to: "/admin/messages", label: "Ziņojumi", icon: Mail },
  { to: "/admin/chat", label: "Čats", icon: MessageCircle },
  { to: "/admin/profile", label: "Profils", icon: User },
  { to: "/admin/settings", label: "Iestatījumi", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { email } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => (to === "/admin" ? pathname === "/admin" : pathname.startsWith(to));

  async function handleSignOut() {
    await adminSignOut();
    await navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="admin-scope flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 shrink-0 border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center px-5">
          <Link to="/admin" className="font-display text-lg text-foreground">
            Wanderlust CMS
          </Link>
        </div>
        <nav className="space-y-1 px-3 pb-6">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                isActive(item.to)
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Izvēlne"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Iziet
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

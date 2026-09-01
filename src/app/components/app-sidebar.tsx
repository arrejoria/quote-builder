import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";
import { LayoutDashboard, Users, FileText, Receipt, Settings, HelpCircle, ChevronRight, LogOut } from "lucide-react";
import { cn } from "./ui/utils";
import { useAuth } from "../../contexts/AuthContext";

type NavItem = { id: string; label: string; icon: React.FC<{ className?: string }>; enabled: boolean };

const NAV_ITEMS: NavItem[] = [
  { id: "home",     label: "Home",     icon: LayoutDashboard, enabled: false },
  { id: "clients",  label: "Clients",  icon: Users,           enabled: false },
  { id: "budgets",  label: "Budgets",  icon: FileText,        enabled: true  },
  { id: "invoices", label: "Invoices", icon: Receipt,         enabled: false },
  { id: "settings", label: "Settings", icon: Settings,        enabled: false },
];

export function AppSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, signOut } = useAuth();

  useLayoutEffect(() => {
    gsap.fromTo(sidebarRef.current,
      { x: -12 },
      { x: 0, duration: 0.45, ease: "power2.out" }
    );
    const items = itemsRef.current?.querySelectorAll("[data-nav-item]");
    if (items?.length) {
      gsap.fromTo(items,
        { x: -8 },
        { x: 0, duration: 0.35, ease: "power2.out", stagger: 0.05, delay: 0.15 }
      );
    }
  }, []);

  return (
    <div
      ref={sidebarRef}
      className="w-[220px] shrink-0 flex flex-col h-full bg-sidebar border-r border-sidebar-border print:hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-sidebar-border">
        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs leading-none">QB</span>
        </div>
        <span className="text-sidebar-foreground font-semibold text-sm">Quote Builder</span>
      </div>

      {/* Nav */}
      <nav ref={itemsRef} className="flex-1 px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "budgets";
          return (
            <div
              key={item.id}
              data-nav-item
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 select-none",
                isActive
                  ? "bg-primary text-white"
                  : item.enabled
                  ? "text-white/70 hover:text-white hover:bg-sidebar-accent cursor-pointer"
                  : "text-white/30 cursor-default"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 pt-2 border-t border-sidebar-border space-y-0.5">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-white/40 cursor-default select-none">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 shrink-0" />
            Ayuda & Soporte
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>

        {isAuthenticated && (
          <div className="px-3 py-2 border-t border-sidebar-border mt-1 pt-3">
            <p className="text-xs text-white/30 truncate mb-2">{user?.email}</p>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80 transition-colors w-full"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

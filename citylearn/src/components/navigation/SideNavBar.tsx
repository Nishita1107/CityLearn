// src/components/navigation/SideNavBar.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  History, 
  BrainCircuit, 
  Lightbulb, 
  Network, 
  RefreshCcw,
  UserCircle,
  LogOut
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Analysis", icon: BarChart3, href: "/analysis-engine" },
  { label: "Similar Events", icon: History, href: "/institutional-memory-match" },
  { label: "Predictions", icon: BrainCircuit, href: "/predictive-intelligence" },
  { label: "Recommendations", icon: Lightbulb, href: "/strategic-recommendations" },
  { label: "Knowledge Graph", icon: Network, href: "/knowledge-graph" },
  { label: "Learning Loop", icon: RefreshCcw, href: "/learning-loop" },
];

export default function SideNavBar() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Error fetching user in SideNavBar:", err));
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST"
      });
      if (response.ok) {
        localStorage.clear();
        sessionStorage.clear();
        alert("Successfully Signed Out");
        window.location.href = "/sign-in";
      } else {
        alert("Failed to sign out. Please try again.");
      }
    } catch (err) {
      console.error("Sign out error:", err);
      alert("An error occurred during sign out.");
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-white flex flex-col h-screen sticky top-0 hidden lg:flex z-30">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <Image
          src="/images/logo.png"
          alt="CityLearn Logo"
          width={32}
          height={32}
          className="w-8 h-8 object-contain shrink-0"
        />
        <div>
          <h2 className="citylearn-brand font-bold tracking-tight text-lg text-foreground">CityLearn</h2>
          <p className="text-[10px] uppercase text-muted-foreground tracking-widest font-semibold">Institutional Memory</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all group",
              pathname === item.href 
                ? "bg-primary/10 text-primary font-semibold" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-colors", pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            <span className="text-sm font-sans">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div className="px-3">
          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">My Account</p>
        </div>
        <Link 
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-all",
            pathname === "/profile" && "border-primary/30 bg-primary/5 text-primary"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserCircle className="text-primary w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-foreground truncate">{user?.name || "Guest"}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold">{user?.city || "Location"}</p>
          </div>
        </Link>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-bold text-xs text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span className="font-sans">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}


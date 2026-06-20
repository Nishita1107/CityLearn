// src/components/navigation/TopAppBar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Menu, X, UserCircle, BrainCircuit, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navItems } from "./SideNavBar";

export default function TopAppBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Error fetching user in TopAppBar:", err));
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

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-border bg-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
        
        {/* Search Bar */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer rounded-md hover:bg-muted/50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Clock & Calendar */}
          <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2">
            <div className="text-right">
              <p className="text-[10px] sm:text-xs font-bold text-foreground min-h-[14px] sm:min-h-[16px] leading-tight">{time || "--:--"}</p>
              <p className="text-[8px] sm:text-[9px] text-muted-foreground font-semibold uppercase min-h-[10px] sm:min-h-[12px] leading-tight">{date || "Loading..."}</p>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer Navigation Panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden border-r border-border",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Drawer Header */}
        <div className="h-16 border-b border-border flex items-center px-6 gap-3 bg-white shrink-0">
          {/* Close Button aligned to where the hamburger menu sits */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer rounded-md hover:bg-muted/50 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
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
        </div>

        {/* Drawer Scrollable Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-md transition-all group",
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

        {/* Drawer Footer / User Profile Section */}
        <div className="p-4 border-t border-border bg-white shrink-0 space-y-3">
          <div className="px-3">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">My Account</p>
          </div>
          <Link 
            href="/profile"
            onClick={() => setIsOpen(false)}
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
      </div>
    </>
  );
}

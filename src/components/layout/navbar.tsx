"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  title: string;
  description?: string;
  badge?: string;
}

export function Navbar({ title, description, badge }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="ml-12 lg:ml-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {badge && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="w-64 pl-8"
              disabled
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}

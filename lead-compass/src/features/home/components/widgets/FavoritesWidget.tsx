import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HomeFavorite } from "./types";

const FAVORITES_KEY = "crm.home.favorites";

function readFavorites(tenantSlug: string, available: HomeFavorite[]) {
  try {
    const saved = localStorage.getItem(`${FAVORITES_KEY}.${tenantSlug}`);
    const ids = saved
      ? (JSON.parse(saved) as string[])
      : ["leads", "deals", "calendar", "activities"];
    return ids.filter((id) => available.some((item) => item.id === id));
  } catch {
    return ["leads", "deals", "calendar", "activities"].filter((id) =>
      available.some((item) => item.id === id),
    );
  }
}

export const FavoritesWidget = React.memo(function FavoritesWidget({
  tenantSlug,
  items,
}: {
  tenantSlug: string;
  items: HomeFavorite[];
}) {
  const [favoriteIds, setFavoriteIds] = useState(() => readFavorites(tenantSlug, items));
  const favorites = items.filter((item) => favoriteIds.includes(item.id));

  const toggleFavorite = (id: string, checked: boolean) => {
    const next = checked ? [...favoriteIds, id] : favoriteIds.filter((value) => value !== id);
    setFavoriteIds(next);
    localStorage.setItem(`${FAVORITES_KEY}.${tenantSlug}`, JSON.stringify(next));
  };

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">Favorites</CardTitle>
          <CardDescription className="mt-1 text-xs">
            Your most-used places in the CRM.
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-2 -mt-1 h-8 w-8"
              aria-label="Edit favorites"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Choose favorites</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {items.map((item) => (
              <DropdownMenuCheckboxItem
                key={item.id}
                checked={favoriteIds.includes(item.id)}
                onCheckedChange={(checked) => toggleFavorite(item.id, checked)}
              >
                {item.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2.5">
        {favorites.length ? (
          favorites.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.href}
                className="group flex min-w-0 items-center gap-2.5 rounded-xl border border-border/60 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${item.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate text-xs font-medium group-hover:text-primary">
                  {item.label}
                </span>
              </Link>
            );
          })
        ) : (
          <div className="col-span-2 rounded-xl border border-dashed p-5 text-center">
            <Heart className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Pin the places you visit most.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});


import { setTheme, ThemeMode } from "@/features/ui/slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";

export function ThemeMenu() {
    const dispatch = useAppDispatch();
    const theme = useAppSelector((s) => s.ui.theme);
    const opts: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Laptop },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Theme">
                    {theme === "dark" ? (
                        <Moon className="h-4 w-4 text-primary" />
                    ) : theme === "light" ? (
                        <Sun className="h-4 w-4 text-primary" />
                    ) : (
                        <Laptop className="h-4 w-4 text-primary" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {opts.map((o) => {
                    const Icon = o.icon;
                    return (
                        <DropdownMenuItem key={o.value} onClick={() => dispatch(setTheme(o.value))}>
                            <Icon className="mr-2 h-4 w-4" /> {o.label}
                            {theme === o.value && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
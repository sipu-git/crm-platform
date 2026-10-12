import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  sectionLabel?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SettingsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Settings panel chunk load error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/30 bg-destructive/5 my-4">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base text-destructive">
                  Unable to load {this.props.sectionLabel ?? "settings"} section
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  A network or rendering error occurred while loading this settings panel.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {this.state.error && (
              <pre className="rounded-lg bg-background p-3 text-[11px] font-mono text-muted-foreground overflow-x-auto border border-border/60">
                {this.state.error.message || "Failed to fetch dynamically imported module"}
              </pre>
            )}
            <div className="flex gap-3">
              <Button size="sm" variant="outline" onClick={this.handleRetry} className="gap-2 text-xs">
                <RefreshCw className="h-3.5 w-3.5" /> Retry loading
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}


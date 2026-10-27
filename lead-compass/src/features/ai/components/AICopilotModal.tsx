import React, { useEffect, useState } from "react";
import { Sparkles, Send, Loader2, X, Command, Trash2, Copy, Check } from "lucide-react";
import { useCopilotMutation } from "../hooks/useAi";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const SUGGESTIONS = [
  "What are our workspace KPI metrics?",
  "Search leads with high commercial intent",
  "Which deals are currently in progress?",
  "Summarize our revenue pipeline",
];

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ isOpen, onClose, initialPrompt = "" }) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; action?: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copilotMutation = useCopilotMutation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim() || copilotMutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setPrompt("");

    copilotMutation.mutate(
      { prompt: textToSend },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", text: data.answer, action: data.actionTaken },
          ]);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || err?.message || "Sorry, I ran into an error processing your request.";
          setMessages((prev) => [
            ...prev,
            { role: "assistant", text: `Error: ${msg}` },
          ]);
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(prompt);
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent
        className={`bg-card border-border flex flex-col ${
          isMobile
            ? "border-t max-h-[85vh]"
            : "top-0 right-0 left-auto mt-0 w-full max-w-md h-full rounded-none border-l"
        }`}
      >
        {/* Header */}
        <DrawerHeader className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-2.5 text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DrawerTitle className="text-sm font-semibold text-foreground">Synora AI Assistant</DrawerTitle>
              <p className="text-xs text-muted-foreground">Powered by Gemini AI · Read-Only CRM Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                aria-label="Clear conversation"
                title="Clear conversation"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <DrawerClose asChild>
              <button
                aria-label="Close AI Co-Pilot"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Command className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">How can I assist your CRM today?</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                  Ask questions about your leads, deals, workspace performance, or workflow tasks.
                </p>
              </div>

              {/* Suggestions Chips */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Quick Suggestions</p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSend(s)}
                      className="text-left text-xs rounded-xl border border-border bg-background p-3 hover:border-primary/50 hover:bg-muted/50 transition-colors text-foreground flex items-center justify-between group"
                    >
                      <span>{s}</span>
                      <Sparkles className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="relative group max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-xs"
                        : "bg-muted text-foreground border border-border rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.action && (
                      <span className="mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded border text-emerald-700 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/20">
                        ⚡ {m.action}
                      </span>
                    )}
                  </div>

                  {m.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(m.text, idx)}
                      title="Copy response"
                      className="absolute -bottom-5 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-1"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {copilotMutation.isPending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-9">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Synora AI is querying CRM tools & verifying…</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="border-t border-border p-4 bg-background/90 backdrop-blur shrink-0 pb-8">
          <div className="relative flex items-center mx-auto max-w-4xl">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Synora AI or click a suggestion…"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!prompt.trim() || copilotMutation.isPending}
              className="absolute right-2 rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

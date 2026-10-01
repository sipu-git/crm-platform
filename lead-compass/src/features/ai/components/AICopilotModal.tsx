import React, { useState } from "react";
import { Sparkles, Send, Loader2, X, Command } from "lucide-react";
import { useCopilotMutation } from "../hooks/useAi";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; action?: string }>>([]);

  const copilotMutation = useCopilotMutation();
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || copilotMutation.isPending) return;

    const userText = prompt;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setPrompt("");

    copilotMutation.mutate(
      { prompt: userText },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", text: data.answer, action: data.actionTaken },
          ]);
        },
        onError: (err) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", text: "Sorry, I ran into an error processing your request." },
          ]);
        },
      }
    );
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent
        className={`bg-slate-900 border-purple-500/30 flex flex-col ${isMobile
            ? "border-t max-h-[85vh]"
            : "top-0 right-0 left-auto mt-0 w-full max-w-md h-full rounded-none border-l"
          }`}
      >
        {/* Header */}
        <DrawerHeader className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DrawerTitle className="text-sm font-semibold text-white">Synora AI</DrawerTitle>
              <p className="text-xs text-slate-400">Powered by ClearView CRM</p>
            </div>
          </div>
          <DrawerClose asChild>
            <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                <Command className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-medium text-slate-200">How can I assist your CRM today?</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try asking: <br />
                <span className="text-purple-300 font-mono">"Which deals are closing this month?"</span> or <br />
                <span className="text-purple-300 font-mono">"Draft a follow-up for client Logile"</span>
              </p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${m.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-none"
                    }`}
                >
                  <p>{m.text}</p>
                  {m.action && (
                    <span className="mt-1.5 inline-block text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ⚡ Action: {m.action}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}

          {copilotMutation.isPending && (
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              <span>AI Co-Pilot is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="border-t border-slate-800 p-4 bg-slate-900/90 shrink-0 pb-8">
          <div className="relative flex items-center mx-auto max-w-4xl">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI Co-Pilot anything or instruct an action..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || copilotMutation.isPending}
              className="absolute right-2 rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

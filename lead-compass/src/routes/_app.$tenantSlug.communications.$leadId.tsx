// features/communications/communications.page.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, MessageCircle, Mail, Phone, MessageSquare, StickyNote, Paperclip,
  X, Send, Check, CheckCheck, Clock, AlertCircle, Inbox, RotateCcw, Sparkle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sendMessage, viewCommunications } from "@/features/communications/communication.slice";
import {
  Communication,
  CommunicationChannel,
  CommunicationPayload,
  CommunicationStatus,
  MessageType,
} from "@/features/communications/communication.types";
import { format, isToday, isYesterday } from "date-fns";
import { CallIcon, EmailIcon, NoteIcon, SmsIcon, WhatsAppIcon } from "@/features/ui/icons/channel";

type IconProps = { className?: string; style?: React.CSSProperties };

const CHANNEL_META: Record<
  CommunicationChannel,
  { label: string; icon: React.ComponentType<IconProps>; tint: string }
> = {
  WHATSAPP: { label: "WhatsApp", icon: WhatsAppIcon, tint: "#25D366" },
  EMAIL: { label: "Email", icon: EmailIcon, tint: "#3B82F6" },
  CALL: { label: "Call", icon: CallIcon, tint: "#8B5CF6" },
  SMS: { label: "SMS", icon: SmsIcon, tint: "#F59E0B" },
  INTERNAL_NOTE: { label: "Note", icon: NoteIcon, tint: "#94A3B8" },
};
const CHANNEL_ORDER: CommunicationChannel[] = ["WHATSAPP", "EMAIL", "SMS", "CALL", "INTERNAL_NOTE"];

const MESSAGE_TYPE_OPTIONS: { value: MessageType; label: string }[] = [
  { value: "TEXT", label: "Text" },
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "AUDIO", label: "Audio" },
  { value: "DOCUMENT", label: "Document" },
];

const QUICK_REPLIES = [
  "Thanks for getting back to me!",
  "Are you free for a quick call tomorrow?",
  "Just checking in — any updates?",
];

const MAX_CHARS = 1000;

function dayLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

function StatusTicks({ status }: { status: CommunicationStatus }) {
  const map: Partial<Record<CommunicationStatus, { node: React.ReactNode; label: string }>> = {
    FAILED: { node: <AlertCircle className="h-3 w-3 text-destructive" />, label: "Failed to send" },
    QUEUED: { node: <Clock className="h-3 w-3 opacity-70" />, label: "Queued" },
    SENT: { node: <Check className="h-3 w-3 opacity-70" />, label: "Sent" },
    DELIVERED: { node: <CheckCheck className="h-3 w-3 opacity-70" />, label: "Delivered" },
    READ: { node: <CheckCheck className="h-3 w-3 text-emerald-400" />, label: "Read" },
  };
  const entry = map[status];
  if (!entry) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center">{entry.node}</span>
      </TooltipTrigger>
      <TooltipContent side="top">{entry.label}</TooltipContent>
    </Tooltip>
  );
}

export default function Communications() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tenantSlug = "", leadId = "" } = useParams();

  const lead = useAppSelector((s) => s.leads?.leads?.find((l: any) => l.id === leadId));
  const history: Communication[] = useAppSelector(
    (s) => s.communications?.data?.communications ?? []
  );
  const historyLoading = useAppSelector((s) => s.communications?.loading ?? false);
  const knowIdRef = useRef<Set<string>>(new Set())
  const [channel, setChannel] = useState<CommunicationChannel>("WHATSAPP");
  const [messageType, setMessageType] = useState<MessageType>("TEXT");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<CommunicationChannel | "ALL">("ALL");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { data } = useAppSelector((s) => s.communications)

  useEffect(() => {
    if (leadId)
      dispatch(viewCommunications(leadId));
    const interval = setInterval(() => {
      dispatch(viewCommunications(leadId));
    }, 5000)
    return () => clearInterval(interval);
  }, [dispatch, leadId]);

  useEffect(() => {
    const currentIds = new Set(history.map((c) => c.id));
    if (knowIdRef.current.size > 0) {
      const newInbound = history.filter(
        (c) => c.direction === "INBOUND" && !knowIdRef.current.has(c.id)
      );
      if (newInbound.length > 0) {
        toast.info(
          newInbound.length === 1
            ? `New reply from ${lead?.contact?.first_name ?? "lead"}`
            : `${newInbound.length} new replies from ${lead?.contact?.first_name ?? "lead"}`
        );
      }
    }

    knowIdRef.current = currentIds;
  }, [history, lead?.contact?.first_name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history.length, filter]);

  const isEmail = channel === "EMAIL";
  const isNote = channel === "INTERNAL_NOTE";

  const canSend = useMemo(() => {
    if (!body.trim() && !attachment) return false;
    if (isEmail && !subject.trim()) return false;
    return true;
  }, [body, attachment, isEmail, subject]);

  const filtered = useMemo(
    () => (filter === "ALL" ? history : history.filter((h) => h.channel === filter)),
    [history, filter],
  );

  const counts = useMemo(() => {
    const map = new Map<CommunicationChannel, number>();
    for (const h of history) map.set(h.channel, (map.get(h.channel) ?? 0) + 1);
    return map;
  }, [history]);

  const groupedHistory = useMemo(() => {
    const groups: { label: string; items: Communication[] }[] = [];
    for (const item of filtered) {
      const label = dayLabel(item.created_at);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(item);
      else groups.push({ label, items: [item] });
    }
    return groups;
  }, [filtered]);

  const handleAttachmentPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
    e.target.value = "";
  };

  const resetForm = () => {
    setBody("");
    setSubject("");
    setAttachment(null);
  };

  const handleSend = async () => {
    if (!canSend || sending) return;
    setSending(true);
    try {
      const payload: CommunicationPayload = {
        channel,
        direction: "OUTBOUND",
        messageType: isNote ? "NOTE" : messageType,
        subject: isEmail ? subject : undefined,
        body,
      };
      await dispatch(sendMessage({ leadId, payload })).unwrap();
      toast.success(isNote ? "Note saved" : `Message sent via ${CHANNEL_META[channel].label}`);
      resetForm();
      dispatch(viewCommunications(leadId));
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const initials = [lead?.contact?.first_name, lead?.contact?.last_name]
    .map((part) => part?.trim()?.[0])
    .filter(Boolean)
    .join("")
    .toUpperCase(); const overLimit = body.length > MAX_CHARS;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen flex-col bg-muted/30">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/${tenantSlug}/lead/${leadId}`)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Back to lead"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="relative shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
              </div>
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                {data?.contact?.first_name ?? "Lead"} {data?.contact?.last_name ?? "Lead"}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {data?.contact?.phone ?? "No phone on file"}
                {data?.contact?.email ? ` · ${data?.contact?.email}` : ""}
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              {/* {lead?.stage && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {lead.stage}
                </span>
              )} */}
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {history.length} messages
              </span>
            </div>
          </div>
        </header>

        {/* Two-pane grid: compose (left) / history (right) */}
        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-4 p-4 sm:px-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-6 lg:py-6">
          {/* LEFT: channel tabs + compose form */}
          <div className="rounded-2xl border bg-card shadow-sm lg:sticky lg:top-24 lg:self-start">
            <Tabs value={channel} onValueChange={(v) => setChannel(v as CommunicationChannel)}>
              <div className="border-b p-3">
                <TabsList className="grid h-auto w-full grid-cols-5 gap-1 p-1">
                  {CHANNEL_ORDER.map((value) => {
                    const meta = CHANNEL_META[value];
                    const Icon = meta.icon;
                    return (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="flex-col gap-1 rounded-lg px-1 py-2 text-[10px] font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: channel === value ? meta.tint : undefined }}
                        />
                        {meta.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {CHANNEL_ORDER.map((value) => (
                <TabsContent key={value} value={value} className="mt-0 space-y-4 p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHANNEL_META[value].tint }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {value === "INTERNAL_NOTE"
                        ? "Visible to your team only"
                        : value === "CALL"
                          ? "Log the outcome of a call"
                          : `Sending to ${value === "EMAIL" ? (data?.contact?.email ?? "—") : (data?.contact?.phone ?? "—")}`}
                    </p>
                  </div>

                  {value === "EMAIL" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className="text-xs">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject…"
                      />
                    </div>
                  )}

                  {value !== "INTERNAL_NOTE" && value !== "CALL" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Message type</Label>
                      <Select
                        value={messageType}
                        onValueChange={(v) => setMessageType(v as MessageType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MESSAGE_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="body" className="text-xs">
                      {value === "INTERNAL_NOTE"
                        ? "Note"
                        : value === "CALL"
                          ? "Call summary"
                          : "Message"}
                    </Label>
                    <Textarea
                      id="body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={
                        value === "INTERNAL_NOTE"
                          ? "Write an internal note…"
                          : value === "CALL"
                            ? "Log what was discussed…"
                            : "Write your message…"
                      }
                      className="min-h-32 resize-none"
                    />
                    {value === "INTERNAL_NOTE" && (
                      <p className="text-xs text-muted-foreground">
                        Only your team can see this — it won't be sent to the lead.
                      </p>
                    )}
                  </div>

                  {value !== "CALL" && value !== "INTERNAL_NOTE" && (
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_REPLIES.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setBody(q)}
                          className="flex items-center gap-1 rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Sparkle className="h-3 w-3" />
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {value !== "CALL" && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <input
                          id="attachment-input"
                          type="file"
                          className="hidden"
                          onChange={handleAttachmentPick}
                        />
                        {attachment ? (
                          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs">
                            <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="max-w-32 truncate">{attachment.name}</span>
                            <button
                              type="button"
                              onClick={() => setAttachment(null)}
                              className="text-muted-foreground hover:text-foreground"
                              aria-label="Remove attachment"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="attachment-input"
                            className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            Attach a file
                          </label>
                        )}
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-[11px] tabular-nums",
                          overLimit ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {body.length}/{MAX_CHARS}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      disabled={sending || (!body && !attachment && !subject)}
                      className="gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSend}
                      disabled={!canSend || sending || overLimit}
                      className="gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {sending
                        ? "Sending…"
                        : value === "INTERNAL_NOTE"
                          ? "Save note"
                          : value === "CALL"
                            ? "Log call"
                            : "Send"}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* RIGHT: combined chat history, all channels */}
          <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border bg-card lg:h-[calc(100vh-8.5rem)]">
            <div className="flex flex-wrap items-center gap-1.5 border-b px-4 py-3">
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filter === "ALL"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                All · {history.length}
              </button>
              {CHANNEL_ORDER.map((value) => {
                const meta = CHANNEL_META[value];
                const count = counts.get(value) ?? 0;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    disabled={count === 0}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40",
                      filter === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: meta.tint }}
                    />
                    {meta.label}
                    {count > 0 && <span className="tabular-nums opacity-70">{count}</span>}
                  </button>
                );
              })}
            </div>

            <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto dark:bg-background bg-background px-4 py-5 sm:px-6">

              {historyLoading && history.length === 0 && (
                <div className="space-y-3" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={cn("flex", i % 2 ? "justify-end" : "justify-start")}>
                      <div className="h-16 w-56 animate-pulse rounded-2xl bg-muted" />
                    </div>
                  ))}
                </div>
              )}

              {!historyLoading && filtered.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Inbox className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="max-w-64 text-xs text-muted-foreground">
                    Pick a channel on the left to reach out — every message across WhatsApp, email,
                    SMS, calls, and notes shows up here in one timeline.
                  </p>
                </div>
              )}

              {groupedHistory.map((group) => (
                <div key={group.label} className="space-y-3">
                  <div className="sticky top-0 z-10 flex items-center justify-center">
                    <span className="rounded-full border bg-card/90 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
                      {group.label}
                    </span>
                  </div>
                  {group.items.map((item) => {
                    const meta = CHANNEL_META[item.channel];
                    const Icon = meta.icon;
                    const outbound = item.direction === "OUTBOUND";
                    const isItemNote = item.channel === "INTERNAL_NOTE";
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex",
                          isItemNote ? "justify-center" : outbound ? "justify-end" : "justify-start",
                        )}
                      >
                        {isItemNote ? (
                          <div className="max-w-[85%] rounded-xl border border-dashed bg-black px-3 py-2 text-xs">
                            <div className="mb-1 flex items-center gap-1.5 font-medium text-muted-foreground">
                              <StickyNote className="h-3 w-3" /> Internal note
                            </div>
                            <p className="whitespace-pre-wrap text-foreground/80">{item.body}</p>
                            <p className="mt-1 text-right text-[10px] text-muted-foreground">
                              {format(new Date(item.created_at), "h:mm a")}
                            </p>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "max-w-[90%] rounded-md px-3.5 py-2.5 text-sm sm:max-w-[70%]",
                              outbound
                                ? "border border-primary/25 dark:bg-primary/15 bg-foreground dark:text-foreground text-background shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-xl backdrop-saturate-100 backdrop-saturate-500 dark:backdrop-brightness-50"
                                : "rounded-bl-sm border bg-card/70 text-card-foreground shadow-sm backdrop-blur-md",
                              outbound ? "rounded-br-sm" : "rounded-bl-sm",
                              outbound && item.status === "FAILED" && "ring-1 dark:ring-foreground/10",
                            )}
                          >
                            <div
                              className={cn(
                                "mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide",
                                outbound ? "text-primary-foreground/70" : "text-muted-foreground",
                              )}
                              style={{ color: outbound ? undefined : meta.tint }}
                            >
                              <Icon className="h-3 w-3" />
                              {meta.label}
                              <span className="opacity-70">
                                · {outbound ? "You" : (lead?.contact?.first_name?.split(" ")[0] ?? "Lead")}
                              </span>
                            </div>
                            {item.subject && <p className="mb-1 font-semibold">{item.subject}</p>}
                            <p className="whitespace-pre-wrap leading-relaxed">{item.body}</p>
                            <div
                              className={cn(
                                "mt-1 flex items-center justify-end gap-1 text-[10px]",
                                outbound ? "text-primary-foreground/70" : "text-muted-foreground",
                              )}
                            >
                              <span>{format(new Date(item.created_at), "h:mm a")}</span>
                              {outbound && <StatusTicks status={item.status} />}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

import { Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CommunicationChannel, GmailAccountStatus, MessageType } from "@/features/communications/communication.types";
import { GmailConnectBanner } from "./GmailConnectBanner";
import { CHANNEL_META, MAX_CHARS, MESSAGE_TYPE_OPTIONS, QUICK_REPLIES } from "@/utils/constants";
import { AttachmentPicker } from "./AttachmentPicker";
import { QuickReplies } from "./QuickReplies";

export function ComposeForm({channel,contactEmail,contactPhone,messageType,
  onMessageTypeChange,subject,onSubjectChange,body,onBodyChange,attachment,
  onAttachmentPick,onAttachmentRemove,gmailStatus,connectingGmail,onConnectGmail,sending,
  canSend,overLimit,onSend,onClear,
}: {
  channel: CommunicationChannel;
  contactEmail?: string | null;
  contactPhone?: string | null;
  messageType: MessageType;
  onMessageTypeChange: (v: MessageType) => void;
  subject: string;
  onSubjectChange: (v: string) => void;
  body: string;
  onBodyChange: (v: string) => void;
  attachment: File | null;
  onAttachmentPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAttachmentRemove: () => void;
  gmailStatus?: GmailAccountStatus | null;
  connectingGmail: boolean;
  onConnectGmail: () => void;
  sending: boolean;
  canSend: boolean;
  overLimit: boolean;
  onSend: () => void;
  onClear: () => void;
}) {
  const isEmail = channel === "EMAIL";
  const isNote = channel === "INTERNAL_NOTE";
  const isCall = channel === "CALL";
  const meta = CHANNEL_META[channel];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.tint }} />
        <p className="text-xs text-muted-foreground">
          {isNote
            ? "Visible to your team only"
            : isCall
              ? "Log the outcome of a call"
              : `Sending to ${isEmail ? (contactEmail ?? "—") : (contactPhone ?? "—")}`}
        </p>
      </div>

      {isEmail && (
        <>
          <GmailConnectBanner gmailStatus={gmailStatus} connecting={connectingGmail} onConnect={onConnectGmail} />
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => onSubjectChange(e.target.value)} placeholder="Subject…" />
          </div>
        </>
      )}

      {!isNote && !isCall && (
        <div className="space-y-1.5">
          <Label className="text-xs">Message type</Label>
          <Select value={messageType} onValueChange={(v) => onMessageTypeChange(v as MessageType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MESSAGE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="body" className="text-xs">
          {isNote ? "Note" : isCall ? "Call summary" : "Message"}
        </Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder={isNote ? "Write an internal note…" : isCall ? "Log what was discussed…" : "Write your message…"}
          className="min-h-32 resize-none"
        />
        {isNote && (
          <p className="text-xs text-muted-foreground">
            Only your team can see this — it won't be sent to the lead.
          </p>
        )}
      </div>

      {!isCall && !isNote && <QuickReplies onPick={onBodyChange} />}

      {!isCall && (
        <div className="flex items-center justify-between gap-3">
          <AttachmentPicker attachment={attachment} onPick={onAttachmentPick} onRemove={onAttachmentRemove} />
          <span className={cn("shrink-0 text-[11px] tabular-nums", overLimit ? "text-destructive" : "text-muted-foreground")}>
            {body.length}/{MAX_CHARS}
          </span>
        </div>
      )}

      <Separator />

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClear} disabled={sending || (!body && !attachment && !subject)} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Clear
        </Button>
        <Button size="sm" onClick={onSend} disabled={!canSend || sending || overLimit} className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          {sending ? "Sending…" : isNote ? "Save note" : isCall ? "Log call" : "Send"}
        </Button>
      </div>
    </div>
  );
}
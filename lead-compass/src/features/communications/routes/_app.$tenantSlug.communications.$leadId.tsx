import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { sendMessage, viewCommunications, fetchGmailStatus } from "@/features/communications/communication.slice";
import { communicationApis } from "@/features/communications/communication.service";
import { Communication, CommunicationChannel, CommunicationPayload, MessageType } from "@/features/communications/communication.types";
import { useCommunicationsPolling } from "@/features/communications/hooks/use-communication-polling";
import { MAX_CHARS } from "@/features/communications/utils/constants";
import { ConversationHeader } from "@/features/communications/components/ConversationHeader";
import { ChannelComposer } from "@/features/communications/components/ChannelComposer";
import { ChatHistory } from "@/features/communications/components/ChannelHisotry";
import { useNewReplyToast } from "@/features/communications/hooks/use-reply-toast";
import { useLead } from "@/features/leads/hooks/useLeads";

const EMPTY_HISTORY: Communication[] = [];

export default function Communications() {
  const dispatch = useAppDispatch();
  const { tenantSlug = "", leadId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: lead } = useLead(leadId);
  const history: Communication[] = useAppSelector((s) => s.communications?.data?.communications ?? EMPTY_HISTORY);
  const historyLoading = useAppSelector((s) => s.communications?.loading ?? false);
  const { data, gmailStatus } = useAppSelector((s) => s.communications);

  const [channel, setChannel] = useState<CommunicationChannel>("WHATSAPP");
  const [messageType, setMessageType] = useState<MessageType>("TEXT");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<CommunicationChannel | "ALL">("ALL");
  const [connectingGmail, setConnectingGmail] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useCommunicationsPolling(leadId);
  useNewReplyToast(history, lead?.contact?.first_name);

  useEffect(() => {
    dispatch(fetchGmailStatus());
  }, [dispatch]);

  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      toast.success("Gmail connected");
      dispatch(fetchGmailStatus());
      setSearchParams(
        (prev) => {
          prev.delete("connected");
          return prev;
        },
        { replace: true },
      );
    }
    const error = searchParams.get("error");
    if (error) {
      toast.error(`Failed to connect Gmail (${error})`);
      setSearchParams(
        (prev) => {
          prev.delete("error");
          return prev;
        },
        { replace: true },
      );
    }
  }, [searchParams, dispatch, setSearchParams]);

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

  const handleConnectGmail = async () => {
    if (connectingGmail) return;
    setConnectingGmail(true);
    try {
      const returnTo = `/${tenantSlug}/communications/${leadId}`;
      const response = await communicationApis.getGmailConnectUrl(returnTo);
      const url = response.data?.data?.url ?? response.data?.url;
      if (!url) throw new Error("No auth URL returned from server");
      window.location.href = url;
    } catch (err) {
      console.error("Failed to get Gmail auth URL", err);
      setConnectingGmail(false);
    }
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
      toast.success(isNote ? "Note saved" : `Message sent`);
      resetForm();
      dispatch(viewCommunications(leadId));
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const overLimit = body.length > MAX_CHARS;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen flex-col bg-muted/30">
        <ConversationHeader
          tenantSlug={tenantSlug}
          leadId={leadId}
          firstName={data?.contact?.first_name}
          lastName={data?.contact?.last_name}
          phone={data?.contact?.phone}
          email={data?.contact?.email}
          messageCount={history.length}
        />

        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-4 p-4 sm:px-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-6 lg:py-6">
          <ChannelComposer
            channel={channel}
            onChannelChange={setChannel}
            contactEmail={data?.contact?.email}
            contactPhone={data?.contact?.phone}
            messageType={messageType}
            onMessageTypeChange={setMessageType}
            subject={subject}
            onSubjectChange={setSubject}
            body={body}
            onBodyChange={setBody}
            attachment={attachment}
            onAttachmentPick={handleAttachmentPick}
            onAttachmentRemove={() => setAttachment(null)}
            gmailStatus={gmailStatus}
            connectingGmail={connectingGmail}
            onConnectGmail={handleConnectGmail}
            sending={sending}
            canSend={canSend}
            overLimit={overLimit}
            onSend={handleSend}
            onClear={resetForm}
          />

          <ChatHistory
            ref={scrollRef}
            history={history}
            filtered={filtered}
            filter={filter}
            onFilterChange={setFilter}
            historyLoading={historyLoading}
            leadFirstName={lead?.contact?.first_name?.split(" ")[0]}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
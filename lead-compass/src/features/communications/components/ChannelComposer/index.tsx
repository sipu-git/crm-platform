import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CommunicationChannel } from "@/features/communications/communication.types";
import { ComposeForm } from "./ComposeForm";
import { CHANNEL_ORDER } from "@/features/communications/utils/constants";

export function ChannelComposer({channel,onChannelChange,
  ...formProps
}: {
  channel: CommunicationChannel;
  onChannelChange: (c: CommunicationChannel) => void;
} & Omit<React.ComponentProps<typeof ComposeForm>, "channel">) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm lg:sticky lg:top-24 lg:self-start">
      <Tabs value={channel} onValueChange={(v) => onChannelChange(v as CommunicationChannel)}>
        <div className="border-b p-3">
          <TabsList className="grid h-auto w-full grid-cols-5 gap-1 p-1">
            {CHANNEL_ORDER.map((value) => {
              const meta = { WHATSAPP: "WhatsApp", EMAIL: "Email", CALL: "Call", SMS: "SMS", INTERNAL_NOTE: "Note" }[value];
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-col gap-1 rounded-lg px-1 py-2 text-[10px] font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {meta}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {CHANNEL_ORDER.map((value) => (
          <TabsContent key={value} value={value} className="mt-0">
            <ComposeForm channel={value} {...formProps} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
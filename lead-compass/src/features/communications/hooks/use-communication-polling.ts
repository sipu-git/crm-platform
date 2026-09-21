import { useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { viewCommunications, syncGmailInbox } from "@/features/communications/communication.slice";

export function useCommunicationsPolling(leadId: string) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!leadId) return;

        const runGmailSync = () => {
            dispatch(syncGmailInbox(leadId)).then((action) => {
                if (syncGmailInbox.fulfilled.match(action) && action.payload?.synced > 0) {
                    const n = action.payload.synced;
                    toast.success(`${n} new email${n > 1 ? "s" : ""} synced from Gmail`);
                }
            });
        };

        dispatch(viewCommunications(leadId));
        runGmailSync();

        const chatInterval = setInterval(() => dispatch(viewCommunications(leadId)), 5000);
        const gmailInterval = setInterval(runGmailSync, 15000);

        return () => {
            clearInterval(chatInterval);
            clearInterval(gmailInterval);
        };
    }, [dispatch, leadId]);
}
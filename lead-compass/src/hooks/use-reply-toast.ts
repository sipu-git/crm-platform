import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Communication } from "@/features/communications/communication.types";

export function useNewReplyToast(history: Communication[], leadFirstName?: string) {
  const knownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(history.map((c) => c.id));
    if (knownIdsRef.current.size > 0) {
      const newInbound = history.filter(
        (c) => c.direction === "INBOUND" && !knownIdsRef.current.has(c.id),
      );
      if (newInbound.length > 0) {
        toast.info(
          newInbound.length === 1
            ? `New reply from ${leadFirstName ?? "lead"}`
            : `${newInbound.length} new replies from ${leadFirstName ?? "lead"}`,
        );
      }
    }

    knownIdsRef.current = currentIds;
  }, [history, leadFirstName]);
}
import { isToday, isYesterday, format } from "date-fns";
import { Communication, CommunicationChannel } from "@/features/communications/communication.types";

export function dayLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

export function groupByDay(items: Communication[]) {
  const groups: { label: string; items: Communication[] }[] = [];
  for (const item of items) {
    const label = dayLabel(item.created_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

export function countByChannel(items: Communication[]) {
  const map = new Map<CommunicationChannel, number>();
  for (const h of items) map.set(h.channel, (map.get(h.channel) ?? 0) + 1);
  return map;
}
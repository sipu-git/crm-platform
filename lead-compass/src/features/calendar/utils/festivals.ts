import type { CalendarEvent } from "../types";

export function getFestivalEmoji(summary = ""): string {
  const s = summary.toLowerCase();

  if (s.includes("diwali") || s.includes("deepavali")) return "🪔";
  if (s.includes("holi")) return "🎨";
  if (s.includes("christmas") || s.includes("xmas")) return "🎄";
  if (s.includes("new year")) return "🎆";
  if (s.includes("eid") || s.includes("ramadan") || s.includes("fitr") || s.includes("adha")) return "🌙";
  if (s.includes("independence") || s.includes("republic")) return "🇮🇳";
  if (s.includes("thanksgiving")) return "🦃";
  if (s.includes("halloween")) return "🎃";
  if (s.includes("easter")) return "🐣";
  if (s.includes("good friday")) return "✝️";
  if (s.includes("gandhi")) return "🕊️";
  if (s.includes("raksha") || s.includes("bandhan")) return "🧵";
  if (s.includes("dussehra") || s.includes("dasara") || s.includes("vijayadashami")) return "🏹";
  if (s.includes("navratri") || s.includes("durga")) return "🔱";
  if (s.includes("ganesh") || s.includes("vinayaka")) return "🐘";
  if (s.includes("onam")) return "🌾";
  if (s.includes("pongal") || s.includes("sankranti")) return "🪁";
  if (s.includes("baisakhi") || s.includes("vesak")) return "☸️";
  if (s.includes("labor") || s.includes("labour") || s.includes("workers")) return "🛠️";
  if (s.includes("veterans") || s.includes("memorial")) return "🎖️";
  if (s.includes("valentine")) return "💖";

  return "🥳";
}

/**
 * Decorates raw holiday events fetched live from Google Calendar API with tags, categories, and festive emojis.
 */
export function decorateGoogleHolidays(holidays: CalendarEvent[]): CalendarEvent[] {
  return holidays.map((event) => {
    const emoji = getFestivalEmoji(event.summary);
    // Don't duplicate emoji if summary already has it
    const cleanSummary = event.summary.replace(/^[\p{Emoji}\s]+/u, "").trim();
    return {
      ...event,
      isHoliday: true,
      category: "holiday" as const,
      emoji,
      summary: `${emoji} ${cleanSummary || event.summary}`,
    };
  });
}


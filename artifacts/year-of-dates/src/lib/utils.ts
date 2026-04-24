import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateGoogleCalendarUrl(title: string, date: string, description: string): string {
  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
  const formatDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateICSContent(title: string, date: string, description: string): string {
  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
  const formatDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(title: string, date: string, description: string) {
  const content = generateICSContent(title, date, description);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getMonthGradient(month: number): string {
  const gradients: Record<number, string> = {
    1: "from-slate-600 to-slate-800",
    2: "from-amber-700 to-red-800",
    3: "from-emerald-700 to-green-900",
    4: "from-orange-600 to-red-800",
    5: "from-rose-700 to-red-900",
    6: "from-cyan-700 to-blue-800",
    7: "from-amber-600 to-orange-800",
    8: "from-violet-700 to-purple-900",
    9: "from-indigo-700 to-blue-900",
    10: "from-teal-700 to-emerald-900",
    11: "from-yellow-600 to-amber-800",
    12: "from-rose-600 to-pink-800",
  };
  return gradients[month] || "from-stone-600 to-stone-800";
}

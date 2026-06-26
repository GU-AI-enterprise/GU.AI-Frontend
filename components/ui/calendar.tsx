"use client";

import * as React from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type { DateRange };

function Calendar({
  className,
  classNames,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      className={cn(
        "p-1 [--rdp-accent-color:var(--primary)] [--rdp-accent-background-color:var(--accent)] [--rdp-range_middle-background-color:var(--accent)] [--rdp-today-color:var(--primary)]",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row gap-3",
        month: "space-y-2",
        month_caption: "flex items-center justify-center h-8 text-sm font-medium relative",
        nav: "flex items-center",
        button_previous: "absolute left-0.5 size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-30",
        button_next: "absolute right-0.5 size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-30",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground text-[11px] font-normal w-9 text-center",
        week: "flex w-full mt-1",
        day: "size-9 p-0 text-center text-sm relative",
        day_button: "size-9 rounded-full font-normal text-foreground hover:bg-secondary transition-colors cursor-pointer",
        today: "font-semibold text-primary",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30 pointer-events-none",
        hidden: "invisible",
        range_start: "rounded-l-full [&_button]:bg-primary [&_button]:text-primary-foreground",
        range_end: "rounded-r-full [&_button]:bg-primary [&_button]:text-primary-foreground",
        range_middle: "[&_button]:rounded-none [&_button]:bg-transparent",
        selected: "",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  );
}

export { Calendar };

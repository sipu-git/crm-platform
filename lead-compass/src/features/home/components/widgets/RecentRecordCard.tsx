import React from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight } from "lucide-react";
import type { RecentRecord } from "./types";

export const RecentRecordCard = React.memo(function RecentRecordCard({
  record,
}: {
  record: RecentRecord;
}) {
  return (
    <Link
      to={record.href}
      className="group flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted/50"
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-muted text-muted-foreground">
        <ArrowDownRight className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{record.label}</span>
      <span className="truncate text-[10px] text-muted-foreground">{record.kind}</span>
    </Link>
  );
});


import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Gauge, Check, AlertCircle } from "lucide-react";
import { LeadStatus } from "@/features/leads/types/lead.types";
import { STATUS_META, PIPELINE_STAGES } from "@/utils/status-meta";

interface LeadStageGaugeCardProps {
  status: LeadStatus;
  saving?: boolean;
  onStatusChange?: (newStatus: LeadStatus) => void;
}

interface GaugeSlice {
  name: string;
  status: LeadStatus;
  value: number;
  color: string;
  description: string;
}

const GAUGE_SECTORS: GaugeSlice[] = [
  { name: "New", status: "NEW", value: 25, color: "#3B82F6", description: "Initial contact received" },
  { name: "Contacted", status: "CONTRACTED", value: 25, color: "#F59E0B", description: "In active conversation" },
  { name: "Qualified", status: "QUALIFIED", value: 25, color: "#10B981", description: "Fit confirmed & ready to convert" },
  { name: "Converted", status: "CONVERTED", value: 25, color: "#6366F1", description: "Converted into a deal" },
];

function getNeedleAngle(status: LeadStatus): number {
  switch (status) {
    case "NEW":
      return 157.5;
    case "CONTRACTED":
      return 112.5;
    case "QUALIFIED":
      return 67.5;
    case "CONVERTED":
      return 22.5;
    case "DISQUALIFIED":
      return 180;
    default:
      return 157.5;
  }
}

export function LeadStageGaugeCard({ status, saving, onStatusChange }: LeadStageGaugeCardProps) {
  const currentStageIndex = PIPELINE_STAGES.indexOf(status);
  const isDisqualified = status === "DISQUALIFIED";
  const meta = STATUS_META[status];

  const needleAngle = useMemo(() => getNeedleAngle(status), [status]);

  // Dimensions for Recharts Pie Chart & Needle
  const cx = 140;
  const cy = 130;
  const iR = 60;
  const oR = 95;

  // Calculate Needle SVG coordinates
  const RADIAN = Math.PI / 180;
  const rad = needleAngle * RADIAN;
  const length = iR + (oR - iR) * 0.75;
  const r = 6;

  const xp = cx + length * Math.cos(rad);
  const yp = cy - length * Math.sin(rad);

  const x1 = cx + r * Math.sin(rad);
  const y1 = cy + r * Math.cos(rad);
  const x2 = cx - r * Math.sin(rad);
  const y2 = cy - r * Math.cos(rad);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Lead Stage Gauge</h3>
            <p className="text-xs text-muted-foreground">Pipeline stage progress</p>
          </div>
        </div>

        {/* Current Stage Badge */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isDisqualified
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-primary/10 text-primary border border-primary/20"
          }`}
        >
          {isDisqualified ? <AlertCircle className="h-3.5 w-3.5" /> : meta?.icon}
          {meta?.shortLabel ?? status}
        </span>
      </div>

      {/* Pie Chart with Needle Gauge Section */}
      <div className="flex flex-col items-center justify-center pt-4 pb-1">
        <div className="relative flex items-center justify-center">
          <PieChart width={280} height={150}>
            <Pie
              data={GAUGE_SECTORS}
              cx={cx}
              cy={cy}
              startAngle={180}
              endAngle={0}
              innerRadius={iR}
              outerRadius={oR}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {GAUGE_SECTORS.map((entry) => {
                const isActive = status === entry.status;
                return (
                  <Cell
                    key={entry.status}
                    fill={entry.color}
                    opacity={isDisqualified ? 0.4 : isActive ? 1 : 0.6}
                    className="transition-opacity duration-300 cursor-pointer"
                    onClick={() => !saving && onStatusChange?.(entry.status)}
                  />
                );
              })}
            </Pie>

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as GaugeSlice;
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                        {data.name}
                      </p>
                      <p className="text-muted-foreground mt-0.5">{data.description}</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Needle SVG Overlay */}
            <g className="transition-all duration-500 ease-out pointer-events-none">
              {/* Needle Shadow */}
              <path
                d={`M ${x1} ${y1 + 2} L ${xp} ${yp + 2} L ${x2} ${y2 + 2} Z`}
                fill="rgba(0, 0, 0, 0.15)"
              />
              {/* Needle Body */}
              <path
                d={`M ${x1} ${y1} L ${xp} ${yp} L ${x2} ${y2} Z`}
                fill={isDisqualified ? "#EF4444" : "#1E293B"}
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />
              {/* Central Pivot */}
              <circle cx={cx} cy={cy} r={r + 2} fill={isDisqualified ? "#EF4444" : "#1E293B"} stroke="#FFFFFF" strokeWidth={2} />
              <circle cx={cx} cy={cy} r={r - 2} fill="#38BDF8" />
            </g>
          </PieChart>
        </div>

        {/* Center Subtext */}
        <div className="text-center -mt-2 mb-3">
          <p className="text-xs font-semibold text-foreground">
            {isDisqualified ? (
              <span className="text-destructive font-medium">Disqualified Lead</span>
            ) : (
              <span>Stage {currentStageIndex + 1} of {PIPELINE_STAGES.length}: <strong className="text-primary">{meta?.shortLabel}</strong></span>
            )}
          </p>
          {meta?.guide && <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">{meta.guide}</p>}
        </div>
      </div>

      {/* Stage Legend / Interactive Selector */}
      <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-border/60">
        {GAUGE_SECTORS.map((sec, idx) => {
          const isActive = status === sec.status;
          const isPassed = currentStageIndex > idx && !isDisqualified;

          return (
            <button
              key={sec.status}
              type="button"
              disabled={saving}
              onClick={() => onStatusChange?.(sec.status)}
              className={`flex flex-col items-center justify-center rounded-lg p-1.5 transition-all text-center cursor-pointer disabled:opacity-50 ${
                isActive
                  ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
                  : "bg-muted/40 hover:bg-muted/80 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                {isPassed && <Check className="h-3 w-3 text-emerald-500" />}
              </div>
              <span className={`text-[11px] font-medium truncate w-full ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {sec.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


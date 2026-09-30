import { memo, useMemo } from "react";

export interface GaugeSector {
  name: string;
  color: string;
  value: number;
  /** Additional metadata */
  [key: string]: any;
}

export interface SVGGaugeChartProps {
  sectors: GaugeSector[];
  /** Active sector index (0-based), or compute from needleAngle */
  activeIndex?: number;
  /** Needle angle in degrees (0 = right, 90 = top, 180 = left). Semicircle: 0–180 */
  needleAngle: number;
  /** Gauge outer radius */
  outerRadius?: number;
  /** Gauge inner radius (donut thickness = outerRadius - innerRadius) */
  innerRadius?: number;
  /** Width of the SVG viewport */
  width?: number;
  /** Height of the SVG viewport */
  height?: number;
  /** Callback when a sector is clicked */
  onSectorClick?: (sector: GaugeSector, index: number) => void;
  /** Show tooltip on hover */
  renderTooltip?: (sector: GaugeSector) => React.ReactNode;
  /** Needle color */
  needleColor?: string;
  /** Whether the gauge is in a "disabled/error" state */
  isDisabled?: boolean;
  className?: string;
}

const RADIAN = Math.PI / 180;

/**
 * Pure SVG semi-circle gauge chart — no external charting dependency.
 * Replaces Recharts <PieChart> with startAngle={180} endAngle={0}.
 *
 * Renders a semicircle arc split into colored sectors with a needle pointer.
 */
export const SVGGaugeChart = memo(function SVGGaugeChart({
  sectors,
  activeIndex,
  needleAngle,
  outerRadius = 95,
  innerRadius = 60,
  width = 280,
  height = 150,
  onSectorClick,
  renderTooltip,
  needleColor = "#1E293B",
  isDisabled = false,
  className,
}: SVGGaugeChartProps) {
  const cx = width / 2;
  const cy = height - 20; // Center Y near bottom for semicircle

  // Build arc paths for each sector
  const arcs = useMemo(() => {
    const totalValue = sectors.reduce((acc, s) => acc + s.value, 0);
    const gapAngle = 3; // degrees gap between sectors
    const totalGap = gapAngle * (sectors.length - 1);
    const availableAngle = 180 - totalGap;

    let currentAngle = 180; // Start from left (180°)
    return sectors.map((sector, i) => {
      const sweepAngle = (sector.value / totalValue) * availableAngle;
      const startAngle = currentAngle;
      const endAngle = currentAngle - sweepAngle;
      currentAngle = endAngle - gapAngle;

      // Convert angles to SVG coordinates (0° = right, counter-clockwise)
      const startRad = startAngle * RADIAN;
      const endRad = endAngle * RADIAN;

      // Outer arc
      const ox1 = cx + outerRadius * Math.cos(startRad);
      const oy1 = cy - outerRadius * Math.sin(startRad);
      const ox2 = cx + outerRadius * Math.cos(endRad);
      const oy2 = cy - outerRadius * Math.sin(endRad);

      // Inner arc (reversed direction)
      const ix1 = cx + innerRadius * Math.cos(endRad);
      const iy1 = cy - innerRadius * Math.sin(endRad);
      const ix2 = cx + innerRadius * Math.cos(startRad);
      const iy2 = cy - innerRadius * Math.sin(startRad);

      const largeArc = sweepAngle > 180 ? 1 : 0;

      // Path: outer arc → line to inner end → inner arc (reverse) → close
      const d = [
        `M ${ox1} ${oy1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${ox2} ${oy2}`,
        `L ${ix1} ${iy1}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${ix2} ${iy2}`,
        `Z`,
      ].join(" ");

      return { d, sector, i, startAngle, endAngle };
    });
  }, [sectors, cx, cy, outerRadius, innerRadius]);

  // Needle geometry
  const needle = useMemo(() => {
    const rad = needleAngle * RADIAN;
    const length = innerRadius + (outerRadius - innerRadius) * 0.75;
    const r = 6;

    const tipX = cx + length * Math.cos(rad);
    const tipY = cy - length * Math.sin(rad);

    const baseX1 = cx + r * Math.sin(rad);
    const baseY1 = cy + r * Math.cos(rad);
    const baseX2 = cx - r * Math.sin(rad);
    const baseY2 = cy - r * Math.cos(rad);

    return {
      path: `M ${baseX1} ${baseY1} L ${tipX} ${tipY} L ${baseX2} ${baseY2} Z`,
      shadowPath: `M ${baseX1} ${baseY1 + 2} L ${tipX} ${tipY + 2} L ${baseX2} ${baseY2 + 2} Z`,
      cx,
      cy,
      r,
    };
  }, [needleAngle, cx, cy, innerRadius, outerRadius]);

  return (
    <div className={`relative inline-flex justify-center ${className || ""}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Sector arcs */}
        {arcs.map(({ d, sector, i }) => {
          const isActive = activeIndex === i;
          return (
            <path
              key={i}
              d={d}
              fill={sector.color}
              opacity={isDisabled ? 0.4 : isActive ? 1 : 0.6}
              className="transition-opacity duration-300 cursor-pointer"
              onClick={() => onSectorClick?.(sector, i)}
            />
          );
        })}

        {/* Needle shadow */}
        <path d={needle.shadowPath} fill="rgba(0,0,0,0.15)" className="pointer-events-none" />

        {/* Needle body */}
        <path
          d={needle.path}
          fill={isDisabled ? "#EF4444" : needleColor}
          stroke="#FFFFFF"
          strokeWidth={1.5}
          className="pointer-events-none transition-all duration-500 ease-out"
        />

        {/* Central pivot */}
        <circle
          cx={needle.cx}
          cy={needle.cy}
          r={needle.r + 2}
          fill={isDisabled ? "#EF4444" : needleColor}
          stroke="#FFFFFF"
          strokeWidth={2}
          className="pointer-events-none"
        />
        <circle
          cx={needle.cx}
          cy={needle.cy}
          r={needle.r - 2}
          fill="#38BDF8"
          className="pointer-events-none"
        />
      </svg>
    </div>
  );
});

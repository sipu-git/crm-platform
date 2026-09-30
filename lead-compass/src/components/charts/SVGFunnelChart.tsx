import { memo, useState, useMemo, useCallback } from "react";

export interface FunnelDataPoint {
  name: string;
  value: number;
  fill: string;
  /** Additional metadata for tooltip rendering */
  [key: string]: any;
}

export interface SVGFunnelChartProps {
  data: FunnelDataPoint[];
  width?: number;
  height?: number;
  /** Custom tooltip renderer receives the hovered data point */
  renderTooltip?: (item: FunnelDataPoint) => React.ReactNode;
  /** Label text inside funnel segments */
  labelFormatter?: (item: FunnelDataPoint) => string;
  className?: string;
}

/**
 * Pure SVG funnel chart – zero-dependency, no DOM overhead beyond a single <svg>.
 * Replaces Recharts <FunnelChart> for pipeline visualizations.
 *
 * Each segment is drawn as a trapezoid whose top-width is proportional to
 * `data[n].value / maxValue` and bottom-width is `data[n+1].value / maxValue`.
 */
export const SVGFunnelChart = memo(function SVGFunnelChart({
  data,
  width = 320,
  height = 200,
  renderTooltip,
  labelFormatter,
  className,
}: SVGFunnelChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  const segments = useMemo(() => {
    const gap = 3;
    const segCount = data.length;
    if (segCount === 0) return [];

    const totalGap = gap * (segCount - 1);
    const segHeight = (height - totalGap) / segCount;
    const centerX = width / 2;
    const maxHalfWidth = (width * 0.85) / 2;

    return data.map((item, i) => {
      const topRatio = item.value / maxValue;
      const bottomRatio = i < segCount - 1 ? data[i + 1].value / maxValue : topRatio * 0.6;

      const topHalf = maxHalfWidth * Math.max(topRatio, 0.15);
      const bottomHalf = maxHalfWidth * Math.max(bottomRatio, 0.1);

      const y = i * (segHeight + gap);

      // Trapezoid points: top-left, top-right, bottom-right, bottom-left
      const points = [
        `${centerX - topHalf},${y}`,
        `${centerX + topHalf},${y}`,
        `${centerX + bottomHalf},${y + segHeight}`,
        `${centerX - bottomHalf},${y + segHeight}`,
      ].join(" ");

      const labelText = labelFormatter ? labelFormatter(item) : item.name;
      const labelY = y + segHeight / 2;

      return { item, points, labelText, labelY, y, segHeight, i };
    });
  }, [data, width, height, maxValue, labelFormatter]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, idx: number) => {
      setHoveredIdx(idx);
      const rect = (e.currentTarget as SVGElement).closest("svg")?.getBoundingClientRect();
      if (rect) {
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(() => setHoveredIdx(null), []);

  return (
    <div className={`relative ${className || ""}`} style={{ width: "100%", maxWidth: width }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        {segments.map(({ item, points, labelText, labelY, i }) => (
          <g
            key={i}
            onMouseEnter={(e) => handleMouseEnter(e, i)}
            onMouseLeave={handleMouseLeave}
            className="cursor-pointer transition-opacity duration-150"
            opacity={hoveredIdx !== null && hoveredIdx !== i ? 0.65 : 1}
          >
            <polygon
              points={points}
              fill={item.fill}
              rx={4}
              className="transition-all duration-200"
            />
            <text
              x={width / 2}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize={12}
              fontWeight={700}
              fontFamily="Inter, system-ui, sans-serif"
              className="pointer-events-none drop-shadow-sm select-none"
            >
              {labelText}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && renderTooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          {renderTooltip(data[hoveredIdx])}
        </div>
      )}
    </div>
  );
});

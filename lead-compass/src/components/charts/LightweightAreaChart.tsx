import { useEffect, useRef, useCallback, memo } from "react";
import {createChart,AreaSeries,LineSeries,type IChartApi,
  type ISeriesApi,type AreaData,type LineData,type Time,
  type SeriesType,ColorType,LineStyle,CrosshairMode} from "lightweight-charts";

export interface AreaSeriesConfig {
  data: { time: string; value: number }[];
  color?: string;
  topColor?: string;
  bottomColor?: string;
  lineWidth?: 1 | 2 | 3 | 4;
  name?: string;
  lastValueVisible?: boolean;
  priceLineVisible?: boolean;
}

export interface LineOverlayConfig {
  data: { time: string; value: number }[];
  color?: string;
  lineWidth?: 1 | 2 | 3 | 4;
  lineStyle?: "solid" | "dashed" | "dotted";
  name?: string;
}

export interface LightweightAreaChartProps {
  series: AreaSeriesConfig[];
  lineOverlays?: LineOverlayConfig[];
  height?: number;
  /** Format Y-axis tick values */
  yAxisFormatter?: (value: number) => string;
  /** Format tooltip values */
  tooltipFormatter?: (value: number) => string;
  /** Auto-fit content to width */
  autoFit?: boolean;
  className?: string;
}

function getThemeColors() {
  const isDark = document.documentElement.classList.contains("dark");
  return {
    textColor: isDark ? "#a1a1aa" : "#71717a",
    gridColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    crosshairColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
  };
}

const LINE_STYLE_MAP = {
  solid: LineStyle.Solid,
  dashed: LineStyle.Dashed,
  dotted: LineStyle.Dotted,
} as const;

export const LightweightAreaChart = memo(function LightweightAreaChart({
  series,
  lineOverlays = [],
  height = 288,
  yAxisFormatter,
  tooltipFormatter,
  autoFit = true,
  className,
}: LightweightAreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<SeriesType>[]>([]);
  const lineRefs = useRef<ISeriesApi<SeriesType>[]>([]);

  const createChartInstance = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Cleanup previous
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRefs.current = [];
      lineRefs.current = [];
    }

    const theme = getThemeColors();

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: theme.textColor,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11,
        attributionLogo: false,
      } as any,
      grid: {
        vertLines: { color: theme.gridColor },
        horzLines: { color: theme.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: theme.crosshairColor, width: 1, style: LineStyle.Dashed },
        horzLine: { color: theme.crosshairColor, width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: {
        borderVisible: false,
        entireTextOnly: true,
        scaleMargins: {
          top: 0.12,
          bottom: 0.08,
        },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 0,
        tickMarkFormatter: (time: any) => {
          if (typeof time === "string") {
            const [y, m] = time.split("-").map(Number);
            if (y && m) {
              const d = new Date(y, m - 1, 1);
              return d.toLocaleString("en-US", { month: "short", year: "2-digit" });
            }
          } else if (time && typeof time === "object" && "year" in time && "month" in time) {
            const d = new Date(time.year, time.month - 1, 1);
            return d.toLocaleString("en-US", { month: "short", year: "2-digit" });
          }
          return String(time);
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    // Add area series using v5 API: chart.addSeries(AreaSeries, options)
    for (const s of series) {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: s.color || "hsl(221, 83%, 53%)",
        lineWidth: s.lineWidth || 2,
        lineType: 2, // Curved line for aesthetic smooth trend
        topColor: s.topColor || `${s.color || "hsl(221, 83%, 53%)"}33`,
        bottomColor: s.bottomColor || `${s.color || "hsl(221, 83%, 53%)"}00`,
        lastValueVisible: s.lastValueVisible ?? true,
        priceLineVisible: s.priceLineVisible ?? true,
        priceLineColor: s.color || "hsl(221, 83%, 53%)",
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: {
          type: "custom" as const,
          formatter: (price: number) =>
            yAxisFormatter ? yAxisFormatter(price) : (tooltipFormatter ? tooltipFormatter(price) : price.toLocaleString("en-IN")),
        },
      });

      const chartData: AreaData<Time>[] = s.data
        .map((d) => ({
          time: d.time as Time,
          value: d.value,
        }))
        .filter((item, idx, arr) => idx === arr.findIndex((x) => x.time === item.time))
        .sort((a, b) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0));

      areaSeries.setData(chartData);
      seriesRefs.current.push(areaSeries);
    }

    // Add line overlays (e.g., target line) using v5 API
    for (const l of lineOverlays) {
      const lineSeries = chart.addSeries(LineSeries, {
        color: l.color || "#F59E0B",
        lineWidth: l.lineWidth || 2,
        lineType: 2, // Curved line
        lineStyle: l.lineStyle ? LINE_STYLE_MAP[l.lineStyle] : LineStyle.Dashed,
        crosshairMarkerVisible: false,
        priceFormat: {
          type: "custom" as const,
          formatter: (price: number) =>
            yAxisFormatter ? yAxisFormatter(price) : (tooltipFormatter ? tooltipFormatter(price) : price.toLocaleString("en-IN")),
        },
      });

      const lineData: LineData<Time>[] = l.data
        .map((d) => ({
          time: d.time as Time,
          value: d.value,
        }))
        .filter((item, idx, arr) => idx === arr.findIndex((x) => x.time === item.time))
        .sort((a, b) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0));

      lineSeries.setData(lineData);
      lineRefs.current.push(lineSeries);
    }

    if (autoFit) {
      chart.timeScale().fitContent();
    }

    chartRef.current = chart;
  }, [series, lineOverlays, height, yAxisFormatter, tooltipFormatter, autoFit]);

  // Create chart on mount / data change
  useEffect(() => {
    createChartInstance();
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [createChartInstance]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !chartRef.current) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && chartRef.current) {
        chartRef.current.applyOptions({ width: entry.contentRect.width });
        chartRef.current.timeScale().fitContent();
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [series]); // Re-observe after chart recreate

  // Dark mode observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (chartRef.current) {
        const theme = getThemeColors();
        chartRef.current.applyOptions({
          layout: {
            background: { type: ColorType.Solid, color: "transparent" },
            textColor: theme.textColor,
          },
          grid: {
            vertLines: { color: theme.gridColor },
            horzLines: { color: theme.gridColor },
          },
        });
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef} className={`relative [&_#tv-attr-logo]:!hidden [&_a#tv-attr-logo]:!hidden ${className || ""}`} />;
});

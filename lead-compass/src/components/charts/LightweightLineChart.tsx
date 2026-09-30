import { useEffect, useRef, useCallback, memo } from "react";
import {
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type Time,
  type SeriesType,
  ColorType,
  CrosshairMode,
  LineStyle,
} from "lightweight-charts";

export interface LineDataPoint {
  time: string;
  value: number;
}

export interface LightweightLineChartProps {
  data: LineDataPoint[];
  height?: number;
  color?: string;
  lineWidth?: 1 | 2 | 3 | 4;
  showDots?: boolean;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
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

export const LightweightLineChart = memo(function LightweightLineChart({
  data,
  height = 220,
  color = "#3b82f6",
  lineWidth = 2,
  showDots = true,
  yAxisFormatter,
  tooltipFormatter,
  className,
}: LightweightLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);

  const createChartInstance = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
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
        vertLines: { visible: false },
        horzLines: { color: theme.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: theme.crosshairColor, width: 1, style: LineStyle.Dashed },
        horzLine: { color: theme.crosshairColor, width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        tickMarkFormatter: (time: any) => {
          if (typeof time === "string") {
            const parts = time.split("-").map(Number);
            const y = parts[0];
            const m = parts[1];
            const day = parts[2] || 1;
            if (y && m) {
              const d = new Date(y, m - 1, day);
              return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
            }
          } else if (time && typeof time === "object" && "year" in time && "month" in time) {
            const day = "day" in time ? (time as any).day : 1;
            const d = new Date(time.year, time.month - 1, day);
            return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
          }
          return String(time);
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    // v5 API: chart.addSeries(LineSeries, options)
    const lineSeries = chart.addSeries(LineSeries, {
      color,
      lineWidth,
      crosshairMarkerVisible: showDots,
      crosshairMarkerRadius: showDots ? 4 : 0,
      priceFormat: {
        type: "custom" as const,
        formatter: (price: number) =>
          tooltipFormatter ? tooltipFormatter(price) : price.toLocaleString(),
      },
    });

    const chartData: LineData<Time>[] = data
      .map((d) => ({
        time: d.time as Time,
        value: d.value,
      }))
      .filter((item, idx, arr) => idx === arr.findIndex((x) => x.time === item.time))
      .sort((a, b) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0));

    lineSeries.setData(chartData);
    seriesRef.current = lineSeries;
    chart.timeScale().fitContent();
    chartRef.current = chart;
  }, [data, height, color, lineWidth, showDots, yAxisFormatter, tooltipFormatter]);

  useEffect(() => {
    createChartInstance();
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [createChartInstance]);

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
  }, [data]);

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

/**
 * Chart UI wrapper — lightweight replacement.
 *
 * The original file re-exported Recharts primitives (ResponsiveContainer, Tooltip, Legend, etc.)
 * wrapped in a ChartContainer with CSS-variable based theming.
 *
 * After the full migration to lightweight-charts + custom SVG charts, this wrapper
 * is no longer imported by any component. It is kept as a thin stub that re-exports
 * the new chart components from `@/components/charts` so existing `@/components/ui/chart`
 * import paths remain valid if they are ever used again.
 *
 * If you need Recharts compatibility in the future, install `recharts` and restore
 * the original file from version control.
 */

export type { LightweightAreaChartProps as ChartProps } from "@/components/charts";
export {
  LightweightAreaChart,
  LightweightBarChart,
  LightweightLineChart,
  SVGFunnelChart,
  SVGGaugeChart,
} from "@/components/charts";

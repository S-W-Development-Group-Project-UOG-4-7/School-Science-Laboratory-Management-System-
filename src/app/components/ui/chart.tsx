"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "./utils";

/* ---------------- Theme ---------------- */

const THEMES = { light: "", dark: ".dark" } as const;

/* ---------------- Types ---------------- */

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

/* ---------------- Container ---------------- */

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/* ---------------- Styles ---------------- */

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, cfg]) => cfg.color || cfg.theme
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => {
    const color =
      item.theme?.[theme as keyof typeof item.theme] || item.color;
    return color ? `  --color-${key}: ${color};` : "";
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
}

/* ---------------- Tooltip ---------------- */

const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: React.ReactNode;
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  nameKey,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className={cn(
        "border bg-background rounded-lg px-2.5 py-1.5 text-xs shadow",
        className
      )}
    >
      {!hideLabel && label && (
        <div className="mb-1 font-medium">{label}</div>
      )}

      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                {!hideIndicator && (
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <span className="text-muted-foreground">
                  {itemConfig?.label || item.name}
                </span>
              </div>
              <span className="font-mono tabular-nums">
                {item.value?.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Legend ---------------- */

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendContentProps {
  payload?: any[];
  verticalAlign?: "top" | "bottom";
  className?: string;
  hideIcon?: boolean;
  nameKey?: string;
}

function ChartLegendContent({
  payload,
  verticalAlign = "bottom",
  className,
  hideIcon = false,
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload || payload.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div key={index} className="flex items-center gap-1.5">
            {!hideIcon && (
              <div
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Helper ---------------- */

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  if (!payload || typeof payload !== "object") return undefined;

  const data =
    payload.payload && typeof payload.payload === "object"
      ? payload.payload
      : undefined;

  let configKey = key;

  if (payload[key]) configKey = payload[key];
  else if (data && data[key]) configKey = data[key];

  return config[configKey] || config[key];
}

/* ---------------- Exports ---------------- */

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

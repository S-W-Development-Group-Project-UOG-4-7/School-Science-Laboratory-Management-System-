'use client';

import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { toast } from "sonner";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;

export function TimetableGridEditor({
  title,
  subtitle,
  periods = [1,2,3,4,5,6,7,8],
  initialGrid,
  onSave,
  showIntervalAfter = 4,
}: {
  title: string;
  subtitle?: string;
  periods?: number[];
  initialGrid?: Record<string, string>;
  onSave: (grid: Record<string, string>) => Promise<void>;
  showIntervalAfter?: number | null; // put "INTERVAL" row after this period
}) {
  const [grid, setGrid] = useState<Record<string, string>>(initialGrid ?? {});
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const out: Array<{ type: "period" | "interval"; period?: number }> = [];
    for (const p of periods) {
      out.push({ type: "period", period: p });
      if (showIntervalAfter && p === showIntervalAfter) out.push({ type: "interval" });
    }
    return out;
  }, [periods, showIntervalAfter]);

  const setCell = (day: string, period: number, value: string) => {
    const key = `${day}-${period}`;
    setGrid((prev) => ({ ...prev, [key]: value }));
  };

  const getCell = (day: string, period: number) => {
    const key = `${day}-${period}`;
    return grid[key] ?? "";
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(grid);
      toast.success("Timetable saved successfully");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save timetable");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-auto rounded-xl border">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3 w-32">Period</th>
                {DAYS.map((d) => (
                  <th key={d} className="text-left p-3">{d}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => {
                if (r.type === "interval") {
                  return (
                    <tr key={`interval-${idx}`} className="bg-muted/20">
                      <td className="p-3 font-semibold">INTERVAL</td>
                      <td className="p-3" colSpan={DAYS.length}>
                        Break / Interval
                      </td>
                    </tr>
                  );
                }

                const p = r.period!;
                return (
                  <tr key={`p-${p}`} className="border-t">
                    <td className="p-3 font-medium">Period {p}</td>

                    {DAYS.map((d) => (
                      <td key={`${d}-${p}`} className="p-2">
                        <Input
                          className="h-10 rounded-xl"
                          placeholder="ex: 8A"
                          value={getCell(d, p)}
                          onChange={(e) => setCell(d, p, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleSave} disabled={saving} className="rounded-xl">
            {saving ? "Saving..." : "Save Timetable"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

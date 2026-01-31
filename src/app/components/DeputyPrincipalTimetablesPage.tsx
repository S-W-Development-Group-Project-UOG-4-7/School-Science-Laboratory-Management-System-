"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";
import { CalendarDays, FlaskConical, Users } from "lucide-react";

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

const DAYS: { label: string; value: DayOfWeek }[] = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const INTERVAL_AFTER = 4;

type Teacher = { id: string; name: string; email: string };
type Lab = { id: string; name: string };

type TeacherTT = {
  id: string;
  teacherId: string;
  day: DayOfWeek;
  period: number;
  subject: string; // stored like "Science | 8A"
  grade: number;
  available: boolean;
  teacher?: Teacher;
};

type LabTT = {
  id: string;
  labId: string;
  day: DayOfWeek;
  period: number;
  available: boolean;
  classCode?: string | null;
  lab?: Lab;
};

function getKey(day: DayOfWeek, period: number) {
  return `${day}-${period}`;
}

function parseClassCodeFromTeacherSubject(subject: string, fallbackGrade?: number) {
  // subject stored as "Science | 8A"
  const s = (subject ?? "").trim();
  const parts = s.split("|").map((p) => p.trim());
  const maybe = parts.length > 1 ? parts[1] : "";
  const m = maybe.toUpperCase().match(/^(\d{1,2})([A-Z])$/);
  if (m) return `${m[1]}${m[2]}`;

  // fallback if old data had only grade without section:
  return fallbackGrade ? String(fallbackGrade) : "";
}

function parseClassCode(code: string) {
  const v = (code ?? "").trim().toUpperCase();
  const m = v.match(/^(\d{1,2})([A-Z])$/);
  if (!m) return null;
  return { grade: Number(m[1]), classCode: `${Number(m[1])}${m[2]}` };
}

function getAllowedGradesForLabName(labName: string) {
  const name = (labName ?? "").toLowerCase();

  // ✅ your rule:
  if (name.includes("science")) return [6, 7, 8, 9,10,11];
  if (name.includes("physics") || name.includes("chemistry") || name.includes("biology")) return [12, 13];

  // fallback: allow 6-13 if lab name not matched
  return [6,7,8,9,10,11,12,13];
}

function GridEditor({
  title,
  description,
  icon,
  selectedLabel,
  onSave,
  grid,
  setGrid,
  placeholder,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  selectedLabel: React.ReactNode;
  onSave: () => Promise<void>;
  grid: Record<string, string>;
  setGrid: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  placeholder: string;
}) {
  const rows = useMemo(() => {
    const out: Array<{ type: "period" | "interval"; period?: number }> = [];
    for (const p of PERIODS) {
      out.push({ type: "period", period: p });
      if (p === INTERVAL_AFTER) out.push({ type: "interval" });
    }
    return out;
  }, []);

  const setCell = (day: DayOfWeek, period: number, value: string) => {
    const k = getKey(day, period);
    setGrid((prev) => ({ ...prev, [k]: value.toUpperCase() }));
  };

  const getCell = (day: DayOfWeek, period: number) => grid[getKey(day, period)] ?? "";

  return (
    <Card className="rounded-2xl border">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              {icon} {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          <div className="text-right">
            {selectedLabel}
            <div className="mt-3 flex justify-end">
              <Button
                onClick={onSave}
                className="rounded-xl px-5 py-2 font-semibold shadow-sm"
              >
                Save Timetable
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Periods: 1–8</Badge>
          <Badge variant="secondary">Interval after Period 4</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-auto rounded-xl border">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3 w-36">Period</th>
                {DAYS.map((d) => (
                  <th key={d.value} className="text-left p-3">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => {
                if (r.type === "interval") {
                  return (
                    <tr key={`interval-${idx}`} className="bg-muted/20 border-t">
                      <td className="p-3 font-semibold">INTERVAL</td>
                      <td className="p-3 text-muted-foreground" colSpan={DAYS.length}>
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
                      <td key={`${d.value}-${p}`} className="p-2">
                        <Input
                          className="h-10 rounded-xl text-center font-medium"
                          placeholder={placeholder}
                          value={getCell(d.value, p)}
                          onChange={(e) => setCell(d.value, p, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Tip: Leave a cell empty if that period has no allocation.
        </p>
      </CardContent>
    </Card>
  );
}

export function DeputyPrincipalTimetablesPage({ userRole }: { userRole: UserRole }) {
  const isDeputy = userRole === "admin" || userRole === "deputy-principal";

  const [loading, setLoading] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [teacherTT, setTeacherTT] = useState<TeacherTT[]>([]);
  const [labTT, setLabTT] = useState<LabTT[]>([]);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedLabId, setSelectedLabId] = useState<string>("");

  // ✅ grids MUST be above any useEffect that uses them
  const [teacherGrid, setTeacherGrid] = useState<Record<string, string>>({});
  const [labGrid, setLabGrid] = useState<Record<string, string>>({});

  async function refreshAll() {
    setLoading(true);
    try {
      const [tRes, lRes, ttRes, ltRes] = await Promise.all([
        fetch("/api/teachers"),
        fetch("/api/labs"),
        fetch("/api/timetables/teacher"),
        fetch("/api/timetables/lab"),
      ]);

      // if API returns HTML error page, json() will fail — show clear error
      const [t, l, tt, lt] = await Promise.all([
        tRes.json(),
        lRes.json(),
        ttRes.json(),
        ltRes.json(),
      ]);

      setTeachers(Array.isArray(t) ? t : []);
      setLabs(Array.isArray(l) ? l : []);
      setTeacherTT(Array.isArray(tt) ? tt : []);
      setLabTT(Array.isArray(lt) ? lt : []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load timetables");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isDeputy) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeputy]);

  // default selections after load
  useEffect(() => {
    if (!selectedTeacherId && teachers.length) setSelectedTeacherId(teachers[0].id);
  }, [teachers, selectedTeacherId]);

  useEffect(() => {
    if (!selectedLabId && labs.length) setSelectedLabId(labs[0].id);
  }, [labs, selectedLabId]);

  // ✅ rebuild Teacher grid (ONLY ONCE)
  useEffect(() => {
    if (!selectedTeacherId) return;

    const map: Record<string, string> = {};
    for (const r of teacherTT.filter((x) => x.teacherId === selectedTeacherId)) {
      map[getKey(r.day, r.period)] = parseClassCodeFromTeacherSubject(r.subject, r.grade);
    }
    setTeacherGrid(map);
  }, [selectedTeacherId, teacherTT]);

  // ✅ rebuild Lab grid (ONLY ONCE)
useEffect(() => {
  if (!selectedLabId) return;

  const map: Record<string, string> = {};
  for (const r of labTT.filter((x) => x.labId === selectedLabId)) {
    map[getKey(r.day, r.period)] = (r.classCode ?? "").toUpperCase();
  }
  setLabGrid(map);
}, [selectedLabId, labTT]);

  async function saveTeacherGrid() {
    if (!selectedTeacherId) return;

    for (const [k, v] of Object.entries(teacherGrid)) {
      const value = (v ?? "").trim();
      if (!value) continue;
      if (!/^\d{1,2}[A-Z]$/i.test(value)) {
        toast.error(`Invalid class format at ${k}. Use like 8A / 11D`);
        return;
      }
    }

    const res = await fetch("/api/timetables/teacher/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId: selectedTeacherId, grid: teacherGrid }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data?.error ?? "Failed to save teacher timetable");
      return;
    }

    toast.success("Teacher timetable saved");
    refreshAll();
  }

async function saveLabGrid() {
  if (!selectedLabId) return;

  const labName = selectedLab?.name ?? "";
  const allowed = getAllowedGradesForLabName(labName);

  for (const [k, v] of Object.entries(labGrid)) {
    const value = (v ?? "").trim();
    if (!value) continue;

    const parsed = parseClassCode(value);
    if (!parsed) {
      toast.error(`Invalid class at ${k}. Use like 12A / 13B`);
      return;
    }

    if (!allowed.includes(parsed.grade)) {
      toast.error(`Invalid grade for ${labName}. Allowed: ${allowed.join(", ")}`);
      return;
    }
  }

  const res = await fetch("/api/timetables/lab/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ labId: selectedLabId, grid: labGrid }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    toast.error(data?.error ?? "Failed to save lab timetable");
    return;
  }

  toast.success("Lab timetable saved");
  refreshAll();
}

  if (!isDeputy) {
    return (
      <Card className="border border-gray-200 rounded-2xl">
        <CardContent className="p-6 text-gray-700">
          You don’t have permission to access Deputy Principal timetable management.
        </CardContent>
      </Card>
    );
  }

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const selectedLab = labs.find((l) => l.id === selectedLabId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Annual Timetable Setup</h2>
          <p className="text-gray-600">
            Deputy Principal manages the repeating weekly pattern for the full academic year
            (Teacher timetable + Lab timetable).
          </p>
        </div>

        <Button variant="outline" onClick={refreshAll} disabled={loading} className="rounded-xl">
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Teacher Selection
            </CardTitle>
            <CardDescription>Select a teacher and fill their timetable grid.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>Teacher</Label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger className="bg-white rounded-xl">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTeacher ? (
              <p className="text-sm text-muted-foreground mt-2">
                Editing: <span className="font-medium text-gray-900">{selectedTeacher.name}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" /> Lab Selection
            </CardTitle>
            <CardDescription>Select a lab and fill the lab timetable grid.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>Lab</Label>
            <Select value={selectedLabId} onValueChange={setSelectedLabId}>
              <SelectTrigger className="bg-white rounded-xl">
                <SelectValue placeholder="Select lab" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {labs.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedLab ? (
              <p className="text-sm text-muted-foreground mt-2">
                Editing: <span className="font-medium text-gray-900">{selectedLab.name}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* BOTH grids */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GridEditor
          title="Teacher Timetable"
          description="Teachers can only book lab slots for the class assigned here."
          icon={<CalendarDays className="w-5 h-5 text-blue-600" />}
          selectedLabel={
            <div className="text-sm text-muted-foreground">
              Teacher:{" "}
              <span className="font-medium text-gray-900">
                {selectedTeacher?.name ?? "—"}
              </span>
            </div>
          }
          grid={teacherGrid}
          setGrid={setTeacherGrid}
          onSave={saveTeacherGrid}
          placeholder="ex: 8A"
        />

        <GridEditor
          title="Lab Timetable"
          description="Allocate lab slots for grades (only grade number)."
          icon={<FlaskConical className="w-5 h-5 text-indigo-600" />}
          selectedLabel={
            <div className="text-sm text-muted-foreground">
              Lab:{" "}
              <span className="font-medium text-gray-900">
                {selectedLab?.name ?? "—"}
              </span>
            </div>
          }
          grid={labGrid}
          setGrid={setLabGrid}
          onSave={saveLabGrid}
          placeholder="ex: 9A"
        />
      </div>
    </div>
  );
}

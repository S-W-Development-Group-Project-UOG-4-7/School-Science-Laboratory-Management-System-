"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Calendar, Plus, Search, Clock, Users, Building2, User, CheckCircle, XCircle } from "lucide-react";

// Types
type UserRole = "admin" | "teacher" | "lab-assistant" | "deputy-principal";
// ---------------- Types that match backend ----------------
type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
type PracticalStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";

type Teacher = { id: string; name: string; email: string; role: string };
type Lab = { id: string; name: string };

type Practical = {
  id: string;
  title: string;
  date: string; // ISO
  day: DayOfWeek;
  period: number;
  grade: number;
  subject: string;
  maxStudents: number;
  status: PracticalStatus;
  notes?: string | null;
  teacherId: string;
  labId: string;
  teacher?: { id: string; name: string; email: string; role: string };
  lab?: { id: string; name: string };
};

interface SchedulePageProps {
  userRole: UserRole; // "admin" | "teacher" | "lab-assistant" etc (your app type)
}

// ---------------- Helpers ----------------
const DAYS: { label: string; value: DayOfWeek }[] = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
];

// Map periods to time labels (edit to your school periods)
const PERIODS: { period: number; label: string }[] = [
  { period: 1, label: "Period 1" },
  { period: 2, label: "Period 2" },
  { period: 3, label: "Period 3" },
  { period: 4, label: "Period 4" },
  { period: 5, label: "Period 5" },
  { period: 6, label: "Period 6" },
  { period: 7, label: "Period 7" },
  { period: 8, label: "Period 8" },
];

function subjectBadge(subject: string) {
  switch (subject) {
    case "Chemistry":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "Physics":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Biology":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Science":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function statusBadge(status: PracticalStatus) {
  switch (status) {
    case "UPCOMING":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "COMPLETED":
      return "bg-green-100 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function isoToYMD(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function SchedulePage({ userRole }: SchedulePageProps) {
  const canSchedule = userRole === "teacher" || userRole === "admin" || userRole === "lab-assistant";
  const canAdmin = userRole === "admin" || userRole === "deputy-principal"; // if you have this role name, keep; otherwise remove

  // data
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [practicals, setPracticals] = useState<Practical[]>([]);

  // UI state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | PracticalStatus>("all");
  const [showPast, setShowPast] = useState(false);

  // Schedule form (slot based)
  const [form, setForm] = useState({
    title: "",
    grade: "",
    subject: "" as "" | "Physics" | "Chemistry" | "Biology" | "Science",
    teacherId: "",
    labId: "",
    day: "" as "" | DayOfWeek,
    date: "", // yyyy-mm-dd
    period: "" as "" | string, // store string then Number()
    maxStudents: 30,
    notes: "",
  });

  const [availablePeriods, setAvailablePeriods] = useState<number[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);

  // Available subjects by grade (your rule)
  const availableSubjects = useMemo(() => {
    const g = Number(form.grade);
    if (!g) return [];
    if (g >= 6 && g <= 9) return ["Science"] as const;
    if (g >= 10 && g <= 13) return ["Physics", "Chemistry", "Biology"] as const;
    return [];
  }, [form.grade]);

  // Auto-fix subject based on grade
  useEffect(() => {
    const g = Number(form.grade);
    if (!g) return;

    if (g >= 6 && g <= 9) {
      if (form.subject !== "Science") setForm((p) => ({ ...p, subject: "Science" }));
    } else if (g >= 10 && g <= 13) {
      if (form.subject === "Science") setForm((p) => ({ ...p, subject: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.grade]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [tRes, lRes, pRes] = await Promise.all([
        fetch("/api/teachers"),
        fetch("/api/labs"),
        fetch("/api/practicals"),
      ]);

      const [t, l, p] = await Promise.all([tRes.json(), lRes.json(), pRes.json()]);

      setTeachers(Array.isArray(t) ? t : []);
      setLabs(Array.isArray(l) ? l : []);
      setPracticals(Array.isArray(p) ? p : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // Slot availability call
  async function loadAvailablePeriods() {
    if (!form.teacherId || !form.labId || !form.day) {
      setAvailablePeriods([]);
      return;
    }
    setSlotLoading(true);
    try {
      const res = await fetch("/api/available-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: form.teacherId,
          labId: form.labId,
          day: form.day,
        }),
      });

      const data = await res.json();
      setAvailablePeriods(Array.isArray(data?.availablePeriods) ? data.availablePeriods : []);
    } finally {
      setSlotLoading(false);
    }
  }

  // reload periods when teacher/lab/day changes
  useEffect(() => {
    loadAvailablePeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.teacherId, form.labId, form.day]);

  const filtered = useMemo(() => {
    return practicals.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.teacher?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.lab?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === "all" || p.status === filterStatus;

      // showPast false => hide completed/cancelled
      const matchesPast = showPast ? true : p.status === "UPCOMING";

      return matchesSearch && matchesStatus && matchesPast;
    });
  }, [practicals, searchQuery, filterStatus, showPast]);

  const totalUpcoming = useMemo(() => practicals.filter((p) => p.status === "UPCOMING").length, [practicals]);
  const totalCompleted = useMemo(() => practicals.filter((p) => p.status === "COMPLETED").length, [practicals]);
  const totalCancelled = useMemo(() => practicals.filter((p) => p.status === "CANCELLED").length, [practicals]);

  async function createPractical(e: React.FormEvent) {
    e.preventDefault();

    // Basic front validation
    if (!form.title || !form.grade || !form.subject || !form.teacherId || !form.labId || !form.day || !form.date || !form.period) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      title: form.title,
      grade: Number(form.grade),
      subject: form.subject,
      teacherId: form.teacherId,
      labId: form.labId,
      day: form.day,
      date: form.date, // yyyy-mm-dd (backend converts)
      period: Number(form.period),
      maxStudents: Number(form.maxStudents),
      notes: form.notes,
    };

    const res = await fetch("/api/practicals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Failed to schedule");
      return;
    }

    // Refresh list
    await fetchAll();

    // Reset
    setForm({
      title: "",
      grade: "",
      subject: "",
      teacherId: "",
      labId: "",
      day: "",
      date: "",
      period: "",
      maxStudents: 30,
      notes: "",
    });
    setAvailablePeriods([]);
    setIsAddOpen(false);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">Lab Scheduling</h2>
          <p className="text-gray-600">
            Teachers can schedule lab sessions only in slots allowed by the main lab timetable + teacher timetable.
          </p>
        </div>

        {canSchedule && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Practical
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
              <DialogHeader>
                <DialogTitle>Schedule a Practical</DialogTitle>
                <DialogDescription>
                  Select grade, teacher, lab and day. The system will show only valid periods.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createPractical} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <Label>Title *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Microscope Practical"
                    />
                  </div>

                  {/* Grade */}
                  <div>
                    <Label>Grade *</Label>
                    <Select value={form.grade} onValueChange={(v) => setForm((p) => ({ ...p, grade: v }))}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                          <SelectItem key={g} value={String(g)}>
                            Grade {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label>Subject *</Label>
                    {availableSubjects.length === 1 ? (
                      <Input value={availableSubjects[0]} readOnly className="bg-gray-50" />
                    ) : (
                      <Select
                        value={form.subject}
                        onValueChange={(v) => setForm((p) => ({ ...p, subject: v as any }))}
                        disabled={!form.grade}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder={!form.grade ? "Select grade first" : "Select subject"} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          {availableSubjects.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Teacher */}
                  <div>
                    <Label>Teacher *</Label>
                    <Select value={form.teacherId} onValueChange={(v) => setForm((p) => ({ ...p, teacherId: v }))}>
                      <SelectTrigger className="bg-white">
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
                  </div>

                  {/* Lab */}
                  <div>
                    <Label>Lab *</Label>
                    <Select value={form.labId} onValueChange={(v) => setForm((p) => ({ ...p, labId: v }))}>
                      <SelectTrigger className="bg-white">
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
                  </div>

                  {/* Day */}
                  <div>
                    <Label>Day *</Label>
                    <Select value={form.day} onValueChange={(v) => setForm((p) => ({ ...p, day: v as DayOfWeek, period: "" }))}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {DAYS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date */}
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: choose a date that matches the selected day (e.g. Monday date for MONDAY).
                    </p>
                  </div>

                  {/* Available Period */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Available Periods *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={loadAvailablePeriods}
                        disabled={slotLoading || !form.teacherId || !form.labId || !form.day}
                      >
                        {slotLoading ? "Checking..." : "Refresh"}
                      </Button>
                    </div>

                    {!form.teacherId || !form.labId || !form.day ? (
                      <div className="mt-2 text-sm text-gray-600 border border-gray-200 rounded-lg p-3 bg-gray-50">
                        Select <b>Teacher</b>, <b>Lab</b> and <b>Day</b> to see available periods.
                      </div>
                    ) : availablePeriods.length === 0 ? (
                      <div className="mt-2 text-sm text-red-700 border border-red-200 rounded-lg p-3 bg-red-50">
                        No valid periods available for this Teacher + Lab + Day.
                      </div>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PERIODS.filter((p) => availablePeriods.includes(p.period)).map((p) => (
                          <button
                            key={p.period}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, period: String(p.period) }))}
                            className={[
                              "border rounded-lg px-3 py-2 text-left transition",
                              form.period === String(p.period)
                                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50",
                            ].join(" ")}
                          >
                            <div className="font-medium text-gray-900">{p.label}</div>
                            <div className="text-xs text-gray-600">Click to select</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Max Students */}
                  <div>
                    <Label>Max Students *</Label>
                    <Input
                      type="number"
                      value={form.maxStudents}
                      onChange={(e) => setForm((p) => ({ ...p, maxStudents: Number(e.target.value || 0) }))}
                      min={1}
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Any instructions for students..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button className="bg-blue-600 hover:bg-blue-700" type="submit">
                    Schedule
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{totalUpcoming}</p>
            </div>
            <Calendar className="w-6 h-6 text-blue-600" />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{totalCancelled}</p>
            </div>
            <XCircle className="w-6 h-6 text-red-600" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-10 bg-white"
              placeholder="Search by title, teacher, lab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="w-44 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch checked={showPast} onCheckedChange={setShowPast} />
              <Label className="text-sm">Show past</Label>
            </div>

            <Button variant="outline" onClick={fetchAll} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Practicals list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-10 text-center text-gray-600">
              No practicals found.
            </CardContent>
          </Card>
        ) : (
          filtered.map((p) => (
            <Card key={p.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <Badge variant="outline" className={subjectBadge(p.subject)}>
                        {p.subject}
                      </Badge>
                      <Badge variant="outline">Grade {p.grade}</Badge>
                      <Badge variant="outline" className={statusBadge(p.status)}>
                        {p.status}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50">
                        Period {p.period}
                      </Badge>
                    </div>

                    <div className="text-lg font-semibold text-gray-900">{p.title}</div>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{isoToYMD(p.date)} • {p.day}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Period {p.period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{p.teacher?.name || "Teacher"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span>{p.lab?.name || "Lab"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>Max {p.maxStudents}</span>
                      </div>
                    </div>

                    {p.notes ? (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        {p.notes}
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

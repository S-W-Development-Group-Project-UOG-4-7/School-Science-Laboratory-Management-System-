"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { UserRole } from '@/lib/types';


type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

const DAYS: { label: string; value: DayOfWeek }[] = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

type Teacher = { id: string; name: string; email: string };
type Lab = { id: string; name: string };

type TeacherTT = {
  id: string;
  teacherId: string;
  day: DayOfWeek;
  period: number;
  subject: string;
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
  lab?: Lab;
};

export function DeputyPrincipalTimetablesPage({ userRole }: { userRole: UserRole }) {
  const isDeputy = userRole === "admin" || userRole === "deputy-principal";
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [teacherTT, setTeacherTT] = useState<TeacherTT[]>([]);
  const [labTT, setLabTT] = useState<LabTT[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");
  const [selectedLabId, setSelectedLabId] = useState<string>("all");

  // dialogs
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [addLabOpen, setAddLabOpen] = useState(false);
  const [editTeacherOpen, setEditTeacherOpen] = useState(false);
  const [editLabOpen, setEditLabOpen] = useState(false);

  // add forms
  const [newTeacherSlot, setNewTeacherSlot] = useState({
    teacherId: "",
    day: "" as "" | DayOfWeek,
    period: "" as "" | string,
    subject: "",
    grade: "" as "" | string,
  });

  const [newLabSlot, setNewLabSlot] = useState({
    labId: "",
    day: "" as "" | DayOfWeek,
    period: "" as "" | string,
  });

  // edit forms
  const [editTeacherSlot, setEditTeacherSlot] = useState<TeacherTT | null>(null);
  const [editLabSlot, setEditLabSlot] = useState<LabTT | null>(null);

  async function refreshAll() {
    setLoading(true);
    try {
      const [tRes, lRes, ttRes, ltRes] = await Promise.all([
        fetch("/api/teachers"),
        fetch("/api/labs"),
        fetch("/api/timetables/teacher"),
        fetch("/api/timetables/lab"),
      ]);

      const [t, l, tt, lt] = await Promise.all([tRes.json(), lRes.json(), ttRes.json(), ltRes.json()]);

      setTeachers(Array.isArray(t) ? t : []);
      setLabs(Array.isArray(l) ? l : []);
      setTeacherTT(Array.isArray(tt) ? tt : []);
      setLabTT(Array.isArray(lt) ? lt : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isDeputy) refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeputy]);

  const teacherRows = useMemo(() => {
    const rows = selectedTeacherId === "all" ? teacherTT : teacherTT.filter(r => r.teacherId === selectedTeacherId);
    return rows.slice().sort((a, b) => (a.day > b.day ? 1 : -1) || a.period - b.period);
  }, [teacherTT, selectedTeacherId]);

  const labRows = useMemo(() => {
    const rows = selectedLabId === "all" ? labTT : labTT.filter(r => r.labId === selectedLabId);
    return rows.slice().sort((a, b) => (a.day > b.day ? 1 : -1) || a.period - b.period);
  }, [labTT, selectedLabId]);

  // ---------- Teacher timetable CRUD ----------
  async function addTeacherTimetableSlot() {
    if (!newTeacherSlot.teacherId || !newTeacherSlot.day || !newTeacherSlot.period || !newTeacherSlot.subject || !newTeacherSlot.grade) {
      alert("Fill teacher, day, period, subject, grade");
      return;
    }

    const res = await fetch("/api/teacher-timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacherId: newTeacherSlot.teacherId,
        day: newTeacherSlot.day,
        period: Number(newTeacherSlot.period),
        subject: newTeacherSlot.subject,
        grade: Number(newTeacherSlot.grade),
        available: true,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Failed to add slot");

    setNewTeacherSlot({ teacherId: "", day: "", period: "", subject: "", grade: "" });
    setAddTeacherOpen(false);
    refreshAll();
  }

  async function updateTeacherSlot() {
    if (!editTeacherSlot) return;

    const res = await fetch(`/api/teacher-timetable/${editTeacherSlot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day: editTeacherSlot.day,
        period: editTeacherSlot.period,
        subject: editTeacherSlot.subject,
        grade: editTeacherSlot.grade,
        available: editTeacherSlot.available,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Update failed");

    setEditTeacherOpen(false);
    setEditTeacherSlot(null);
    refreshAll();
  }

  async function deleteTeacherSlot(id: string) {
    if (!confirm("Delete this teacher timetable slot?")) return;

    const res = await fetch(`/api/teacher-timetable/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Delete failed");

    refreshAll();
  }

  // ---------- Lab timetable CRUD ----------
  async function addLabTimetableSlot() {
    if (!newLabSlot.labId || !newLabSlot.day || !newLabSlot.period) {
      alert("Fill lab, day, period");
      return;
    }

    const res = await fetch("/api/lab-timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        labId: newLabSlot.labId,
        day: newLabSlot.day,
        period: Number(newLabSlot.period),
        available: true,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Failed to add slot");

    setNewLabSlot({ labId: "", day: "", period: "" });
    setAddLabOpen(false);
    refreshAll();
  }

  async function updateLabSlot() {
    if (!editLabSlot) return;

    const res = await fetch(`/api/lab-timetable/${editLabSlot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day: editLabSlot.day,
        period: editLabSlot.period,
        available: editLabSlot.available,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Update failed");

    setEditLabOpen(false);
    setEditLabSlot(null);
    refreshAll();
  }

  async function deleteLabSlot(id: string) {
    if (!confirm("Delete this lab timetable slot?")) return;

    const res = await fetch(`/api/lab-timetable/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Delete failed");

    refreshAll();
  }

  if (!isDeputy) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6 text-gray-700">
          You don’t have permission to access Deputy Principal timetable management.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Timetable Management</h2>
          <p className="text-gray-600">
            Deputy Principal can manage teacher timetables and main lab timetable (Add / Edit / Delete).
          </p>
        </div>
        <Button variant="outline" onClick={refreshAll} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Tabs defaultValue="teacher" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teacher">Teacher Timetable</TabsTrigger>
          <TabsTrigger value="lab">Main Lab Timetable</TabsTrigger>
        </TabsList>

        {/* ---------------- Teacher Timetable ---------------- */}
        <TabsContent value="teacher">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle>Science Teachers Timetable</CardTitle>
              <CardDescription>Add / Edit / Delete weekly teacher slots</CardDescription>

              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="w-full md:w-80">
                  <Label>Filter Teacher</Label>
                  <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Teachers</SelectItem>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} ({t.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={addTeacherOpen} onOpenChange={setAddTeacherOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border border-gray-200 shadow-xl max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Add Teacher Timetable Slot</DialogTitle>
                      <DialogDescription>Set teacher weekly availability slot.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Label>Teacher *</Label>
                        <Select value={newTeacherSlot.teacherId} onValueChange={(v) => setNewTeacherSlot(p => ({ ...p, teacherId: v }))}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {teachers.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Day *</Label>
                        <Select value={newTeacherSlot.day} onValueChange={(v) => setNewTeacherSlot(p => ({ ...p, day: v as DayOfWeek }))}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Select day" /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Period *</Label>
                        <Select value={newTeacherSlot.period} onValueChange={(v) => setNewTeacherSlot(p => ({ ...p, period: v }))}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Select period" /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {PERIODS.map(p => <SelectItem key={p} value={String(p)}>Period {p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Subject *</Label>
                        <Input
                          placeholder="Science / Physics / Chemistry / Biology"
                          value={newTeacherSlot.subject}
                          onChange={(e) => setNewTeacherSlot(p => ({ ...p, subject: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>Grade *</Label>
                        <Select value={newTeacherSlot.grade} onValueChange={(v) => setNewTeacherSlot(p => ({ ...p, grade: v }))}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Select grade" /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {[6,7,8,9,10,11,12,13].map(g => <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={addTeacherTimetableSlot}>
                        Save Slot
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.teacher?.name ?? r.teacherId}</TableCell>
                      <TableCell>{r.day}</TableCell>
                      <TableCell>Period {r.period}</TableCell>
                      <TableCell><Badge variant="outline">{r.subject}</Badge></TableCell>
                      <TableCell>Grade {r.grade}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditTeacherSlot(r); setEditTeacherOpen(true); }}
                        >
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => deleteTeacherSlot(r.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {teacherRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-600 py-8">
                        No teacher timetable slots found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Edit Teacher Slot Dialog */}
              <Dialog open={editTeacherOpen} onOpenChange={setEditTeacherOpen}>
                <DialogContent className="bg-white border border-gray-200 shadow-xl max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Edit Teacher Slot</DialogTitle>
                    <DialogDescription>Update day/period/subject/grade.</DialogDescription>
                  </DialogHeader>

                  {!editTeacherSlot ? null : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Day</Label>
                        <Select
                          value={editTeacherSlot.day}
                          onValueChange={(v) => setEditTeacherSlot(p => p ? ({ ...p, day: v as DayOfWeek }) : p)}
                        >
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Period</Label>
                        <Select
                          value={String(editTeacherSlot.period)}
                          onValueChange={(v) => setEditTeacherSlot(p => p ? ({ ...p, period: Number(v) }) : p)}
                        >
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {PERIODS.map(p => <SelectItem key={p} value={String(p)}>Period {p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={editTeacherSlot.subject}
                          onChange={(e) => setEditTeacherSlot(p => p ? ({ ...p, subject: e.target.value }) : p)}
                        />
                      </div>

                      <div>
                        <Label>Grade</Label>
                        <Select
                          value={String(editTeacherSlot.grade)}
                          onValueChange={(v) => setEditTeacherSlot(p => p ? ({ ...p, grade: Number(v) }) : p)}
                        >
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {[6,7,8,9,10,11,12,13].map(g => <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={updateTeacherSlot}>
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Lab Timetable ---------------- */}
        <TabsContent value="lab">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle>Main Lab Timetable</CardTitle>
              <CardDescription>Add / Edit / Delete lab weekly availability slots</CardDescription>

              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="w-full md:w-80">
                  <Label>Filter Lab</Label>
                  <Select value={selectedLabId} onValueChange={setSelectedLabId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Labs</SelectItem>
                      {labs.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={addLabOpen} onOpenChange={setAddLabOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border border-gray-200 shadow-xl max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Add Lab Timetable Slot</DialogTitle>
                      <DialogDescription>Set lab weekly availability slot.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Label>Lab *</Label>
                        <Select value={newLabSlot.labId} onValueChange={(v) => setNewLabSlot(p => ({ ...p, labId: v }))}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Select lab" /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {labs.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Day *</Label>
                        <Select value={newLabSlot.day} onValueChange={(v) => setNewLabSlot(p => ({ ...p, day: v as DayOfWeek }))}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Select day" /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Period *</Label>
                        <Select value={newLabSlot.period} onValueChange={(v) => setNewLabSlot(p => ({ ...p, period: v }))}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Select period" /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {PERIODS.map(p => <SelectItem key={p} value={String(p)}>Period {p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={addLabTimetableSlot}>
                        Save Slot
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lab</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.lab?.name ?? r.labId}</TableCell>
                      <TableCell>{r.day}</TableCell>
                      <TableCell>Period {r.period}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditLabSlot(r); setEditLabOpen(true); }}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => deleteLabSlot(r.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {labRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-600 py-8">
                        No lab timetable slots found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Edit Lab Slot Dialog */}
              <Dialog open={editLabOpen} onOpenChange={setEditLabOpen}>
                <DialogContent className="bg-white border border-gray-200 shadow-xl max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Edit Lab Slot</DialogTitle>
                    <DialogDescription>Update day/period.</DialogDescription>
                  </DialogHeader>

                  {!editLabSlot ? null : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Day</Label>
                        <Select
                          value={editLabSlot.day}
                          onValueChange={(v) => setEditLabSlot(p => p ? ({ ...p, day: v as DayOfWeek }) : p)}
                        >
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Period</Label>
                        <Select
                          value={String(editLabSlot.period)}
                          onValueChange={(v) => setEditLabSlot(p => p ? ({ ...p, period: Number(v) }) : p)}
                        >
                          <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {PERIODS.map(p => <SelectItem key={p} value={String(p)}>Period {p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={updateLabSlot}>
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

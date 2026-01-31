'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import {
  CalendarDays,
  Users,
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

type Page =
  | 'home'
  | 'practicals'
  | 'inventory'
  | 'schedule'
  | 'settings'
  | 'requests'
  | 'users'

export default function DeputyDashboardHome({
  userName,
  onNavigate,
}: {
  userName: string
  onNavigate: (page: Page) => void
}) {
  // Later: replace these numbers with real API data
  const cards = [
    { title: 'Scheduled Sessions', value: '6', icon: CalendarDays, tone: 'border-blue-200 bg-blue-50/60 text-blue-700' },
    { title: 'Teacher Timetables Updated', value: '12', icon: Users, tone: 'border-green-200 bg-green-50/60 text-green-700' },
    { title: 'Lab Timetables Updated', value: '4', icon: FlaskConical, tone: 'border-indigo-200 bg-indigo-50/60 text-indigo-700' },
    { title: 'Available Slots Found', value: '9', icon: Clock, tone: 'border-amber-200 bg-amber-50/60 text-amber-700' },
  ]

  const recent = [
    { title: 'Teacher timetable updated (MONDAY · Period 3)', time: '2 hours ago', icon: CheckCircle2, tone: 'bg-blue-50 text-blue-700' },
    { title: 'Lab timetable updated (Physics Lab · Period 4)', time: '5 hours ago', icon: CheckCircle2, tone: 'bg-indigo-50 text-indigo-700' },
    { title: 'Scheduling conflict detected and reviewed', time: 'Yesterday', icon: AlertTriangle, tone: 'bg-amber-50 text-amber-700' },
  ]

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  })()

  return (
    <div className="space-y-6">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white p-6 shadow-lg"
      >
        <p className="text-sm opacity-90">{greeting}, {userName}!</p>
        <h1 className="text-xl sm:text-2xl font-semibold mt-1">
          Welcome to your Deputy Principal dashboard
        </h1>
        <p className="text-sm opacity-90 mt-2">
          Manage teacher & lab timetables and schedule practical sessions efficiently.
        </p>
      </motion.div>

      {/* Cards (like Principal dashboard style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.title} className={`rounded-2xl border ${c.tone}`}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">{c.title}</p>
                  <p className="text-2xl font-semibold mt-1">{c.value}</p>
                </div>
                <div className="rounded-xl bg-white/60 p-3 border">
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl border">
        <CardContent className="p-5 space-y-4">
          <p className="font-medium">Quick Actions</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="rounded-xl h-12"
              onClick={() => onNavigate('schedule')}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Manage Schedule
            </Button>

            <Button
              variant="outline"
              className="rounded-xl h-12"
              onClick={() => onNavigate('schedule')}
            >
              <Users className="w-4 h-4 mr-2" />
              Teacher Timetables
            </Button>

            <Button
              variant="outline"
              className="rounded-xl h-12"
              onClick={() => onNavigate('schedule')}
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Lab Timetables
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Scheduling focused */}
      <Card className="rounded-2xl border">
        <CardContent className="p-5 space-y-4">
          <p className="font-medium">Recent Activity</p>

          <div className="space-y-3">
            {recent.map((r) => {
              const Icon = r.icon
              return (
                <div key={r.title} className={`rounded-xl p-4 flex items-start gap-3 ${r.tone}`}>
                  <Icon className="w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm opacity-80">{r.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns"
import { Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTheme } from "next-themes";

type WorkDay = {
  date: string
  isWorkDay: boolean
}

export default function WorkCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workDays, setWorkDays] = useState<WorkDay[]>([])
  const [stats, setStats] = useState({ workDays: 0, nonWorkDays: 0 })
  const { theme } = useTheme();

  // Load saved work days from localStorage on component mount
  useEffect(() => {
    const savedWorkDays = localStorage.getItem("workDays")
    if (savedWorkDays) {
      setWorkDays(JSON.parse(savedWorkDays))
    }
  }, [])

  // Save work days to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("workDays", JSON.stringify(workDays))

    // Calculate stats
    const workCount = workDays.filter((day) => day.isWorkDay).length
    setStats({
      workDays: workCount,
      nonWorkDays: workDays.length - workCount,
    })
  }, [workDays])

  // Get all days in the current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Navigate to previous month
  const prevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  // Navigate to next month
  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  // Toggle work/non-work status for a day
  const toggleWorkDay = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    const existingDay = workDays.find((day) => day.date === dateString)

    if (existingDay) {
      // Toggle existing day
      setWorkDays(workDays.map((day) => (day.date === dateString ? { ...day, isWorkDay: !day.isWorkDay } : day)))
    } else {
      // Add new day (default to work day)
      setWorkDays([...workDays, { date: dateString, isWorkDay: true }])
    }
  }

  // Check if a day is marked as a work day
  const isWorkDay = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    const day = workDays.find((day) => day.date === dateString)
    return day ? day.isWorkDay : false
  }

  // Check if a day has been marked at all
  const isMarked = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return workDays.some((day) => day.date === dateString)
  }

  return (
    <div className="container mx-auto">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Work Day Tracker
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                  <span className="sr-only">Stats</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Your Statistics</DialogTitle>
                  <DialogDescription>Summary of your work and non-work days</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Work Days</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.workDays}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Non-Work Days</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.nonWorkDays}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Simply mark days as work or non-work days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <Button variant="outline" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
            <Button variant="outline" onClick={nextMonth}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-medium text-sm py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, index) => {
              const isWork = isWorkDay(day)
              const marked = isMarked(day)

              return (
                <button
                  key={index}
                  onClick={() => toggleWorkDay(day)}
                  className={`
                    aspect-square p-1 rounded-md relative
                    ${!isSameMonth(day, currentDate) ? "opacity-50" : ""}
                    ${marked ? (isWork ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600") : (theme=="light" ? "hover:bg-gray-100" : "hover:bg-gray-900")}
                    transition-colors
                  `}
                >
                  <div className="flex flex-col h-full justify-between">
                    <span className="text-sm">{format(day, "d")}</span>
                    {marked && <span className="text-xs mt-1">{isWork ? "Work" : "Off"}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
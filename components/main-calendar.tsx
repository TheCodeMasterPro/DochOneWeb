"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "./ui/badge"

type FutureReportStatus = "בתפקיד מחוץ ליחידה" | "אחרי תורנות / משמרת" | "חופשה שנתית"

export default function WorkCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { theme } = useTheme();
  const [reportedDates, setReportedDates] = useState<Record<string, FutureReportStatus>>({})

  // Load saved work days from localStorage on component mount
  useEffect(() => {
    const savedFutureReports = localStorage.getItem("futureReports")
    if (savedFutureReports) {
      setReportedDates(JSON.parse(savedFutureReports))
    }
  }, [])

  // Save work days to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("futureReports", JSON.stringify(reportedDates))
  }, [reportedDates])

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

  const sendFutureReport = (date: Date, status: FutureReportStatus) => {
    setReportedDates((prev) => ({
      ...prev,
      [date.toISOString()]: status,
    }))
  }

  return (
    <div className="container mx-auto">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between ml-auto">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              דוח 1
              <Calendar className="h-6 w-6" />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <Button variant="outline" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              חודש קדימה
            </Button>
            <h2 className="text-center text-xl font-semibold mx-4" dir="rtl">{format(currentDate, "MMMM yyyy").replace('January', 'ינואר').replace('February', 'פברואר').replace('March', 'מרץ').replace('April', 'אפריל').replace('May', 'מאי').replace('June', 'יוני').replace('July', 'יולי').replace('August', 'אוגוסט').replace('September', 'ספטמבר').replace('October', 'אוקטובר').replace('November', 'נובמבר').replace('December', 'דצמבר')}</h2>
            <Button variant="outline" onClick={nextMonth}>
            חודש אחורה
            <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2" dir="rtl">
            {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map((day) => (
              <div key={day} className="font-medium text-sm py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1" dir="rtl">
            {daysInMonth.map((day, index) => {

              return (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <button
                      key={index}
                      className={`
                        aspect-square p-1 rounded-md relative
                        ${!isSameMonth(day, currentDate) ? "opacity-50" : ""}
                        hover:bg-primary-50
                        transition-colors
                      `}
                    >
                      <div className="flex flex-col h-full justify-between">
                        <span className="text-sm">{format(day, "d")}</span>
                        {reportedDates[day.toISOString()] ? <Badge className="hidden sm:block">{reportedDates[day.toISOString()]}</Badge> : null}
                        {reportedDates[day.toISOString()] ? <Badge className="block sm:hidden"></Badge> : null}
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Details for {format(day, "MMMM d, yyyy")}</DialogTitle>
                      <DialogDescription>
                          <span className={`text-sm`}>
                            {reportedDates[day.toISOString()]}
                          </span>
                      </DialogDescription>
                    </DialogHeader>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="mt-4">
                          ?איפה תהיו בתאריך היעד
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40">
                        <DropdownMenuGroup>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>מחוץ ליחידה</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={(e) => sendFutureReport(day, "בתפקיד מחוץ ליחידה")}>בתפקיד מחוץ ליחידה</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => sendFutureReport(day, "אחרי תורנות / משמרת")}>אחרי תורנות / משמרת</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuItem onClick={() => sendFutureReport(day, "חופשה שנתית")}>חופשה שנתית</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DialogContent>
                </Dialog>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
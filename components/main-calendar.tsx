"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, addDays } from "date-fns"
import { Calendar, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"

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

  // Get days for the calendar grid
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  // Calculate days needed to fill the last row
  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const remainingCells = 42 - daysInCalendar.length // 42 = 6 rows × 7 days
  const extendedCalendarEnd = remainingCells > 0 ? addDays(calendarEnd, remainingCells) : calendarEnd
  const allDays = eachDayOfInterval({ start: calendarStart, end: extendedCalendarEnd })

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

  // Navigate to current month
  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  const sendFutureReport = (date: Date, status: FutureReportStatus) => {
    setReportedDates((prev) => ({
      ...prev,
      [date.toISOString()]: status,
    }))
  }

  const removeFutureReport = (date: Date) => {
    setReportedDates((prev) => {
      const newReports = { ...prev }
      delete newReports[date.toISOString()]
      return newReports
    })
  }

  return (
    <div className="w-full max-w-3xl px-2 sm:px-4 mx-auto">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between ml-auto">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              דוח 1
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <Button variant="outline" onClick={nextMonth} className="text-xs sm:text-sm mr-1">
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
               קדימה
            </Button>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-center text-lg sm:text-2xl font-semibold mx-2 sm:mx-4" dir="rtl">{format(currentDate, "MMMM yyyy").replace('January', 'ינואר').replace('February', 'פברואר').replace('March', 'מרץ').replace('April', 'אפריל').replace('May', 'מאי').replace('June', 'יוני').replace('July', 'יולי').replace('August', 'אוגוסט').replace('September', 'ספטמבר').replace('October', 'אוקטובר').replace('November', 'נובמבר').replace('December', 'דצמבר')}</h2>
              <Button variant="secondary" size="sm" onClick={goToCurrentMonth} className="text-xs sm:text-sm">
                חודש הנוכחי
              </Button>
            </div>
            <Button variant="outline" onClick={prevMonth} className="text-xs sm:text-sm ml-1">
             אחורה
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2" dir="rtl">
            {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map((day) => (
              <div key={day} className="font-medium text-xs sm:text-sm py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1" dir="rtl">
            {allDays.map((day, index) => {
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
                        text-xs sm:text-sm
                      `}
                    >
                      <div className="flex flex-col h-full justify-between">
                        <span>{format(day, "d")}</span>
                        {reportedDates[day.toISOString()] ? (
                          <Badge 
                            className={`hidden sm:block text-[10px] sm:text-xs ${
                              reportedDates[day.toISOString()] === "בתפקיד מחוץ ליחידה" 
                                ? "bg-blue-500 hover:bg-blue-600" 
                                : reportedDates[day.toISOString()] === "אחרי תורנות / משמרת"
                                ? "bg-purple-500 hover:bg-purple-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            {reportedDates[day.toISOString()]}
                          </Badge>
            ) : null }
            {reportedDates[day.toISOString()] ? (
                          <Badge 
                            className={`block sm:hidden w-2 h-2 mx-auto ${
                              reportedDates[day.toISOString()] === "בתפקיד מחוץ ליחידה" 
                                ? "bg-blue-500" 
                                : reportedDates[day.toISOString()] === "אחרי תורנות / משמרת"
                                ? "bg-purple-500"
                                : "bg-green-500"
                            }`}
                          >
                          </Badge>
                        ) : null}

                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="[&>button:last-child]:right-auto [&>button:last-child]:left-4">
                    <DialogHeader>
                      <DialogTitle className="text-right">פרטים עבור {format(day, "d MMMM yyyy").replace('January', 'ינואר').replace('February', 'פברואר').replace('March', 'מרץ').replace('April', 'אפריל').replace('May', 'מאי').replace('June', 'יוני').replace('July', 'יולי').replace('August', 'אוגוסט').replace('September', 'ספטמבר').replace('October', 'אוקטובר').replace('November', 'נובמבר').replace('December', 'דצמבר')}</DialogTitle>
                      <DialogDescription className="text-right">
                          {reportedDates[day.toISOString()]}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 mt-4">
                    {reportedDates[day.toISOString()] && (
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => removeFutureReport(day)}
                          title="מחק דיווח עתידי"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex-grow text-xs sm:text-sm">
                            ?איפה תהיו בתאריך היעד
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40">
                          <DropdownMenuGroup>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>מחוץ ליחידה</DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => sendFutureReport(day, "בתפקיד מחוץ ליחידה")}>בתפקיד מחוץ ליחידה</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => sendFutureReport(day, "אחרי תורנות / משמרת")}>אחרי תורנות / משמרת</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={() => sendFutureReport(day, "חופשה שנתית")}>חופשה שנתית</DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>
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
"use client"

import { useState } from "react"
import { ChevronLeft, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Option {
  id: string
  label: string
  subOptions?: {
    id: string
    label: string
  }[]
  displayText?: string
}

interface StatusSelectorProps {
  options: Option[]
  title: string
  onSelect?: (option: string, subOption?: string) => void
}

export default function StatusSelector({ options, title, onSelect }: StatusSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [selectedSubOption, setSelectedSubOption] = useState<string | null>(null)
  const [showSubOptions, setShowSubOptions] = useState(false)

  const handleMainOptionClick = (option: string) => {
    const selectedOptionData = options.find(o => o.id === option)

    if (selectedOptionData?.subOptions) {
      // Only show sub options, do not select the main option
      setSelectedOption(option)
      setShowSubOptions(!showSubOptions)
      setSelectedSubOption(null)
    } else {
      setSelectedOption(option)
      setShowSubOptions(false)
      setSelectedSubOption(null)
      if (onSelect) {
        onSelect(option)
      }
    }
  }

  const handleSubOptionClick = (subOption: string) => {
    setSelectedSubOption(subOption)
    if (onSelect && selectedOption) {
      onSelect(subOption)
    }
  }
  
  function clearSelection() {
    setSelectedOption(null)
    setSelectedSubOption(null)
    setShowSubOptions(false)
    if (onSelect) {
      onSelect("")
    }
  }

  const getDisplayText = () => {
    const selectedOptionData = options.find(o => o.id === selectedOption)
    if (!selectedOptionData) return null

    if (selectedOptionData.subOptions && selectedSubOption) {
      const selectedSubOptionData = selectedOptionData.subOptions.find(
        so => so.id === selectedSubOption
      )
      return `${selectedOptionData.label}: ${selectedSubOptionData?.label}`
    }

    // If there are subOptions, but no subOption is selected, don't show main option as selected
    if (selectedOptionData.subOptions) {
      return null
    }

    return selectedOptionData.displayText || selectedOptionData.label
  }

  return (
    <div className="flex flex-col items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.id}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-right font-medium",
                    selectedOption === option.id &&
                      (
                        (!option.subOptions) ||
                        (option.subOptions && selectedSubOption)
                      ) && "border-primary",
                  )}
                  onClick={() => handleMainOptionClick(option.id)}
                >
                  <span>{option.label}</span>
                  {option.subOptions && (
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", showSubOptions && selectedOption === option.id && "-rotate-90")} />
                  )}
                </Button>

                {showSubOptions && selectedOption === option.id && option.subOptions && (
                  <div className="mr-6 space-y-2 border-r-2 pr-4 pt-2">
                    {option.subOptions.map((subOption) => (
                      <Button
                        key={subOption.id}
                        variant="ghost"
                        className={cn("w-full justify-between text-right", selectedSubOption === subOption.id && "bg-muted")}
                        onClick={() => handleSubOptionClick(subOption.id)}
                      >
                        <span>{subOption.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  className?: string
  showClearButton?: boolean
}

export function SearchBar({
  placeholder = "Search...",
  value: controlledValue,
  onChange,
  onSearch,
  className,
  showClearButton = true
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("")
  
  const value = controlledValue !== undefined ? controlledValue : internalValue
  const setValue = onChange || setInternalValue

  const handleSearch = () => {
    onSearch?.(value)
  }

  const handleClear = () => {
    setValue("")
    onSearch?.("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-10"
        />
        {showClearButton && value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {onSearch && (
        <Button onClick={handleSearch} className="ml-2">
          Search
        </Button>
      )}
    </div>
  )
}

"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null)

export function Tabs({ defaultValue, value, onValueChange, children, className }: { defaultValue?: string, value?: string, onValueChange?: (value: string) => void, children: React.ReactNode, className?: string }) {
  const [internalValue, setInternalValue] = React.useState(value || defaultValue || "")
  
  const handleValueChange = (val: string) => {
    setInternalValue(val)
    onValueChange?.(val)
  }

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  return (
    <TabsContext.Provider value={{ value: internalValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)} {...props} />
))
TabsList.displayName = "TabsList"

export const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }>(({ className, value, onClick, ...props }, ref) => {
  const ctx = React.useContext(TabsContext)
  const isSelected = ctx?.value === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={(e) => {
        ctx?.onValueChange(value)
        onClick?.(e)
      }}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected ? "bg-white text-gray-950 shadow-sm" : "hover:text-gray-900",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

export const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(({ className, value, ...props }, ref) => {
  const ctx = React.useContext(TabsContext)
  if (ctx?.value !== value) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2", className)}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

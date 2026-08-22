"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null)

export function Select({ value, onValueChange, children }: { value?: string, onValueChange?: (value: string) => void, children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value || "")

  const handleValueChange = (val: string) => {
    setInternalValue(val)
    onValueChange?.(val)
  }

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  return (
    <SelectContext.Provider value={{ value: internalValue, onChange: handleValueChange, open, setOpen }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={cn("flex h-12 w-full items-center justify-between rounded-2xl border border-border bg-white/80 px-4 py-2 text-sm shadow-sm shadow-black/5 ring-offset-background transition-all duration-300 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    >
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const ctx = React.useContext(SelectContext)
  return <span>{ctx?.value || placeholder}</span>
}

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)
  if (!ctx?.open) return null
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => ctx.setOpen(false)} />
      <div
        ref={ref}
        className={cn("absolute top-full z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-white/60 bg-white/95 py-1 text-foreground shadow-xl shadow-black/5 backdrop-blur-md", className)}
        {...props}
      >
        {children}
      </div>
    </>
  )
})
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(({ className, children, value, onClick, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)
  const isSelected = ctx?.value === value

  return (
    <div
      ref={ref}
      onClick={(e) => {
        ctx?.onChange(value)
        ctx?.setOpen(false)
        onClick?.(e)
      }}
      className={cn("relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100", className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M20 6 9 17l-5-5"/></svg>
        )}
      </span>
      <span className="truncate">{children}</span>
    </div>
  )
})
SelectItem.displayName = "SelectItem"

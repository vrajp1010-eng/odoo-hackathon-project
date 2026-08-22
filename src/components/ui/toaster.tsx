"use client"
import * as React from "react"
import { Toast, ToastProps } from "./toast"

type ToastType = Omit<ToastProps, "onClose"> & { id: string; duration?: number }

type ToastContextType = {
  toast: (props: Omit<ToastType, "id">) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastType[]>([])

  const addToast = React.useCallback((props: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).slice(2, 9)
    const duration = props.duration || 5000
    
    setToasts((prev) => [...prev, { ...props, id, duration }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2">
        {toasts.map(({ id, ...props }) => (
          <Toast key={id} {...props} onClose={() => removeToast(id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

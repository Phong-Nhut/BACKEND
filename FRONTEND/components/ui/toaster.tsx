"use client"

import { useToast } from "@/components/ui/use-toast"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} className="bg-white border-gray-200 shadow-lg rounded-lg min-w-[350px]">
          <div className="grid gap-1">
            {title && <ToastTitle className="text-gray-800 font-semibold text-sm">{title}</ToastTitle>}
            {description && <ToastDescription className="text-gray-600 text-sm">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose className="text-gray-600 hover:text-blue-600" />
        </Toast>
      ))}
      <ToastViewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}

import { toast as sonnerToast } from "sonner"
import type { ReactNode } from "react"

type ToastVariant = "default" | "destructive" | "success"

type ToastOptions = {
  id?: string | number
  title?: ReactNode
  description?: ReactNode
  action?: any
  variant?: ToastVariant
}

type DismissableToast = {
  id: string | number
  dismiss: () => void
  update: (next: ToastOptions) => void
}

const showToast = ({ title, description, action, variant, ...props }: ToastOptions = {}) => {
  const message = title ?? description ?? "Notification"
  const options = {
    id: props.id,
    description: title ? description : undefined,
    action,
  }

  if (variant === "destructive") {
    return sonnerToast.error(message, options)
  }

  if (variant === "success") {
    return sonnerToast.success(message, options)
  }

  return sonnerToast(message, options)
}

const openToast = ({ title, description, action, variant, ...props }: ToastOptions = {}): DismissableToast => {
  const id = showToast({ title, description, action, variant, ...props })

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (next) => {
      showToast({ ...next, id })
    },
  }
}

function useToast() {
  return {
    toasts: [],
    toast: openToast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  }
}

export { useToast, openToast as toast }

import { toast as sonnerToast } from "sonner"
import type { ReactNode } from "react"

type ToastOptions = {
  id?: string
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
}

type DismissableToast = {
  id: string | number
  dismiss: () => void
  update: (next: ToastOptions) => void
}

const openToast = ({ title, description, action, ...props }: ToastOptions = {}): DismissableToast => {
  const id = sonnerToast(title ?? description ?? "Notification", {
    id: props.id,
    description: title ? description : undefined,
    action,
  })

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (next) => {
      sonnerToast(next.title ?? next.description ?? "Notification", {
        id,
        description: next.title ? next.description : undefined,
        action: next.action,
      })
    },
  }
}

function useToast() {
  return {
    toasts: [],
    toast: openToast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  }
}

export { useToast, openToast as toast }

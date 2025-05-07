"use client"

import { useToast } from "@/context/toast-context"

// Re-export the Toaster component - this maintains backward compatibility
// All toast functionality is now in the ToastProvider
const Toaster = () => null

export { Toaster }

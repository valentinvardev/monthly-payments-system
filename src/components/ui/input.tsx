import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Campo del studio: cuadrado, borde de un pixel sobre negro.
        // Mismo tratamiento que el formulario de /contanos.
        "h-9 w-full min-w-0 rounded-none border border-white/12 bg-white/[0.03] px-3 py-1 text-base text-white transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-white/30 hover:border-white/20 focus:border-[#0070F3] focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(0,112,243,0.18)] focus:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }

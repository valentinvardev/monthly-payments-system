import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Controles del studio: cuadrados, borde de un pixel, sin degradés.
// Copian los botones de la landing — el azul es el primario y el
// oscuro (#161616 → #1f1f1f) el secundario.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[#0070F3] bg-[#0070F3] text-white hover:border-[#0060d3] hover:bg-[#0060d3]",
        outline:
          "border-white/12 bg-[#161616] text-white/90 hover:border-white/25 hover:bg-[#1f1f1f] hover:text-white aria-expanded:border-white/25 aria-expanded:bg-[#1f1f1f]",
        secondary:
          "border-white/12 bg-[#1f1f1f] text-white/90 hover:border-white/25 hover:bg-[#2a2a2a] hover:text-white aria-expanded:bg-[#2a2a2a]",
        ghost:
          "text-white/70 hover:bg-white/[0.06] hover:text-white aria-expanded:bg-white/[0.06] aria-expanded:text-white",
        destructive:
          "border-rose-400/30 bg-rose-400/[0.08] text-rose-200 hover:border-rose-400/50 hover:bg-rose-400/15 focus-visible:ring-destructive/30",
        link: "text-[#0070F3] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

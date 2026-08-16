import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Etiqueta del studio: rectángulo duro, versalitas espaciadas.
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border border-transparent px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-[#0070F3] bg-[#0070F3] text-white [a]:hover:bg-[#0060d3]",
        secondary:
          "border-white/12 bg-white/[0.05] text-white/85 [a]:hover:bg-white/[0.09]",
        destructive:
          "border-rose-400/30 bg-rose-400/[0.08] text-rose-200 [a]:hover:bg-rose-400/15",
        outline:
          "border-white/12 text-white/85 [a]:hover:border-white/25 [a]:hover:bg-white/[0.05]",
        ghost: "text-white/60 hover:bg-white/[0.05] hover:text-white",
        link: "text-[#0070F3] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }

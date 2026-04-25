import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-[inherit] cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        default: 'text-text-dim border border-rule rounded-[2px] hover:text-text hover:border-text-dim',
        ghost: 'text-text-faded hover:text-text',
        outline: 'text-accent border border-accent hover:bg-accent hover:text-bg rounded-[2px]',
      },
      size: {
        default: 'px-[14px] py-[6px] text-[13px] tracking-[0.08em] lowercase',
        sm: 'px-2 py-1 text-xs',
        icon: 'w-7 h-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

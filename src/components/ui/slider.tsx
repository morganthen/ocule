import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('cs-slider-root', className)}
    {...props}
  >
    <SliderPrimitive.Track className="cs-slider-track">
      <SliderPrimitive.Range className="cs-slider-range" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="cs-slider-thumb" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

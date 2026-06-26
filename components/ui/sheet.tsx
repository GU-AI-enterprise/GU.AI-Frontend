"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

function SheetTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger className={cn("cursor-pointer", className)} {...props} />
  )
}

function SheetClose({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close className={cn("cursor-pointer", className)} {...props} />
  )
}

function SheetPortal({
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />
}

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Backdrop>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Backdrop>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Backdrop
    ref={ref}
    className={cn(
      "fixed inset-0 z-40 bg-black/30 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200",
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = "SheetOverlay"

const sheetSideClasses = {
  right:
    "right-0 border-l data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
  left:
    "left-0 border-r data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
} as const

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Popup> {
  side?: keyof typeof sheetSideClasses
  /** Hiện lớp phủ tối phía sau panel. Mặc định true — set false cho sheet không chặn tương tác với trang (modal=false). */
  overlay?: boolean
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Popup>,
  SheetContentProps
>(({ className, children, side = "right", overlay = true, ...props }, ref) => (
  <SheetPortal>
    {overlay && <SheetOverlay />}
    <DialogPrimitive.Popup
      ref={ref}
      className={cn(
        "fixed inset-y-0 z-50 flex h-full w-full max-w-[380px] flex-col bg-background shadow-2xl translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        sheetSideClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Popup>
  </SheetPortal>
))
SheetContent.displayName = "SheetContent"

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title className={cn("text-sm font-semibold", className)} {...props} />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-[11px] text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}

"use client"

import * as React from 'react'
import { Dialog as DrawerPrimitive } from '@base-ui/react/dialog'

import { cn } from '@/lib/utils'

type DrawerProps = DrawerPrimitive.Root.Props & {
  showSwipeHandle?: boolean
  swipeDirection?: 'down' | 'right'
}

const DrawerContext = React.createContext<Pick<DrawerProps, 'showSwipeHandle' | 'swipeDirection'>>({})

function Drawer({ showSwipeHandle = true, swipeDirection = 'down', ...props }: DrawerProps) {
  return (
    <DrawerContext.Provider value={{ showSwipeHandle, swipeDirection }}>
      <DrawerPrimitive.Root data-slot="drawer" {...props} />
    </DrawerContext.Provider>
  )
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

function DrawerContent({ className, children, ...props }: DrawerPrimitive.Popup.Props) {
  const { showSwipeHandle, swipeDirection } = React.useContext(DrawerContext)
  const isRight = swipeDirection === 'right'

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Popup
        data-slot="drawer-content"
        className={cn(
          isRight
            ? 'fixed inset-y-0 right-0 z-50 flex h-full max-h-none w-full flex-col rounded-l-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-300 outline-none data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right sm:max-w-xl'
            : 'fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[90vh] w-full flex-col rounded-t-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-300 outline-none data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom',
          className,
        )}
        {...props}
      >
        {showSwipeHandle && (
          <div
            className={cn(
              'shrink-0 rounded-full bg-muted-foreground/30',
              isRight ? 'my-auto ml-3 h-12 w-1.5' : 'mx-auto mt-3 h-1.5 w-12',
            )}
          />
        )}
        {children}
      </DrawerPrimitive.Popup>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-header" className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)} {...props} />
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn('text-lg font-semibold', className)} {...props} />
}

function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return <DrawerPrimitive.Description data-slot="drawer-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
}

export { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle }

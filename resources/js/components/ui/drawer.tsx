"use client"

import * as React from 'react'
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'

import { cn } from '@/lib/utils'

type DrawerContextValue = {
  modal: DrawerPrimitive.Root.Props['modal']
  showSwipeHandle: boolean
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props['swipeDirection']>
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

function useDrawer() {
  const context = React.useContext(DrawerContext)
  if (!context) throw new Error('useDrawer must be used within a Drawer.')
  return context
}

function Drawer({ modal = true, showSwipeHandle = false, swipeDirection = 'down', ...props }: DrawerPrimitive.Root.Props & { showSwipeHandle?: boolean }) {
  const contextValue = React.useMemo(() => ({ modal, showSwipeHandle, swipeDirection }), [modal, showSwipeHandle, swipeDirection])
  return <DrawerContext.Provider value={contextValue}><DrawerPrimitive.Root data-slot="drawer" modal={modal} swipeDirection={swipeDirection} {...props} /></DrawerContext.Provider>
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) { return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} /> }
function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) { return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} /> }
function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) { return <DrawerPrimitive.Close data-slot="drawer-close" {...props} /> }

function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return <DrawerPrimitive.Backdrop data-slot="drawer-overlay" className={cn('fixed inset-0 z-50 min-h-dvh bg-overlay opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] select-none data-ending-style:pointer-events-none data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute', className)} {...props} />
}

function DrawerSwipeHandle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-swipe-handle" aria-hidden="true" className={cn('relative z-10 flex shrink-0 cursor-grab transition-opacity duration-200 active:cursor-grabbing', className)} {...props} />
}

function DrawerContent({ className, children, ...props }: DrawerPrimitive.Popup.Props) {
  const { modal, showSwipeHandle, swipeDirection } = useDrawer()
  const swipeAxis = swipeDirection === 'down' || swipeDirection === 'up' ? 'y' : 'x'
  const isRight = swipeDirection === 'right'
  return (
    <DrawerPortal>
      {modal === true && <DrawerOverlay />}
      <DrawerPrimitive.Viewport data-slot="drawer-viewport" className="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto">
        <DrawerPrimitive.Popup data-slot="drawer-popup" data-swipe-axis={swipeAxis} data-swipe-direction={swipeDirection} className={cn('group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex min-h-0 flex-col bg-popover text-sm text-popover-foreground transition-[transform,height,opacity,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform outline-none select-none data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:max-h-[calc(100dvh-6rem)] data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:w-[75%] data-[swipe-axis=x]:sm:w-96', isRight ? 'right-0 h-dvh rounded-l-xl data-ending-style:translate-x-full data-starting-style:translate-x-full' : 'bottom-0 w-full rounded-t-xl data-ending-style:translate-y-full data-starting-style:translate-y-full', className)} {...props}>
          {showSwipeHandle && <DrawerSwipeHandle className={isRight ? 'my-auto ml-3 h-12 w-1.5 rounded-full bg-muted-foreground/30' : 'mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30'} />}
          <DrawerPrimitive.Content data-slot="drawer-content" className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] select-text">{children}</DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="drawer-header" className={cn('flex shrink-0 flex-col', className)} {...props} /> }
function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) { return <div data-slot="drawer-footer" className={cn('mt-auto flex shrink-0 flex-col', className)} {...props} /> }
function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) { return <DrawerPrimitive.Title data-slot="drawer-title" className={cn('text-lg font-semibold', className)} {...props} /> }
function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) { return <DrawerPrimitive.Description data-slot="drawer-description" className={cn('text-muted-foreground text-sm', className)} {...props} /> }

export { Drawer, DrawerPortal, DrawerOverlay, DrawerSwipeHandle, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription }

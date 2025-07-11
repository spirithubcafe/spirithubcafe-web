import type { ReactNode } from 'react'
import { MainNavigation } from '@/components/main-navigation'
import { cn } from '@/lib/utils'

interface HeaderProps {
  children?: ReactNode
  className?: string
  fixed?: boolean
  transparent?: boolean
}

export function Header({ 
  children, 
  className, 
  fixed = true, 
  transparent = false 
}: HeaderProps) {
  return (
    <header 
      className={cn(
        "w-full z-50 transition-all duration-300",
        fixed && "sticky top-0",
        transparent 
          ? "bg-transparent backdrop-blur-md" 
          : "bg-background border-b",
        className
      )}
    >
      <MainNavigation />
      {children}
    </header>
  )
}

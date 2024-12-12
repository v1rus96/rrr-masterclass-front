'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Users, BarChart, Settings, LogOut } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function Sidebar() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Success",
        description: "Signed out successfully",
      })
      
      router.refresh()
      router.push('/login')
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-16">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center justify-center border-b">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/" className="flex items-center">
                  <LayoutDashboard className="h-6 w-6" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Admin Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="flex flex-col gap-2 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-center p-2 h-10">
                      <LayoutDashboard className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/analytics">
                    <Button variant="ghost" className="w-full justify-center p-2 h-10">
                      <BarChart className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Analytics</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-2 p-2 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-center p-2 h-10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

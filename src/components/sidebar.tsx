import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Users, BarChart, Settings } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Sidebar() {
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
      </div>
    </div>
  )
}

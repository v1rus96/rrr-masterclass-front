import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Users, ShoppingCart, Settings } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link className="flex items-center gap-2 font-semibold" href="#">
            <LayoutDashboard className="h-6 w-6" />
            <span className="">Admin Dashboard</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Users className="h-4 w-4" />
              Users
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <ShoppingCart className="h-4 w-4" />
              Products
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}


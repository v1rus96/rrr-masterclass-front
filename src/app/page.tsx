"use client";

import { useState, useEffect } from "react";
import { getUsers } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/user-table";
import { Bell, Users, CheckCircle, Clock, XCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/db";
import { useRouter } from 'next/navigation';
import { i18n, useTranslation } from 'next-i18next';

interface User {
  username: string | null;
  firstname: string;
  lastname: string | null;
  languagecode: string | null;
  phonenumber: string | null;
  onboarding: boolean;
  createdat: string;
  updatedat: string;
  status: string;
  remarks: string | null;
  userid?: number;
}

export default function DashboardPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState(0);
  const [onboardedUsers, setOnboardedUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [totalQualified, setTotalQualified] = useState(0);
  const [totalUnqualified, setTotalUnqualified] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 15;

  useEffect(() => {
  

    const fetchData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login'); // Navigate to login page
      return;
    }

        const { users, totalUsers, totalOnboarded, totalQualified, totalUnqualified } = await getUsers(
          "",
          (currentPage - 1) * itemsPerPage,
          itemsPerPage
        );

        const pending = users.filter(
          (user) => user.status === "pending"
        ).length;
        const inactive = users.filter(
          (user) => user.status === "inactive"
        ).length;

        setTotalUsers(totalUsers);
        setOnboardedUsers(totalOnboarded); // Use total onboarded count from backend
        setTotalQualified(totalQualified);
        setTotalUnqualified(totalUnqualified);
        setPendingUsers(pending);
        setInactiveUsers(inactive);
        setUsers(users);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage ]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      alert("Logged out successfully!");
      router.push("/login"); // Safe navigation
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customers Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button size="icon" variant="ghost">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          {/* Logout Button */}
          <Button
            size="icon" 
      
            onClick={handleSignOut}
            variant="ghost"
          >
                  <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Onboarded Users
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onboardedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((onboardedUsers / totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Users</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQualified}</div>
            <p className="text-xs text-muted-foreground">
              {((totalQualified / totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unqualified Users
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnqualified}</div>
            <p className="text-xs text-muted-foreground">
              {((totalUnqualified / totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-1 sm:grid-cols-1 lg:grid-cols-1"> 
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <UserTable
                // users={users}
                // totalPages={Math.ceil(totalUsers / itemsPerPage)}
                // currentPage={currentPage}
                // onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getUsers, updateUser } from "@/lib/db";
import { DatePicker } from "./ui/datepicker";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  type: string | null;
  attended: boolean | null;
  userid?: number;
}

interface StatusCounts {
  [key: string]: number;
}

function UserTableContent({
  users,
  editingCell,
  handleEdit,
  totalPages,
  currentPage,
  setCurrentPage,
  setEditingCell,
}: {
  users: User[];
  editingCell: { userId: number; field: string; } | null;
  handleEdit: (userId: number, field: string, value: string | boolean) => Promise<void>;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  setEditingCell: React.Dispatch<React.SetStateAction<{ userId: number; field: string; } | null>>;
}) {
  return (
    <>
      <Table>
        <TableCaption>User Overview</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Attended</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userid}>
              <TableCell>
                {editingCell?.userId === user.userid &&
                editingCell?.field === "firstname" ? (
                  <Input
                    defaultValue={user.firstname}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        user.userid &&
                          handleEdit(
                            user.userid,
                            "firstname",
                            e.currentTarget.value
                          );
                      }
                    }}
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() =>
                      user.userid &&
                      setEditingCell({
                        userId: user.userid,
                        field: "firstname",
                      })
                    }
                  >
                    {user.firstname}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {editingCell?.userId === user.userid &&
                editingCell?.field === "lastname" ? (
                  <Input
                    defaultValue={user.lastname || ""}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        user.userid &&
                          handleEdit(
                            user.userid,
                            "lastname",
                            e.currentTarget.value
                          );
                      }
                    }}
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() =>
                      user.userid &&
                      setEditingCell({ userId: user.userid, field: "lastname" })
                    }
                  >
                    {user.lastname || <p className="text-gray-300">-</p>}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {user.phonenumber || <p className="text-gray-300">-</p>}
              </TableCell>
              <TableCell>
                {editingCell?.userId === user.userid &&
                editingCell?.field === "status" ? (
                  <Select
                    defaultValue={user.status}
                    onValueChange={(value) =>
                      user.userid && handleEdit(user.userid, "status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="invalid">Invalid</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="unqualified">Unqualified</SelectItem>
                      <SelectItem value="follow">Follow-Up Required</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant={
                      user.status === "new"
                        ? "outline"
                        : user.status === "invalid"
                        ? "light"
                        : user.status === "qualified"
                        ? "success"
                        : user.status === "unqualified"
                        ? "danger"
                        : user.status === "follow"
                        ? "blue"
                        : "default"
                    }
                    className="cursor-pointer capitalize"
                    onClick={() =>
                      user.userid &&
                      setEditingCell({ userId: user.userid, field: "status" })
                    }
                  >
                    {user.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {editingCell?.userId === user.userid &&
                editingCell?.field === "onboarding" ? (
                  <Select
                    defaultValue={user.onboarding ? "online" : "offline"}
                    onValueChange={(value) =>
                      handleEdit(
                        user.userid!,
                        "onboarding",
                        value === "online" ? "true" : "false"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant={user.onboarding ? "success" : "secondary"}
                    className="cursor-pointer"
                    onClick={() =>
                      setEditingCell({
                        userId: user.userid!,
                        field: "onboarding",
                      })
                    }
                  >
                    {user.onboarding ? "Online" : "On-site"}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {editingCell?.userId === user.userid && editingCell?.field === "type" ? (
                  <Select
                    defaultValue={user.type || "free"}
                    onValueChange={(value) => handleEdit(user.userid!, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant={user.type === "paid" ? "success" : "secondary"}
                    className="cursor-pointer capitalize"
                    onClick={() => setEditingCell({ userId: user.userid!, field: "type" })}
                  >
                    {user.type || "free"}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <input
                  type="checkbox"
                  checked={user.attended ?? false}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    console.log('Checkbox changed:', { oldValue: user.attended, newValue });
                    handleEdit(user.userid!, "attended", newValue);
                  }}
                  className="w-4 h-4"
                />
              </TableCell>
              <TableCell>
                {editingCell?.userId === user.userid && editingCell?.field === "remarks" ? (
                  <Input
                    className="w-full"
                    defaultValue={user.remarks || ""}
                    onBlur={(e) => handleEdit(user.userid!, "remarks", e.target.value)}
                  />
                ) : (
                  <div onClick={() => setEditingCell({ userId: user.userid!, field: "remarks" })}>
                    {user.remarks || <p className="text-gray-300">-</p>}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
              aria-disabled={currentPage === 1}
            >
              Previous
            </PaginationPrevious>
            
            {/* First page */}
            {currentPage > 3 && (
              <>
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(1)}>
                    1
                  </PaginationLink>
                </PaginationItem>
                {currentPage > 4 && (
                  <PaginationItem>
                    <PaginationLink className="cursor-default">...</PaginationLink>
                  </PaginationItem>
                )}
              </>
            )}

            {/* Visible page numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              const isWithinRange =
                pageNumber >= Math.max(1, currentPage - 2) &&
                pageNumber <= Math.min(totalPages, currentPage + 2);

              if (!isWithinRange) return null;

              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNumber)}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <PaginationItem>
                    <PaginationLink className="cursor-default">...</PaginationLink>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationNext
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1);
                }
              }}
              aria-disabled={currentPage === totalPages}
            >
              Next
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}

const DynamicUserTableContent = dynamic(
  () => Promise.resolve(UserTableContent),
  { ssr: false }
);

export function UserTable() {
  const [createdAtFilter, setCreatedAtFilter] = useState<Date | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [phoneFilter, setPhoneFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState<{
    userId: number;
    field: string;
  } | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});

  const itemsPerPage = 15;

  const fetchUsers = async () => {
    try {
      console.log('Fetching users with current filters:', {
        searchTerm,
        currentPage,
        itemsPerPage,
        statusFilter,
        modeFilter,
        typeFilter,
        phoneFilter,
        createdAtFilter
      });

      const { users: fetchedUsers, totalUsers } = await getUsers(
        searchTerm,
        (currentPage - 1) * itemsPerPage,
        itemsPerPage,
        {
          status:
            statusFilter === "all"
              ? undefined
              : statusFilter,
          onboarding:
            modeFilter === "all"
              ? undefined
              : modeFilter === "online"
              ? true
              : false,
          type:
            typeFilter === "all"
              ? undefined
              : typeFilter,
          hasPhoneNumber:
            phoneFilter === "all"
              ? undefined
              : phoneFilter === "with"
              ? true
              : false,
          createdat: createdAtFilter ? format(createdAtFilter, 'yyyy-MM-dd') : undefined,
        }
      );

      console.log('Fetched users:', fetchedUsers);
      
      // Transform the users data to include required properties
      const transformedUsers = fetchedUsers.map(user => ({
        ...user,
        type: user.type || null,
        attended: user.attended ?? false, // Use nullish coalescing for attended
      }));

      console.log('Transformed users:', transformedUsers);
      
      setUsers(transformedUsers);
      setTotalPages(Math.ceil(totalUsers / itemsPerPage));
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const response = await fetch('/api/users/status-counts');
      if (!response.ok) {
        throw new Error('Failed to fetch status counts');
      }
      const data = await response.json();
      
      // Ensure we have valid numbers for each status
      const validatedData: StatusCounts = Object.entries(data).reduce((acc, [status, count]) => {
        acc[status] = Number(count) || 0;
        return acc;
      }, {} as StatusCounts);
      
      setStatusCounts(validatedData);
      
      // Calculate total by summing all status counts
      const total = Object.values(validatedData).reduce((sum, count) => sum + count, 0);
      setTotalUsers(total);
    } catch (error) {
      console.error('Error fetching status counts:', error);
      setStatusCounts({});
      setTotalUsers(0);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, modeFilter, typeFilter, createdAtFilter, phoneFilter]);

  // Fetch users when any filter or page changes
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, currentPage, statusFilter, modeFilter, typeFilter, createdAtFilter, phoneFilter]);

  useEffect(() => {
    fetchStatusCounts();
  }, []);

  const handleEdit = async (userId: number, field: string, value: string | boolean) => {
    try {
      console.log('handleEdit called with:', { userId, field, value, typeof: typeof value });
      const updatedUser = users.find((user) => user.userid === userId);
      if (updatedUser) {
        const updates = {
          [field]: value,
        };
        console.log('Sending update:', updates);
        const result = await updateUser(userId, updates);
        console.log('Update result:', result);

        if (result.success) {
          // Update local state immediately
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.userid === userId 
                ? { ...user, [field]: value }
                : user
            )
          );
        }
      }
      setEditingCell(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div>
      <div className="mb-4 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name or username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="created-at-filter">Created At</Label>
            <DatePicker
              id="created-at-filter"
              value={createdAtFilter}
              onChange={(date) => {
                setCreatedAtFilter(date);
              }}
              placeholder="Filter by created at"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="mode-filter">Mode</Label>
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger id="mode-filter">
                <SelectValue placeholder="Filter by mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="type-filter">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" className="flex gap-2">
              All
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {totalUsers}
              </span>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex gap-2">
              New
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {statusCounts.new || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="qualified" className="flex gap-2">
              Qualified
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {statusCounts.qualified || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="unqualified" className="flex gap-2">
              Unqualified
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {statusCounts.unqualified || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="invalid" className="flex gap-2">
              Invalid
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {statusCounts.invalid || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="follow" className="flex gap-2">
              Follow-Up
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {statusCounts.follow || 0}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <DynamicUserTableContent
        users={users}
        editingCell={editingCell}
        handleEdit={handleEdit}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setEditingCell={setEditingCell}
      />
    </div>
  );
}

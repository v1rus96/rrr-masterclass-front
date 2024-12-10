import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
/*dont env this file*/

const supabaseUrl = "https://iwqspigcmmbaoeglgbml.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cXNwaWdjbW1iYW9lZ2xnYm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3NDE2OTAsImV4cCI6MjA0ODMxNzY5MH0.PQAvoH5nUp3Bh7eJTmMewzQI0Hx-c2c0PF9t2495BNM";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define Zod schema for user data
export const userSchema = z.object({
  userid: z.number().optional(), // Primary key
  username: z.string().nullable(), // Optional username
  firstname: z.string(), // First name
  lastname: z.string().nullable(), // Allow null values for lastname
  languagecode: z.string().nullable(), // Language code
  phonenumber: z.string().nullable(), // Phone number
  onboarding: z.boolean(), // Onboarding status
  createdat: z.string(), // ISO timestamp
  updatedat: z.string(), // ISO timestamp
  status: z.string().default("pending"), // Status column
  remarks: z.string().nullable(), // Remarks column
});

export type SelectUser = z.infer<typeof userSchema>;

// Fetch users with pagination and optional filters
export async function getUsers(
  search: string,
  offset: number = 0,
  limit: number = 15,
  filters?: { status?: string; onboarding?: boolean; hasPhoneNumber?: boolean; createdat?: string | null }
): Promise<{
  users: SelectUser[];
  totalUsers: number;
  totalOnboarded: number;
  totalQualified: number;
  totalUnqualified: number;
}> {
  let query = supabase.from("users").select("*", { count: "exact" });

  // Filter by search term
  if (search) {
    query = query.or(
      `username.ilike.%${search}%,firstname.ilike.%${search}%,lastname.ilike.%${search}%,phonenumber.ilike.%${search}%`
    );
  }

  // Apply status filter
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  // Apply onboarding filter
  if (filters?.onboarding !== undefined) {
    query = query.eq("onboarding", filters.onboarding);
  }

  // Apply phone number filter
  if (filters?.hasPhoneNumber !== undefined) {
    if (filters.hasPhoneNumber) {
      query = query.not("phonenumber", "is", null);
    } else {
      query = query.is("phonenumber", null);
    }
  }

  if (filters?.createdat) {
    query = query.gte("createdat", filters.createdat);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: users, count: totalUsers, error } = await query;

  // Calculate total onboarded users
  const { count: totalOnboarded } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .eq("status", "new");

  const { count: totalQualified } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .eq("status", "qualified");

  const { count: totalUnqualified } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .eq("status", "unqualified");

  if (error) {
    console.error("Error fetching users:", error);
    return { users: [], totalUsers: 0, totalOnboarded: 0, totalQualified: 0, totalUnqualified: 0 };
  }

  return {
    users: users || [],
    totalUsers: totalUsers || 0,
    totalOnboarded: totalOnboarded || 0,
    totalQualified: totalQualified || 0,
    totalUnqualified: totalUnqualified || 0,
  };
}

// Delete a user by ID
export async function deleteUserById(userId: number) {
  const { error } = await supabase.from("users").delete().eq("userid", userId);

  if (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

// Update a user by ID
export async function updateUser(userId: number, updates: Partial<SelectUser>) {
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("userid", userId);

  if (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}


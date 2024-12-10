import { PrismaClient, Prisma } from '@prisma/client'
import { z } from 'zod'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// Define Zod schema for user data (keeping your existing validation)
export const userSchema = z.object({
  userid: z.number().optional(),
  username: z.string().nullable(),
  firstname: z.string(),
  lastname: z.string().nullable(),
  languagecode: z.string().nullable(),
  phonenumber: z.string().nullable(),
  onboarding: z.boolean(),
  createdat: z.string(),
  updatedat: z.string(),
  status: z.string().default("pending"),
  remarks: z.string().nullable(),
})

export type SelectUser = z.infer<typeof userSchema>

// Helper function to get users with filters
export async function getUsers(
  search: string,
  offset: number = 0,
  limit: number = 15,
  filters?: {
    status?: string
    onboarding?: boolean
    hasPhoneNumber?: boolean
    createdat?: string | null
  }
) {
  const where = {
    AND: [
      // Search condition
      search
        ? {
            OR: [
              { firstname: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { lastname: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { phonenumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {},
      // Filter conditions
      filters?.status ? { status: filters.status } : {},
      filters?.onboarding !== undefined ? { onboarding: filters.onboarding } : {},
      filters?.hasPhoneNumber ? { phonenumber: { not: null } } : {},
      filters?.createdat ? { createdat: filters.createdat } : {},
    ],
  }

  const users = await prisma.user.findMany({
    select: {
      userid: true,
      username: true,
      firstname: true,
      lastname: true,
      languagecode: true,
      phonenumber: true,
      onboarding: true,
      createdat: true,
      updatedat: true,
      status: true,
      remarks: true,
    },
    where,
    orderBy: { createdat: 'desc' },
    skip: offset,
    take: limit,
  })

  const totalUsers = await prisma.user.count({ where })

  return { users, totalUsers }
}

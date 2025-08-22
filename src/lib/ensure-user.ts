import { currentUser } from "@clerk/nextjs/server"
import { dbConnect } from "@/lib/db"
import { UserModel } from "@/lib/models"

/**
 * Ensures a User document exists for the currently authenticated Clerk user.
 * Returns the Clerk user id or null if not authenticated.
 */
export async function ensureUser() {
  const user = await currentUser()
  if (!user) return null

  await dbConnect()

  const now = new Date()
  await UserModel.updateOne(
    { clerkId: user.id },
    {
      $setOnInsert: {
        clerkId: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "",
        imageUrl: user.imageUrl,
        roles: ["member"],
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    { upsert: true }
  )

  return user.id
}
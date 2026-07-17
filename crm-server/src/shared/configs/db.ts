import { prisma } from "../../../lib/prisma"

export const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1) 
  }
}
"use client"

import { SignIn } from "@clerk/nextjs"
import { motion } from "@/components/motion"

export default function AuthRequiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to TogetherFlow
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to access your collaborative workspace
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-0",
            }
          }}
        />
      </motion.div>
    </div>
  )
}

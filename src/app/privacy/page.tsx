"use client"

import { motion } from "@/components/motion"
import { Shield, Eye, Lock, Database, Users, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">
          Last updated: December 2024
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Our Commitment to Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              At TogetherFlow, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our collaborative productivity platform.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Personal Information</h4>
                <p className="text-sm text-muted-foreground">
                  Name, email address, profile picture, and other information you provide when creating an account.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Usage Data</h4>
                <p className="text-sm text-muted-foreground">
                  Information about how you use our service, including projects, tasks, and collaboration activities.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Technical Data</h4>
                <p className="text-sm text-muted-foreground">
                  IP address, browser type, device information, and other technical identifiers.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Service Provision</h4>
                <p className="text-sm text-muted-foreground">
                  To provide, maintain, and improve our collaborative productivity services.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Communication</h4>
                <p className="text-sm text-muted-foreground">
                  To send you updates, notifications, and respond to your inquiries.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  To analyze usage patterns and improve our platform's functionality.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All data is encrypted in transit and at rest using industry-standard protocols.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Access Controls</h4>
                <p className="text-sm text-muted-foreground">
                  Strict access controls ensure only authorized personnel can access your data.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Regular Audits</h4>
                <p className="text-sm text-muted-foreground">
                  We conduct regular security audits and vulnerability assessments.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Access & Portability</h4>
                <p className="text-sm text-muted-foreground">
                  Request access to your personal data and export it in a portable format.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Correction & Deletion</h4>
                <p className="text-sm text-muted-foreground">
                  Update or delete your personal information at any time.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Opt-out</h4>
                <p className="text-sm text-muted-foreground">
                  Control your communication preferences and data processing consent.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> privacy@togetherflow.com</p>
              <p><strong>Address:</strong> 123 Privacy Street, Data City, DC 12345</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

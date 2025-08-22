"use client"

import { motion } from "@/components/motion"
import { Users, Target, Zap, Heart, Award, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Co-founder",
    avatar: "",
    bio: "Former product manager at Meta with 10+ years in collaborative tools."
  },
  {
    name: "Michael Chen",
    role: "CTO & Co-founder",
    avatar: "",
    bio: "Full-stack engineer passionate about building scalable productivity platforms."
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Design",
    avatar: "",
    bio: "UX designer focused on creating intuitive and accessible user experiences."
  },
  {
    name: "David Kim",
    role: "Lead Developer",
    avatar: "",
    bio: "Senior developer specializing in React, TypeScript, and modern web technologies."
  }
]

const values = [
  {
    icon: Users,
    title: "Collaboration First",
    description: "We believe the best work happens when teams can seamlessly collaborate and communicate."
  },
  {
    icon: Target,
    title: "Focus on Results",
    description: "Our tools are designed to help teams achieve their goals efficiently and effectively."
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "We continuously innovate to provide cutting-edge solutions for modern teams."
  },
  {
    icon: Heart,
    title: "User-Centric",
    description: "Every feature we build is designed with our users' needs and feedback in mind."
  }
]

export default function AboutPage() {
  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold">About TogetherFlow</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're building the future of collaborative productivity, helping teams work together 
          more effectively with intuitive tools and seamless communication.
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              To empower teams worldwide with collaborative tools that make work more productive, 
              enjoyable, and meaningful. We believe that when people can work together seamlessly, 
              they can achieve extraordinary things.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Values Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-3xl font-bold text-center">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Card className="h-full text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-8">
            <div className="grid gap-8 md:grid-cols-3 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <p className="text-muted-foreground">Active Teams</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">50K+</div>
                <p className="text-muted-foreground">Projects Created</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">1M+</div>
                <p className="text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="space-y-6"
      >
        <h2 className="text-3xl font-bold text-center">Meet Our Team</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            >
              <Card className="text-center">
                <CardHeader>
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-lg">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recognition Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Award className="h-6 w-6" />
              Recognition & Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3 text-center">
              <div>
                <h3 className="font-semibold">Best Collaboration Tool 2024</h3>
                <p className="text-sm text-muted-foreground">ProductHunt Awards</p>
              </div>
              <div>
                <h3 className="font-semibold">Top 10 Productivity Apps</h3>
                <p className="text-sm text-muted-foreground">TechCrunch</p>
              </div>
              <div>
                <h3 className="font-semibold">Innovation in Workplace Tech</h3>
                <p className="text-sm text-muted-foreground">Startup Awards 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Globe className="h-6 w-6" />
              Get in Touch
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Have questions or want to learn more about TogetherFlow? We'd love to hear from you.
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> hello@togetherflow.com</p>
              <p><strong>Twitter:</strong> @togetherflow</p>
              <p><strong>LinkedIn:</strong> /company/togetherflow</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

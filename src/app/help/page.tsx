"use client"

import { useState } from "react"
import { motion } from "@/components/motion"
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FolderOpen,
  CheckSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const faqData = [
  {
    question: "How do I create a new project?",
    answer: "To create a new project, navigate to the Projects page and click the 'New Project' button. Fill in the project details and click 'Create Project'."
  },
  {
    question: "How can I invite team members to a project?",
    answer: "Go to your project page, click on the 'Members' tab, and use the 'Invite Members' button to send invitations via email."
  },
  {
    question: "Can I change my notification settings?",
    answer: "Yes! Go to Settings > Notifications to customize which notifications you receive and how you receive them."
  },
  {
    question: "How do I switch between light and dark mode?",
    answer: "Use the theme toggle button in the header, or go to Settings > Appearance to choose your preferred theme."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption and security measures to protect your data. All communications are encrypted in transit and at rest."
  },
  {
    question: "How do I delete my account?",
    answer: "Go to Settings > Account and scroll down to the 'Danger Zone' section. Please note that account deletion is permanent and cannot be undone."
  }
]

const helpCategories = [
  {
    title: "Getting Started",
    icon: Book,
    articles: [
      "Setting up your first project",
      "Inviting team members",
      "Understanding the dashboard",
      "Basic navigation"
    ]
  },
  {
    title: "Project Management",
    icon: FolderOpen,
    articles: [
      "Creating and organizing projects",
      "Managing project settings",
      "Project templates",
      "Archiving projects"
    ]
  },
  {
    title: "Task Management",
    icon: CheckSquare,
    articles: [
      "Creating and assigning tasks",
      "Task priorities and due dates",
      "Task status and workflows",
      "Task dependencies"
    ]
  },
  {
    title: "Communication",
    icon: MessageCircle,
    articles: [
      "Using project chat",
      "Direct messaging",
      "Notifications and mentions",
      "File sharing"
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const filteredFaq = faqData.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HelpCircle className="h-8 w-8" />
          Help & Support
        </h1>
        <p className="text-muted-foreground mt-1">
          Find answers to common questions and get help with TogetherFlow
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help articles, FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Help Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle>Help Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {helpCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <category.icon className="h-4 w-4" />
                    {category.title}
                  </h3>
                  <ul className="space-y-1 ml-6">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                          {article}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredFaq.map((faq, index) => (
                <Collapsible
                  key={index}
                  open={openFaq === index}
                  onOpenChange={(isOpen) => setOpenFaq(isOpen ? index : null)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <span className="font-medium">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 py-3 text-muted-foreground">
                    {faq.answer}
                  </CollapsibleContent>
                </Collapsible>
              ))}
              
              {filteredFaq.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No results found for "{searchQuery}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Still need help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <MessageCircle className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">
                    Chat with our support team
                  </p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Mail className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">
                    Send us an email
                  </p>
                </div>
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center">
                For technical issues or feature requests, visit our{" "}
                <button className="text-blue-500 hover:underline inline-flex items-center gap-1">
                  documentation
                  <ExternalLink className="h-3 w-3" />
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the Visualization component with no SSR
const NetworkVisualization = dynamic(() => import("./network-visualization"), { ssr: false })

export default function Page() {
  const [activeSection, setActiveSection] = useState("")
  const [scrollProgress, setScrollProgress] = useState(0)
  const observer = useRef<IntersectionObserver | null>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const progress = Math.min(scrollPosition / windowHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0.1,
      },
    )

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.current?.observe(section)
    })

    return () => observer.current?.disconnect()
  }, [])

  const sections = [
    {
      id: "problem-outline",
      title: "General Problem Outline",
      content:
        "Humanity faces unprecedented challenges that require collective action and innovative solutions. From climate change to social inequality, our problems are interconnected and complex.",
    },
    {
      id: "problem-defined",
      title: "Problem Clearly Defined",
      content:
        "Our current systems and institutions are not equipped to handle the scale and complexity of global challenges. We need new frameworks for collaboration and problem-solving.",
    },
    {
      id: "subproblems",
      title: "Subproblems & Consequences",
      content:
        "The cascading effects of our global challenges impact every aspect of society, from economic stability to social cohesion and environmental sustainability.",
    },
    {
      id: "status-quo",
      title: "Status Quo",
      content:
        "Despite technological advances and increased awareness, we continue to face barriers to meaningful change. Traditional approaches are proving insufficient.",
    },
    {
      id: "call-to-action",
      title: "Call for Action",
      content: "Join the movement to create positive change. Every contribution matters.",
    },
  ]

  const opportunities = [
    {
      title: "Volunteer Programs",
      description: "Join local and global initiatives making a direct impact in communities.",
      action: "Join Now",
    },
    {
      title: "Research & Innovation",
      description: "Contribute to groundbreaking research and development projects.",
      action: "Learn More",
    },
    {
      title: "Education & Awareness",
      description: "Help spread knowledge and build understanding of critical issues.",
      action: "Get Started",
    },
    {
      title: "Policy & Advocacy",
      description: "Support and participate in policy-making and advocacy efforts.",
      action: "Take Action",
    },
    {
      title: "Community Building",
      description: "Create and strengthen connections within your local community.",
      action: "Connect",
    },
    {
      title: "Sustainable Solutions",
      description: "Develop and implement sustainable practices in your area.",
      action: "Explore",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Network Visualization */}
      <div className="relative h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${1 - scrollProgress * 0.3}) translateY(${scrollProgress * -30}%)`,
            opacity: 1 - scrollProgress,
          }}
        >
          <NetworkVisualization scrollProgress={scrollProgress} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{
            opacity: 1 - scrollProgress,
          }}
        >
          <p className="animate-fade-in mb-6 text-lg font-medium text-primary/80">Understanding & Solving</p>
          <h1 className="animate-title max-w-4xl font-display text-5xl font-bold tracking-tight md:text-6xl lg:text-8xl">
            Humanity's Greatest
            <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              {" "}
              Challenges
            </span>
          </h1>
          <p className="animate-fade-in mt-8 max-w-2xl text-xl text-muted-foreground md:text-2xl">
            A collaborative platform tracking global issues and connecting those working to solve them
          </p>
          <Button
            size="lg"
            className="animate-fade-in mt-12 text-lg"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
          >
            Explore Challenges
            <ChevronDown className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4">
        <div className="relative">
          {sections.map(({ id, title, content }) => (
            <section
              key={id}
              id={id}
              ref={(el) => (sectionRefs.current[id] = el)}
              className="relative min-h-screen py-24"
            >
              <div className="sticky top-8 z-10 mb-12">
                <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">{title}</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <p className="text-lg text-muted-foreground md:text-xl lg:text-2xl">{content}</p>

                {id === "call-to-action" && (
                  <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {opportunities.map((opportunity, index) => (
                      <Card
                        key={index}
                        className="group flex flex-col justify-between p-6 transition-all duration-300 hover:scale-105"
                      >
                        <div className="space-y-2">
                          <h3 className="font-display text-xl font-bold">{opportunity.title}</h3>
                          <p className="text-muted-foreground">{opportunity.description}</p>
                        </div>
                        <Button className="mt-4 w-full transition-transform group-hover:translate-x-1">
                          {opportunity.action}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}


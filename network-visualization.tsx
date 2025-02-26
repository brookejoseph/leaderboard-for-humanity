"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  connections: THREE.Vector3[]
}

export default function NetworkVisualization({ scrollProgress }: { scrollProgress: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    particles: Particle[]
    lines: THREE.Line[]
    time: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Create particles
    const particles: Particle[] = []
    const particleCount = 100
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8)
    const particleMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x00aa44,
      specular: 0x66ffaa,
      shininess: 30,
    })

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const radius = 5 + Math.random() * 2

      particle.position.x = radius * Math.sin(phi) * Math.cos(theta)
      particle.position.y = radius * Math.sin(phi) * Math.sin(theta)
      particle.position.z = radius * Math.cos(phi)

      scene.add(particle)

      particles.push({
        position: particle.position,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ),
        connections: [],
      })
    }

    // Create lines for connections
    const lines: THREE.Line[] = []
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.2,
    })

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ff88, 2, 100)
    pointLight.position.set(0, 0, 0)
    scene.add(pointLight)

    // Position camera
    camera.position.z = 10

    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles,
      lines,
      time: 0,
    }

    // Handle window resize
    const handleResize = () => {
      if (!sceneRef.current) return
      const { camera, renderer } = sceneRef.current
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return
      const { scene, camera, renderer, particles, lines, time } = sceneRef.current

      // Update particle positions
      particles.forEach((particle) => {
        particle.position.add(particle.velocity)

        // Keep particles within bounds
        if (particle.position.length() > 7) {
          particle.position.normalize().multiplyScalar(7)
          particle.velocity.multiplyScalar(-1)
        }
      })

      // Update connections
      lines.forEach((line) => scene.remove(line))
      lines.length = 0

      // Create new connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const distance = particles[i].position.distanceTo(particles[j].position)
          if (distance < 2) {
            const geometry = new THREE.BufferGeometry().setFromPoints([particles[i].position, particles[j].position])
            const line = new THREE.Line(geometry, lineMaterial)
            scene.add(line)
            lines.push(line)
          }
        }
      }

      // Rotate camera
      camera.position.x = Math.sin(time * 0.1) * 12
      camera.position.z = Math.cos(time * 0.1) * 12
      camera.lookAt(0, 0, 0)

      sceneRef.current.time += 0.01

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Update visualization based on scroll progress
  useEffect(() => {
    if (!sceneRef.current) return
    const { camera } = sceneRef.current

    // Pull back camera as user scrolls
    camera.position.multiplyScalar(1 + scrollProgress * 0.5)
  }, [scrollProgress])

  return <div ref={containerRef} className="h-full w-full" />
}


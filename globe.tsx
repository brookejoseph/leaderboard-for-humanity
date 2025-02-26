"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function Globe({ scrollProgress }: { scrollProgress: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    globe: THREE.Mesh
    rotation: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Create globe
    const geometry = new THREE.SphereGeometry(5, 64, 64)
    const material = new THREE.MeshPhongMaterial({
      color: 0x2a3f5f,
      emissive: 0x112244,
      specular: 0x333333,
      shininess: 25,
      transparent: true,
      opacity: 0.9,
    })

    const globe = new THREE.Mesh(geometry, material)
    scene.add(globe)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)

    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 1.5)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    // Add grid lines
    const gridGeometry = new THREE.SphereGeometry(5.1, 32, 32)
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a5f7f,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    })
    const gridSphere = new THREE.Mesh(gridGeometry, gridMaterial)
    scene.add(gridSphere)

    // Position camera
    camera.position.z = 15

    // Animation variables
    const rotation = 0

    globeRef.current = {
      scene,
      camera,
      renderer,
      globe,
      rotation,
    }

    // Handle window resize
    const handleResize = () => {
      if (!globeRef.current) return
      const { camera, renderer } = globeRef.current
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      if (!globeRef.current) return
      const { scene, camera, renderer, globe } = globeRef.current

      globeRef.current.rotation += 0.001
      globe.rotation.y = globeRef.current.rotation

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

  // Update globe based on scroll progress
  useEffect(() => {
    if (!globeRef.current) return
    const { globe } = globeRef.current

    // Scale and rotate based on scroll
    globe.scale.setScalar(1 - scrollProgress * 0.3)
    globe.rotation.x = scrollProgress * Math.PI * 0.5
  }, [scrollProgress])

  return <div ref={containerRef} className="h-full w-full" />
}


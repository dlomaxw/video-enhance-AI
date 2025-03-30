import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { VideoUploader } from "@/components/video-uploader"
import { HowToSection } from "@/components/how-to-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <Hero />
        </div>
        <div className="mx-auto max-w-3xl">
          <VideoUploader />
        </div>
        <HowToSection />
      </div>
    </main>
  )
}


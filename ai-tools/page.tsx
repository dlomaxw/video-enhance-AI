"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TextGeneration } from "@/components/ai-tools/text-generation"
import { ImageAnalysis } from "@/components/ai-tools/image-analysis"
import { AudioTranscription } from "@/components/ai-tools/audio-transcription"
import { ModelSelector } from "@/components/ai-tools/model-selector"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { AIModel } from "@/types/ai-models"

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState("text")
  const [selectedModel, setSelectedModel] = useLocalStorage<AIModel>("selected-ai-model", "gpt-o3")

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI Tools</h1>
          <p className="text-gray-600 mt-2">
            Leverage powerful AI models for text generation, image analysis, and audio transcription
          </p>
        </div>

        <div className="mb-6">
          <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="text">Text Generation</TabsTrigger>
            <TabsTrigger value="image">Image Analysis</TabsTrigger>
            <TabsTrigger value="audio">Audio Transcription</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <TextGeneration model={selectedModel} />
          </TabsContent>

          <TabsContent value="image">
            <ImageAnalysis model={selectedModel} />
          </TabsContent>

          <TabsContent value="audio">
            <AudioTranscription model={selectedModel} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}


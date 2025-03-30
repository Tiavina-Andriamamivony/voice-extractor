"use client"

import { useState } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL } from "@ffmpeg/util"
import { fetchFile } from "@ffmpeg/util"

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [ffmpeg] = useState(() => new FFmpeg())
  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    if (loaded) return

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL("/ffmpeg-core.js", "text/javascript"),
        wasmURL: await toBlobURL("/ffmpeg-core.wasm", "application/wasm"),
      })
      setLoaded(true)
    } catch (error) {
      console.error("Error loading FFmpeg:", error)
    }
  }

  const extractAudio = async (file: File) => {
    setIsProcessing(true)

    try {
      // Load FFmpeg if not already loaded
      if (!loaded) {
        await load()
      }

      // Write the input file to memory
      await ffmpeg.writeFile("input.mp4", await fetchFile(file))

      // Run the FFmpeg command to extract audio
      await ffmpeg.exec(["-i", "input.mp4", "-vn", "-acodec", "copy", "output.mp4"])

      // Read the output file
      const data = await ffmpeg.readFile("output.mp4")

      // Create a blob URL for the audio
      const blob = new Blob([data], { type: "audio/mp4" })
      const url = URL.createObjectURL(blob)

      // Clean up previous URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }

      setAudioUrl(url)
    } catch (error) {
      console.error("Error extracting audio:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Extracteur de Voix</h1>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && extractAudio(e.target.files[0])}
              className="w-full"
              disabled={isProcessing}
            />
            <p className="mt-2 text-sm text-gray-500">Déposez votre vidéo ici ou cliquez pour sélectionner</p>
          </div>

          {isProcessing && (
            <div className="text-center">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
              <p className="mt-2">Extraction en cours...</p>
            </div>
          )}

          {audioUrl && !isProcessing && (
            <div className="text-center">
              <audio controls src={audioUrl} className="mb-4 w-full" />
              <a
                href={audioUrl}
                download="audio.mp4"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
              >
                Télécharger l'audio
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}


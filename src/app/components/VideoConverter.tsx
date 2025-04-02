"use client"
import React, { useState } from 'react';
import { convertVideoToAudio, ConversionResult } from '../utils/videoToAudio';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Music } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Download, Play } from "lucide-react";

const VideoConverter: React.FC = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const baseFileName = file.name.replace(/\.[^/.]+$/, '');
    setFileName(baseFileName);
    setIsConverting(true);
    setResult(null);
    setAudioUrl(null);

    try {
      const conversionResult = await convertVideoToAudio(file);
      
      if (conversionResult.success && conversionResult.audioBlob) {
        // Specify the correct MIME type
        const audioBlob = new Blob([conversionResult.audioBlob], { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      }
      
      setResult(conversionResult);
    } catch (error) {
      setResult({
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl || !result?.success) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${fileName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cleanup URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <CardHeader className="space-y-2 sm:space-y-3">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Music className="w-5 h-5 sm:w-6 sm:h-6" />
            Video to Audio Converter
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Convert your video files to audio format
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="video-file" className="text-sm sm:text-base">
              Select video file
            </Label>
            <div className="relative">
              <input
                id="video-file"
                type="file"
                accept="video/*,.mkv"
                onChange={handleFileSelect}
                disabled={isConverting}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full h-16 sm:h-24 border-dashed text-sm sm:text-base"
                disabled={isConverting}
                onClick={() => document.getElementById('video-file')?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>{isConverting ? 'Converting...' : 'Click to select or drag video here'}</span>
                </div>
              </Button>
            </div>
          </div>

          {result?.success && audioUrl && (
            <div className="space-y-4">
              <audio 
                ref={audioRef}
                controls 
                className="w-full"
                preload="metadata"
              >
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
              <Button 
                onClick={handleDownload}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Audio
              </Button>
            </div>
          )}

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertDescription className="text-sm sm:text-base">
                {result.message}
                {result.success && (
                  <div className="mt-2 font-medium">
                    Audio conversion completed
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoConverter;
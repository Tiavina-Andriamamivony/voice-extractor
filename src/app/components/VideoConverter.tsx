"use client"
import React, { useState } from 'react';
import { convertVideoToAudio, ConversionResult } from '../utils/videoToAudio';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Music } from "lucide-react";

const VideoConverter: React.FC = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Remove the original extension for the download filename
    const baseFileName = file.name.replace(/\.[^/.]+$/, '');

    setIsConverting(true);
    setResult(null);

    try {
      const conversionResult = await convertVideoToAudio(file);
      
      if (conversionResult.success && conversionResult.audioBlob) {
        const url = URL.createObjectURL(conversionResult.audioBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseFileName}.wav`;  // Use the clean filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
                accept="video/*"
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

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertDescription className="text-sm sm:text-base">
                {result.message}
                {result.success && (
                  <div className="mt-2 font-medium">
                    Audio file has been downloaded
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
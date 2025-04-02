import { exec } from 'child_process';
import path from 'path';

export interface ConversionResult {
  success: boolean;
  message: string;
  audioBlob?: Blob;
}

export async function convertVideoToAudio(file: File): Promise<ConversionResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Conversion failed');
    }

    const audioBlob = await response.blob();
    
    return {
      success: true,
      message: 'Successfully converted video to audio!',
      audioBlob
    };
  } catch (error) {
    return {
      success: false,
      message: `Conversion error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    
    if (!file) {
      console.error('API: No file received in the request');
      return NextResponse.json(
        { error: 'No file provided in the request' },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      console.log('API: Creating temp directory...');
      await mkdir(tempDir, { recursive: true });
    }

    const videoPath = path.join(tempDir, file.name);
    const wavPath = path.join(tempDir, `${file.name}.wav`);
    const mp3Path = path.join(tempDir, `${file.name}.mp3`);

    try {
      console.log('API: Converting file buffer...');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      console.log(`API: Saving video file to ${videoPath}`);
      await writeFile(videoPath, buffer);
    } catch (error) {
      console.error('API: Error saving video file:', error);
      return NextResponse.json(
        { error: 'Failed to save uploaded file' },
        { status: 500 }
      );
    }

    try {
      console.log('API: Starting video to WAV conversion...');
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${videoPath}" "${wavPath}"`, (error) => {
          if (error) {
            console.error('API: FFmpeg conversion error:', error);
            reject(new Error('FFmpeg conversion failed'));
            return;
          }
          resolve(true);
        });
      });

      // Clean up the video file
      exec(`del "${videoPath}"`, (error) => {
        if (error) {
          console.error('API: Cleanup error:', error);
        }
      });

      console.log('API: WAV conversion successful');
      return NextResponse.json(
        { 
          success: true,
          message: 'Video successfully converted to WAV',
          outputPath: wavPath
        },
        { status: 200 }
      );

    } catch (error) {
      console.error('API: Conversion process failed:', error);
      return NextResponse.json(
        { error: 'Audio conversion failed. Please ensure FFmpeg is properly installed.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during conversion' },
      { status: 500 }
    );
  }
}
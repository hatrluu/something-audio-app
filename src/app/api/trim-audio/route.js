import { exec } from 'child_process';
import { unlink, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio');
        const startTime = parseFloat(formData.get('startTime'));
        const endTime = parseFloat(formData.get('endTime'));

        if (!audioFile || typeof startTime !== 'number' || typeof endTime !== 'number') {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log('Create temporary file paths');
        // Create temporary file paths
        const inputPath = path.join('/tmp', `input-${Date.now()}.mp3`);
        const outputPath = path.join('/tmp', `output-${Date.now()}.mp3`);

        console.log('Write uploaded file to disk');
        // Write uploaded file to disk
        const buffer = Buffer.from(await audioFile.arrayBuffer());
        console.log(inputPath);
        await writeFile(inputPath, buffer);

        console.log('Use FFmpeg to trim the audio');
        // Use FFmpeg to trim the audio
        const duration = endTime - startTime;
        await execAsync(
            `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${duration} -acodec copy "${outputPath}"`
        );

        console.log('Read the trimmed file');
        // Read the trimmed file
        const trimmedBuffer = await readFile(outputPath);

        console.log('Cleanup temporary files');
        // Cleanup temporary files
        await Promise.all([
            unlink(inputPath),
            unlink(outputPath)
        ]);

        console.log('Return the trimmed audio');
        // Return the trimmed audio
        return new NextResponse(trimmedBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename="trimmed.mp3"`,
            },
        });
    } catch (error) {
        console.error('Error processing audio:', error);
        return NextResponse.json(
            { error: 'Failed to process audio' },
            { status: 500 }
        );
    }
}
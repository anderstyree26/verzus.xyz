import { spawn } from 'node:child_process';
import { namedLogger } from '../logger';

const log = namedLogger('FrameGrabber');

/**
 * Extracts a single frame buffer from an HLS stream URL using ffmpeg.
 */
export class FrameGrabber {
  /**
   * Pulls one frame from the stream URL as a PNG buffer.
   */
  async grabFrame(streamUrl: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const args = [
        '-y',
        '-ss', '00:00:01',
        '-i', streamUrl,
        '-vframes', '1',
        '-f', 'image2pipe',
        '-vcodec', 'png',
        'pipe:1',
      ];

      const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
      const chunks: Buffer[] = [];
      const errChunks: Buffer[] = [];

      proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
      proc.stderr.on('data', (chunk: Buffer) => errChunks.push(chunk));

      proc.on('close', (code) => {
        if (code === 0 && chunks.length > 0) {
          resolve(Buffer.concat(chunks));
        } else {
          const errText = Buffer.concat(errChunks).toString('utf-8');
          log.warn({ code, err: errText.slice(-300) }, 'ffmpeg frame grab failed');
          reject(new Error(`ffmpeg exited with code ${code}: ${errText.slice(-200)}`));
        }
      });

      proc.on('error', (err) => {
        log.warn({ err }, 'ffmpeg process error');
        reject(err);
      });
    });
  }
}

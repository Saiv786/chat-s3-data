import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const child = spawn('yarn', ['ingest'], { shell: true });

    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        output += 'Ingestion completed successfully\n';
        res.status(200).json({ success: true, output });
      } else {
        output += `Ingestion failed with code ${code}\n`;
        res.status(500).json({ success: false, output });
      }
    });

    child.on('error', (err) => {
      output += `Error: ${err.message}\n`;
      res.status(500).json({ success: false, output });
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, output: `Error: ${error.message}\n` });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import util from 'util';

type SuccessResponse = {
    audioContent: string;
};

type ErrorResponse = {
    error: string;
};

type Data = SuccessResponse | ErrorResponse;

const client = new textToSpeech.TextToSpeechClient({
    keyFilename: 'google-cloud-key.json'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const text = req.body.text;
    const request = {
        input: { text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' as const },
        audioConfig: { audioEncoding: 'MP3' as const },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);

        if (!response.audioContent) {
            throw new Error('Audio content is empty');
        }

        const writeFile = util.promisify(fs.writeFile);
        await writeFile('output.mp3', response.audioContent, 'binary');

        res.status(200).json({ audioContent: response.audioContent.toString() });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}

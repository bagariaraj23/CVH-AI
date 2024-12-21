import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const text = formData.get('text');
        const audioFile = formData.get('audioFile');

        if (!text && !audioFile) {
            return NextResponse.json(
                { error: 'Either audioFile or text is required.', details: 'No input provided.' },
                { status: 400 }
            );
        }

        let transcription = null;
        let responseSummary = null;

        // Step 1: Process audio file if provided
        if (audioFile) {
            const tempFilePath = path.join(os.tmpdir(), audioFile.name);
            fs.writeFileSync(tempFilePath, Buffer.from(await audioFile.arrayBuffer()));

            const openAIFormData = new FormData();
            openAIFormData.append('file', fs.createReadStream(tempFilePath));
            openAIFormData.append('model', 'whisper-1');

            const whisperResponse = await axios.post(
                'https://api.openai.com/v1/audio/transcriptions',
                openAIFormData,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                        ...openAIFormData.getHeaders(),
                    },
                }
            );

            transcription = whisperResponse.data.text;
            fs.unlinkSync(tempFilePath);
        }

        // Step 2: Use transcription or text input for analysis
        const inputText = transcription || text;

        if (inputText) {
            const gptResponse = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'user',
                            content: `
                                Analyze the following symptom description and provide:
                                - Likely conditions.
                                - Severity level (e.g., mild, moderate, critical).
                                - Recommended next steps (e.g., self-care, consult a doctor, emergency care).
                                - Identify red flag symptoms (if any).

                                Description:
                                "${inputText}"
                            `,
                        },
                    ],
                    max_tokens: 1000,
                    temperature: 0.7,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    },
                }
            );

            // Parse the response into separate sections
            const responseText = gptResponse.data.choices[0]?.message.content || '';
            responseSummary = {
                likelyConditions: responseText.split('- Likely conditions:')[1]?.split('- Severity level:')[0]?.trim() || 'Not identified.',
                severityLevel: responseText.split('- Severity level:')[1]?.split('- Recommended next steps:')[0]?.trim() || 'Not identified.',
                nextSteps: responseText.split('- Recommended next steps:')[1]?.split('- Identify red flag symptoms:')[0]?.trim() || 'No next steps provided.',
                redFlagSymptoms: responseText.split('- Identify red flag symptoms:')[1]?.trim() || 'No red flag symptoms identified.',
            };
        }

        return NextResponse.json({ data: { transcription, responseSummary } });
    } catch (error) {
        console.error('Backend Error:', error.message);
        return NextResponse.json(
            { error: error.message, details: error.response?.data || 'No additional details available.' },
            { status: 500 }
        );
    }
}

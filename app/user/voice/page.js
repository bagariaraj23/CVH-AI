'use client';
import React, { useState } from 'react';
import { ReactMediaRecorder } from "react-media-recorder";

export default function VoiceSymptomChecker() {
    const [textInput, setTextInput] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const handleFileChange = (e) => {
        setAudioFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            if (audioFile) {
                formData.append('audioFile', audioFile);
            } else {
                formData.append('text', textInput);
            }

            const res = await fetch('/api/openai', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setResult(data.data);
        } catch (err) {
            console.error('Error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container my-5">
            <h1>Text & Voice Symptom Checker</h1>
            <form onSubmit={handleSubmit}>
                {/* Text Input */}
                <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows="5"
                    placeholder="Describe your symptoms..."
                    className="form-control mb-4"
                    disabled={!!audioFile || isRecording}
                ></textarea>

                {/* Audio File Upload */}
                <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="form-control mb-4"
                    disabled={!!textInput || isRecording}
                />

                {/* Audio Recording */}
                <div className="mb-4">
                    <ReactMediaRecorder
                        audio
                        onStop={(blobUrl, blob) => {
                            setAudioFile(new File([blob], "recording.webm", { type: "audio/webm" }));
                            setIsRecording(false);
                        }}
                        render={({ startRecording, stopRecording, mediaBlobUrl }) => (
                            <>
                                {!isRecording ? (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary w-100 mb-2"
                                        onClick={() => {
                                            setIsRecording(true);
                                            startRecording();
                                        }}
                                        disabled={!!textInput || !!audioFile}
                                    >
                                        Start Recording
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-danger w-100 mb-2"
                                        onClick={stopRecording}
                                    >
                                        Stop Recording
                                    </button>
                                )}
                                {mediaBlobUrl && (
                                    <audio controls src={mediaBlobUrl} className="mt-3 w-100"></audio>
                                )}
                            </>
                        )}
                    />
                </div>

                {/* Submit Button */}
                <button className="btn btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Submit'}
                </button>
            </form>

            {/* Results Section */}
            {result && (
                <div className="mt-4">
                    <h3>Results</h3>
                    <p>Transcription: {result.transcription || 'No transcription available'}</p>
                    <p>Likely Conditions: {result.responseSummary.likelyConditions}</p>
                    <p>Severity Level: {result.responseSummary.severityLevel}</p>
                    <p>Next Steps: {result.responseSummary.nextSteps}</p>
                    <p>Red Flag Symptoms: {result.responseSummary.redFlagSymptoms}</p>
                </div>
            )}
        </div>
    );
}

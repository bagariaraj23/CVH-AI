'use client';
import React, { useState } from 'react';

export default function TextSymptomChecker() {
    const [textInput, setTextInput] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('text', textInput);

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
            <h1>Text-Based Symptom Checker</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows="5"
                    placeholder="Describe your symptoms..."
                    className="form-control mb-4"
                ></textarea>
                <button className="btn btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Submit'}
                </button>
            </form>
            {result && (
                <div className="mt-4">
                    <h3>Results</h3>
                    <p>Likely Conditions: {result.responseSummary.likelyConditions}</p>
                    <p>Severity Level: {result.responseSummary.severityLevel}</p>
                    <p>Next Steps: {result.responseSummary.nextSteps}</p>
                    <p>Red Flag Symptoms: {result.responseSummary.redFlagSymptoms}</p>
                </div>
            )}
        </div>
    );
}

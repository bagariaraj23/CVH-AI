'use client';
import React from 'react';
import Link from 'next/link';

export default function SymptomCheckerHome() {
    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">AI Symptom Checker</h1>
            <p className="text-muted text-center mb-4">
                Choose your preferred method for checking symptoms: text-based or voice-based.
            </p>

            <div className="d-flex flex-column align-items-center">
                <Link href="/user/text" passHref>
                    <button className="btn btn-primary mb-3 w-50">
                        Text-Based Symptom Checker
                    </button>
                </Link>
                <Link href="/user/voice" passHref>
                    <button className="btn btn-secondary w-50">
                        Text & Voice Symptom Checker
                    </button>
                </Link>
            </div>
        </div>
    );
}

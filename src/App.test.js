import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
describe('App', () => {
    it('renders transcription app', () => {
        render(_jsx(App, {}));
        expect(screen.getByText('Real-time Audio Transcription')).toBeInTheDocument();
        expect(screen.getByText('Enter API key to begin')).toBeInTheDocument();
        expect(screen.getByLabelText('Start recording')).toBeInTheDocument();
        expect(screen.getByText('DeepGram API Configuration')).toBeInTheDocument();
    });
    it('shows API key input', () => {
        render(_jsx(App, {}));
        expect(screen.getByLabelText('API Key')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your DeepGram API key')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
    });
    it('shows transcript display area', () => {
        render(_jsx(App, {}));
        expect(screen.getByText('Live Transcript')).toBeInTheDocument();
        expect(screen.getByText('Start recording to see transcript here')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });
    it('record button is disabled without API key', () => {
        render(_jsx(App, {}));
        const recordButton = screen.getByLabelText('Start recording');
        expect(recordButton).toBeDisabled();
    });
});

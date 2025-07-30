import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders transcription app', () => {
    render(<App />);
    expect(
      screen.getByText('Real-time Audio Transcription')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Start recording')).toBeInTheDocument();
    expect(screen.getByText('Deepgram API Status')).toBeInTheDocument();
  });

  it('shows transcript display area', () => {
    render(<App />);
    expect(screen.getByText('Live Transcript')).toBeInTheDocument();
    expect(
      screen.getByText('Start recording to see transcript here')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});

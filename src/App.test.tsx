import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders audio capture demo', () => {
    render(<App />);
    expect(screen.getByText('Audio Capture Demo')).toBeInTheDocument();
    expect(screen.getByText('Ready to record')).toBeInTheDocument();
    expect(screen.getByLabelText('Start recording')).toBeInTheDocument();
  });

  it('shows recording status when start recording is clicked', async () => {
    render(<App />);
    
    const recordButton = screen.getByLabelText('Start recording');
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByText('Recording...')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Stop recording')).toBeInTheDocument();
  });

  it('shows audio level when recording', async () => {
    render(<App />);
    
    const recordButton = screen.getByLabelText('Start recording');
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Audio Level:/)).toBeInTheDocument();
    });
  });

  it('can stop recording', async () => {
    render(<App />);
    
    // Start recording
    const recordButton = screen.getByLabelText('Start recording');
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByText('Recording...')).toBeInTheDocument();
    });

    // Stop recording
    const stopButton = screen.getByLabelText('Stop recording');
    fireEvent.click(stopButton);
    
    await waitFor(() => {
      expect(screen.getByText('Ready to record')).toBeInTheDocument();
    });
  });
});

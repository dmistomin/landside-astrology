import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AudioControls } from './AudioControls';

describe('AudioControls', () => {
  it('renders start recording button when not recording', () => {
    const onToggleRecording = vi.fn();

    render(
      <AudioControls
        isRecording={false}
        isLoading={false}
        onToggleRecording={onToggleRecording}
      />
    );

    const button = screen.getByLabelText('Start recording');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders stop recording button when recording', () => {
    const onToggleRecording = vi.fn();

    render(
      <AudioControls
        isRecording={true}
        isLoading={false}
        onToggleRecording={onToggleRecording}
      />
    );

    const button = screen.getByLabelText('Stop recording');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('disables button when loading', () => {
    const onToggleRecording = vi.fn();

    render(
      <AudioControls
        isRecording={false}
        isLoading={true}
        onToggleRecording={onToggleRecording}
      />
    );

    const button = screen.getByLabelText('Start recording');
    expect(button).toBeDisabled();
  });

  it('calls onToggleRecording when clicked', () => {
    const onToggleRecording = vi.fn();

    render(
      <AudioControls
        isRecording={false}
        isLoading={false}
        onToggleRecording={onToggleRecording}
      />
    );

    const button = screen.getByLabelText('Start recording');
    fireEvent.click(button);

    expect(onToggleRecording).toHaveBeenCalledTimes(1);
  });

  it('shows different visual states for recording and not recording', () => {
    const onToggleRecording = vi.fn();

    const { rerender } = render(
      <AudioControls
        isRecording={false}
        isLoading={false}
        onToggleRecording={onToggleRecording}
      />
    );

    const button = screen.getByLabelText('Start recording');
    expect(button).toHaveClass('bg-red-900/70');

    rerender(
      <AudioControls
        isRecording={true}
        isLoading={false}
        onToggleRecording={onToggleRecording}
      />
    );

    const recordingButton = screen.getByLabelText('Stop recording');
    expect(recordingButton).toHaveClass('bg-red-500');
  });
});

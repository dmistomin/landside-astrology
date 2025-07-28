import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { AudioLevelIndicator } from './components/AudioLevelIndicator';
import { ApiKeyInput } from './components/ApiKeyInput';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { useAudioTranscription } from './hooks/useAudioTranscription';
function App() {
    const [apiKey, setApiKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { isRecording, audioLevel, connectionState, transcriptSegments, error, transcriptionError, startRecording, stopRecording, clearTranscript, } = useAudioTranscription({ apiKey });
    const handleToggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        }
        else {
            if (!apiKey) {
                return;
            }
            setIsLoading(true);
            try {
                await startRecording();
            }
            catch (err) {
                console.error('Failed to start recording:', err);
            }
            finally {
                setIsLoading(false);
            }
        }
    };
    const handleApiKeySubmit = (newApiKey) => {
        setApiKey(newApiKey);
    };
    const isConnected = connectionState === 'connected';
    const canRecord = apiKey && isConnected && !isLoading;
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6 px-4", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 text-center mb-8", children: "Real-time Audio Transcription" }), _jsx(ApiKeyInput, { onApiKeySubmit: handleApiKeySubmit, currentApiKey: apiKey, isConnected: isConnected, error: transcriptionError?.message }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "p-6 border border-gray-200 rounded-lg bg-white", children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 mb-4", children: "Audio Recording" }), _jsxs("div", { className: "text-center mb-6", children: [_jsx("p", { className: "text-sm text-gray-500 mb-2", children: "Status" }), _jsx("p", { className: "text-lg font-medium text-gray-900", children: isRecording ? 'Recording & Transcribing...' :
                                                        isConnected ? 'Ready to record' :
                                                            apiKey ? 'Connecting...' : 'Enter API key to begin' }), connectionState !== 'idle' && connectionState !== 'connected' && (_jsxs("p", { className: "text-sm text-gray-500 mt-1 capitalize", children: ["Connection: ", connectionState] }))] }), _jsx("div", { className: "flex justify-center mb-6", children: _jsx(AudioLevelIndicator, { level: audioLevel, isActive: isRecording }) }), _jsx("div", { className: "flex justify-center mb-4", children: _jsx(AudioControls, { isRecording: isRecording, isLoading: isLoading, onToggleRecording: handleToggleRecording, disabled: !canRecord }) }), isRecording && (_jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-xs text-gray-500", children: ["Audio Level: ", audioLevel, "%"] }) }))] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex", children: [_jsx("svg", { className: "w-4 h-4 text-red-400 mt-0.5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-red-800", children: "Audio Error" }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: error })] })] }) }))] }), _jsx("div", { children: _jsx(TranscriptDisplay, { segments: transcriptSegments, isRecording: isRecording, onClear: clearTranscript }) })] })] }) }));
}
export default App;

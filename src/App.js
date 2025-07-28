import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AudioControls } from './components/AudioControls';
import { AudioLevelIndicator } from './components/AudioLevelIndicator';
import { useAudioStream } from './hooks/useAudioStream';
function App() {
    const { isRecording, audioLevel, error, startRecording, stopRecording } = useAudioStream();
    const [isLoading, setIsLoading] = useState(false);
    const handleToggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        }
        else {
            setIsLoading(true);
            await startRecording();
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-900 flex items-center justify-center", children: _jsxs("div", { className: "bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-8 text-center", children: "Audio Capture Demo" }), _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-400 mb-2", children: "Status" }), _jsx("p", { className: "text-lg font-medium text-white", children: isRecording ? 'Recording...' : 'Ready to record' })] }), _jsx("div", { className: "flex justify-center", children: _jsx(AudioLevelIndicator, { level: audioLevel, isActive: isRecording }) }), _jsx("div", { className: "flex justify-center", children: _jsx(AudioControls, { isRecording: isRecording, isLoading: isLoading, onToggleRecording: handleToggleRecording }) }), error && (_jsx("div", { className: "bg-red-900/20 border border-red-500/50 rounded-lg p-4", children: _jsx("p", { className: "text-red-400 text-sm text-center", children: error }) })), isRecording && (_jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-xs text-gray-500", children: ["Audio Level: ", audioLevel, "%"] }) }))] })] }) }));
}
export default App;

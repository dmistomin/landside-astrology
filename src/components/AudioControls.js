import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const AudioControls = ({ isRecording, isLoading, onToggleRecording, }) => {
    return (_jsxs("button", { onClick: onToggleRecording, disabled: isLoading, className: `
        relative flex items-center justify-center
        w-20 h-20 rounded-full
        transition-all duration-200 transform
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${isRecording
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
            : 'bg-red-900/70 hover:bg-red-800/80 shadow-lg shadow-red-900/30'}
      `, "aria-label": isRecording ? 'Stop recording' : 'Start recording', children: [isRecording ? (_jsx("div", { className: "w-6 h-6 bg-white rounded-sm" })) : (_jsx("div", { className: "w-6 h-6 bg-white rounded-full" })), isRecording && (_jsx("div", { className: "absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" }))] }));
};

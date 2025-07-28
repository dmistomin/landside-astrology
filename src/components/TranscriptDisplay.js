import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
export const TranscriptDisplay = ({ segments, isRecording, onClear, }) => {
    const scrollContainerRef = useRef(null);
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [segments]);
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8)
            return 'text-green-600';
        if (confidence >= 0.6)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const getConfidenceText = (confidence) => {
        return `${Math.round(confidence * 100)}%`;
    };
    const finalSegments = segments.filter(s => s.isFinal);
    const interimSegments = segments.filter(s => !s.isFinal);
    const latestInterim = interimSegments[interimSegments.length - 1];
    return (_jsxs("div", { className: "space-y-4 p-4 border border-gray-200 rounded-lg bg-white", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Live Transcript" }), _jsxs("div", { className: "flex items-center space-x-2", children: [isRecording && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm text-red-600", children: "Recording" })] })), _jsx("button", { onClick: onClear, disabled: segments.length === 0, className: "px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: "Clear" })] })] }), _jsxs("div", { ref: scrollContainerRef, className: "h-64 overflow-y-auto border border-gray-100 rounded-md p-3 bg-gray-50 space-y-2", children: [segments.length === 0 && (_jsx("div", { className: "flex items-center justify-center h-full text-gray-400", children: _jsxs("div", { className: "text-center", children: [_jsx("svg", { className: "w-8 h-8 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" }) }), _jsx("p", { className: "text-sm", children: "Start recording to see transcript here" })] }) })), finalSegments.map((segment, index) => (_jsxs("div", { className: "bg-white p-3 rounded border border-gray-200", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("span", { className: "text-xs text-gray-500 font-mono", children: formatTimestamp(segment.timestamp) }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Final" }), _jsx("span", { className: `text-xs font-medium ${getConfidenceColor(segment.confidence)}`, children: getConfidenceText(segment.confidence) })] })] }), _jsx("p", { className: "text-gray-900 leading-relaxed", children: segment.transcript })] }, `final-${index}`))), latestInterim && (_jsxs("div", { className: "bg-blue-50 p-3 rounded border border-blue-200 border-dashed", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("span", { className: "text-xs text-blue-600 font-mono", children: formatTimestamp(latestInterim.timestamp) }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-xs text-blue-600", children: "Interim" }), _jsx("span", { className: `text-xs font-medium ${getConfidenceColor(latestInterim.confidence)}`, children: getConfidenceText(latestInterim.confidence) })] })] }), _jsx("p", { className: "text-blue-800 leading-relaxed italic", children: latestInterim.transcript })] }))] }), segments.length > 0 && (_jsxs("div", { className: "text-xs text-gray-500 flex justify-between", children: [_jsxs("span", { children: [finalSegments.length, " final segment", finalSegments.length !== 1 ? 's' : ''] }), _jsxs("span", { children: [interimSegments.length, " interim result", interimSegments.length !== 1 ? 's' : ''] })] }))] }));
};

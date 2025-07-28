import { jsx as _jsx } from "react/jsx-runtime";
export const AudioLevelIndicator = ({ level, isActive, }) => {
    const bars = 10;
    const activeBars = Math.round((level / 100) * bars);
    return (_jsx("div", { className: "flex items-center space-x-1 h-16", children: Array.from({ length: bars }, (_, i) => {
            const isBarActive = i < activeBars && isActive;
            const barHeight = ((i + 1) / bars) * 100;
            return (_jsx("div", { className: `
              w-2 rounded-full transition-all duration-100
              ${isBarActive
                    ? i < bars * 0.6
                        ? 'bg-green-500'
                        : i < bars * 0.85
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                    : 'bg-gray-600'}
            `, style: {
                    height: `${barHeight}%`,
                    opacity: isBarActive ? 1 : 0.3,
                } }, i));
        }) }));
};

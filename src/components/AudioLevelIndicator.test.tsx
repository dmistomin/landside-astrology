import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AudioLevelIndicator } from './AudioLevelIndicator';

describe('AudioLevelIndicator', () => {
  it('renders 10 bars', () => {
    const { container } = render(
      <AudioLevelIndicator level={0} isActive={false} />
    );

    // The component has a flex container with 10 child divs
    const flexContainer = container.querySelector('.flex.items-center');
    expect(flexContainer).toBeInTheDocument();

    const bars = flexContainer?.children;
    expect(bars).toHaveLength(10);
  });

  it('shows inactive bars when not active', () => {
    const { container } = render(
      <AudioLevelIndicator level={50} isActive={false} />
    );

    const flexContainer = container.querySelector('.flex.items-center');
    const bars = Array.from(flexContainer?.children || []);

    bars.forEach((bar) => {
      expect(bar).toHaveClass('bg-gray-600');
    });
  });

  it('shows active bars based on level when active', () => {
    const { container } = render(
      <AudioLevelIndicator level={50} isActive={true} />
    );

    const flexContainer = container.querySelector('.flex.items-center');
    const bars = Array.from(flexContainer?.children || []);

    // Level 50 should activate 5 out of 10 bars
    for (let i = 0; i < 5; i++) {
      expect(bars[i]).toHaveClass('bg-green-500');
    }

    for (let i = 5; i < 10; i++) {
      expect(bars[i]).toHaveClass('bg-gray-600');
    }
  });

  it('shows different colors for high levels', () => {
    const { container } = render(
      <AudioLevelIndicator level={100} isActive={true} />
    );

    const flexContainer = container.querySelector('.flex.items-center');
    const bars = Array.from(flexContainer?.children || []);

    // At 100% level, all bars should be active
    expect(bars).toHaveLength(10);

    // Last bars (85%+ range) should be red
    const lastBar = bars[9]; // 10th bar (index 9)
    expect(lastBar).toHaveClass('bg-red-500');
  });

  it('has varying heights for visual effect', () => {
    const { container } = render(
      <AudioLevelIndicator level={0} isActive={false} />
    );

    const flexContainer = container.querySelector('.flex.items-center');
    const bars = Array.from(flexContainer?.children || []);

    // Each bar should have a different height
    const heights = bars.map((bar) => (bar as HTMLElement).style.height);

    // Should have 10 different heights from 10% to 100%
    expect(heights).toEqual([
      '10%',
      '20%',
      '30%',
      '40%',
      '50%',
      '60%',
      '70%',
      '80%',
      '90%',
      '100%',
    ]);
  });

  it('sets opacity based on active state', () => {
    const { container } = render(
      <AudioLevelIndicator level={30} isActive={true} />
    );

    const flexContainer = container.querySelector('.flex.items-center');
    const bars = Array.from(flexContainer?.children || []);

    // First 3 bars should be active (opacity 1)
    for (let i = 0; i < 3; i++) {
      expect((bars[i] as HTMLElement).style.opacity).toBe('1');
    }

    // Remaining bars should be inactive (opacity 0.3)
    for (let i = 3; i < 10; i++) {
      expect((bars[i] as HTMLElement).style.opacity).toBe('0.3');
    }
  });
});

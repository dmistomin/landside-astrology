import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
describe('App', () => {
    it('renders hello world', () => {
        render(_jsx(App, {}));
        expect(screen.getByText('Hello World')).toBeInTheDocument();
        expect(screen.getByText('Landside Astrology')).toBeInTheDocument();
    });
});

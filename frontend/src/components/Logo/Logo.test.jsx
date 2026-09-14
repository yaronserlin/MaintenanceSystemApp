import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Logo, { LogoMark } from './Logo';

describe('Logo Component', () => {
    it('renders LogoMark SVG without errors', () => {
        const { container } = render(<LogoMark size={40} />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('viewBox', '0 0 64 64');
    });

    it('renders full Logo with brand text and subtitle', () => {
        render(
            <MemoryRouter>
                <Logo subtitle="Ops Manager" />
            </MemoryRouter>
        );
        expect(screen.getByText('MAINTENANCE')).toBeInTheDocument();
        expect(screen.getByText('Ops Manager')).toBeInTheDocument();
    });

    it('renders mark-only variant when specified', () => {
        render(
            <MemoryRouter>
                <Logo variant="mark" />
            </MemoryRouter>
        );
        expect(screen.queryByText('MAINTENANCE')).not.toBeInTheDocument();
    });
});

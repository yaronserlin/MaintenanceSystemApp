// __tests__/LegalDocuments.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LegalModal from '../src/components/Legal/LegalModal';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../src/content/legalDocuments';

describe('LegalModal and Legal Documents', () => {
    test('renders Terms of Service by default', () => {
        const handleClose = jest.fn();
        render(<LegalModal open={true} onClose={handleClose} defaultTab="terms" />);

        expect(screen.getAllByText(/Terms of Service/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/1\. Acceptance of Terms/i)).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Terms of Service/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Privacy Policy/i })).toBeInTheDocument();
    });

    test('switches to Privacy Policy tab when clicked', () => {
        const handleClose = jest.fn();
        render(<LegalModal open={true} onClose={handleClose} defaultTab="terms" />);

        const privacyTab = screen.getByRole('tab', { name: /Privacy Policy/i });
        fireEvent.click(privacyTab);

        expect(screen.getAllByText(/Privacy Policy/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/1\. Information We Collect/i)).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
        const handleClose = jest.fn();
        render(<LegalModal open={true} onClose={handleClose} defaultTab="terms" />);

        const closeBtn = screen.getByRole('button', { name: /^Close$/i });
        fireEvent.click(closeBtn);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('legal documents have required sections', () => {
        expect(TERMS_OF_SERVICE.sections.length).toBeGreaterThanOrEqual(8);
        expect(PRIVACY_POLICY.sections.length).toBeGreaterThanOrEqual(6);
    });
});

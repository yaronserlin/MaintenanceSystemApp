// __tests__/LoginForm.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../src/components/LoginComponent/LoginForm';
import { useAuth } from '../src/contexts/AuthContext';
import useForm from '../src/hooks/useForm';

jest.mock('../src/contexts/AuthContext');
jest.mock('../src/hooks/useForm');

describe('LoginForm', () => {
    const mockHandleChange = jest.fn();
    const mockHandleSubmit = jest.fn(e => e.preventDefault());
    const mockResetForm = jest.fn();
    const mockLogin = jest.fn();

    beforeEach(() => {
        // Mock authentication hook
        useAuth.mockReturnValue({ login: mockLogin, loading: false });
        // Mock form hook
        useForm.mockReturnValue({
            values: { email: '', password: '' },
            errors: {},
            isSubmitting: false,
            handleChange: mockHandleChange,
            handleSubmit: mockHandleSubmit,
            resetForm: mockResetForm,
        });
    });

    test('renders email and password inputs and submit button', () => {
        render(<LoginForm />);
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('disables button when loading', () => {
        // Set loading to true
        useAuth.mockReturnValueOnce({ login: mockLogin, loading: true });
        render(<LoginForm />);
        expect(screen.getByRole('button', { name: /logging in.../i })).toBeDisabled();
    });

    test('calls handleSubmit on form submission', () => {
        render(<LoginForm />);
        fireEvent.submit(screen.getByRole('button', { name: /login/i }));
        expect(mockHandleSubmit).toHaveBeenCalled();
    });
});
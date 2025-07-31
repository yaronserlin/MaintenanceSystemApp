// __tests__/LoginCard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginCard from '../src/components/LoginComponent/LoginCard';

// Mock LoginForm to isolate LoginCard
jest.mock('../src/components/LoginComponent/LoginForm', () => () => <div>LoginFormMock</div>);

describe('LoginCard', () => {
    test('renders title and LoginForm', () => {
        render(<LoginCard />);
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('LoginFormMock')).toBeInTheDocument();
    });
});

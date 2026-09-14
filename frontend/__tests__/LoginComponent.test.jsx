// __tests__/LoginComponent.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginComponent from '../src/components/LoginComponent';

// Mock LoginCard to isolate LoginComponent
jest.mock('../src/components/LoginComponent/LoginCard', () => () => <div>LoginCardMock</div>);

describe('LoginComponent', () => {
    test('renders LoginCard inside container', () => {
        render(<LoginComponent />);
        expect(screen.getByText('LoginCardMock')).toBeInTheDocument();
    });
});

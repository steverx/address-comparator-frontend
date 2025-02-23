import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component', () => {
  test('renders address comparator heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/address comparator/i);
    expect(headingElement).toBeInTheDocument();
  });
});
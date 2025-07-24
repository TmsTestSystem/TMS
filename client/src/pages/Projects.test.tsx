import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Projects from './Projects';

describe('Projects page', () => {
  it('renders create project button', () => {
    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    );
    expect(screen.getByText(/создать проект/i)).toBeInTheDocument();
  });
}); 
import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Test</Button>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorState } from '@sudobility/raidr_ui';

describe('ErrorState', () => {
  it('says the API failed rather than that nothing exists', () => {
    render(<ErrorState error={new Error('HTTP 0: Network Error')} />);
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Could not load this from the raidr API')).toBeDefined();
    expect(screen.getByText('HTTP 0: Network Error')).toBeDefined();
  });
});

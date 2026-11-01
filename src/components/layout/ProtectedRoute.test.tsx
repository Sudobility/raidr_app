import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({ user: null as unknown, loading: false }));

vi.mock('@sudobility/components/auth', () => ({
  useAuthStatus: () => authState,
}));
vi.mock('@sudobility/auth_lib', () => ({
  getFirebaseAuth: () => ({}),
}));

import ProtectedRoute from './ProtectedRoute';
import { SignInProvider } from '@/components/auth/SignInProvider';

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/en/dashboard']}>
      <SignInProvider>
        <Routes>
          <Route
            path="/:lang/dashboard"
            element={
              <ProtectedRoute>
                <p>dashboard content</p>
              </ProtectedRoute>
            }
          />
          <Route path="/:lang/login" element={<p>login route</p>} />
        </Routes>
      </SignInProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authState.user = null;
    authState.loading = false;
  });

  it('asks for sign-in in place, with the modal open, instead of redirecting', () => {
    renderDashboard();
    expect(screen.queryByText('login route')).toBeNull();
    expect(screen.queryByText('dashboard content')).toBeNull();
    expect(screen.getByText('Sign in to open your dashboard')).toBeDefined();
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('leaves the prompt after the modal is closed, and its button reopens it', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Sign in to open your dashboard')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.queryByText('login route')).toBeNull();
  });

  it('renders the page when signed in', () => {
    authState.user = { uid: 'u1' };
    renderDashboard();
    expect(screen.getByText('dashboard content')).toBeDefined();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

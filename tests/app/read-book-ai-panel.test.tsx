/**
 * @fileOverview UI Tests for AI Button on Read Book Page
 *
 * This suite ensures the top toolbar contains an "AI" button near the TOC button
 * and clicking it opens the right-side AI interaction sheet. These tests only
 * cover UI toggling behavior (no backend/AI calls).
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ReadBookPage from '../../src/app/(main)/read-book/page';
import { LanguageProvider } from '../../src/context/LanguageContext';
import { AuthProvider } from '../../src/context/AuthContext';

// Mock icons to keep DOM simple
jest.mock('lucide-react', () => ({
  Lightbulb: () => <div data-testid="lightbulb-icon">Lightbulb</div>,
  List: () => <div data-testid="list-icon">List</div>,
}));

// Mock UI primitives used by the sheet
jest.mock('../../src/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-title">{children}</div>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-desc">{children}</div>,
  SheetFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-footer">{children}</div>,
  SheetClose: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('../../src/components/ui/button', () => ({
  Button: ({ children, onClick, title, className }: any) => (
    <button onClick={onClick} title={title} className={className}>{children}</button>
  ),
}));

jest.mock('../../src/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Providers wrapper
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </AuthProvider>
);

describe('ReadBookPage - AI Button UI', () => {
  test('renders AI button near TOC button', async () => {
    render(
      <Wrapper>
        <ReadBookPage />
      </Wrapper>
    );

    // Ensure the TOC button exists
    await waitFor(() => {
      const tocBtn = screen.getByRole('button', { name: /目錄|toc|Table of Contents/i });
      expect(tocBtn).toBeInTheDocument();
    });

    // Ensure the AI button exists (label comes from translations askAI)
    await waitFor(() => {
      const aiBtn = screen.getByRole('button', { name: /問 AI|Ask AI/i });
      expect(aiBtn).toBeInTheDocument();
    });
  });

  test('clicking AI button opens AI sheet content', async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <ReadBookPage />
      </Wrapper>
    );

    const aiBtn = await screen.findByRole('button', { name: /問 AI|Ask AI/i });
    await user.click(aiBtn);

    // Should render the sheet structure
    await waitFor(() => {
      expect(screen.getByTestId('sheet')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    });

    // Should contain AI sheet title or description (i18n key mapping)
    const titleOrDesc = screen.queryByText(/問 AI|Ask AI/i) || screen.queryByTestId('sheet-title');
    expect(titleOrDesc).toBeTruthy();
  });
});

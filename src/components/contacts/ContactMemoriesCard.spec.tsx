import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactMemoriesCard } from './ContactMemoriesCard';

const getContactMemories = vi.fn();

vi.mock('@/services/contacts', () => ({
  contactsService: { getContactMemories: (...args: unknown[]) => getContactMemories(...args) },
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({ t: (key: string, options?: { count?: number }) => `${key}${options?.count ?? ''}` }),
}));

const firstPage = {
  data: [{
    id: 'memory-1', scope: 'person', kind: 'fact', status: 'active', review_status: 'not_required',
    confidence: null, observed_at: '2026-11-05T10:00:00Z', valid_from: null, valid_until: null, evidence_count: 1,
  }],
  meta: { pagination: { page: 1, page_size: 20, total: 2, total_pages: 2 } },
};

describe('ContactMemoriesCard', () => {
  beforeEach(() => getContactMemories.mockReset());

  it('loads only the redacted memory contract and paginates it', async () => {
    getContactMemories.mockResolvedValueOnce(firstPage).mockResolvedValueOnce({
      data: [{ ...firstPage.data[0], id: 'memory-2', kind: 'inference', confidence: 0.9 }],
      meta: { pagination: { page: 2, page_size: 20, total: 2, total_pages: 2 } },
    });

    render(<ContactMemoriesCard contactId="contact-1" />);

    expect(screen.getByRole('status')).toHaveTextContent('memory.loading');
    await screen.findByText('memory.fact');
    expect(getContactMemories).toHaveBeenCalledWith('contact-1', { page: 1, pageSize: 20 });
    expect(screen.queryByText(/value|semantic_key|metadata/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'memory.loadMore' }));

    await screen.findByText('memory.inference');
    expect(getContactMemories).toHaveBeenLastCalledWith('contact-1', { page: 2, pageSize: 20 });
  });

  it('shows an error and retries the first page', async () => {
    getContactMemories.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({
      data: [], meta: { pagination: { page: 1, page_size: 20, total: 0, total_pages: 1 } },
    });

    render(<ContactMemoriesCard contactId="contact-1" />);

    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'memory.retry' }));

    await screen.findByText('memory.empty');
    await waitFor(() => expect(getContactMemories).toHaveBeenCalledTimes(2));
  });
});

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { useChannelValidation } from './useChannelValidation';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

describe('validateByChannelAndProvider — whatsapp without a provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toasts and fails validation instead of exiting silently', () => {
    const { validateByChannelAndProvider } = useChannelValidation();

    const result = validateByChannelAndProvider('whatsapp', undefined, {});

    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Selecione um provedor');
  });
});

describe('managed Evolution validation', () => {
  const form = { name: 'Atendimento', phone_number: '+5511999999999' };

  it('accepts a channel without frontend credentials when globally configured', () => {
    expect(useChannelValidation().validateByChannelAndProvider('whatsapp', 'evolution', form, { hasEvolutionConfig: true })).toBe(true);
  });

  it('rejects missing global configuration even if stale manual credentials exist', () => {
    expect(useChannelValidation().validateByChannelAndProvider('whatsapp', 'evolution', {
      ...form, api_url: 'https://internal.example', admin_token: 'test-secret',
    }, { hasEvolutionConfig: false })).toBe(false);
  });
});

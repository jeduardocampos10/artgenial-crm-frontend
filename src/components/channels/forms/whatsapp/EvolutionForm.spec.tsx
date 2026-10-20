import { describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { EvolutionForm } from './EvolutionForm';

vi.mock('@/hooks/useLanguage', () => ({ useLanguage: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/shared/PhoneInput', () => ({ PhoneInput: () => <input aria-label="phone" /> }));
afterEach(cleanup);

describe('ArtGenial managed WhatsApp form', () => {
  it.each([true, false])('never renders infrastructure credentials (configured=%s)', configured => {
    const { container } = render(<EvolutionForm form={{ api_url: 'https://internal.example', admin_token: 'sentinel-secret' }} onFormChange={vi.fn()} hasEvolutionConfig={configured} />);
    expect(container.textContent).not.toMatch(/apiUrl|apiKey|adminToken|connectionSettings|sentinel-secret|internal.example/i);
    expect(container.querySelector('input[value="sentinel-secret"]')).toBeNull();
    expect(screen.queryByRole('status') !== null).toBe(!configured);
    expect(screen.getByLabelText('phone')).toBeTruthy();
    expect(screen.getByText('evolutionForm.sections.instance.title')).toBeTruthy();
    expect(screen.getByText('evolutionForm.sections.proxy.title')).toBeTruthy();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import { useChannelSubmission } from './useChannelSubmission';
import InboxesService from '@/services/channels/inboxesService';
import EvolutionService from '@/services/channels/evolutionService';
import EvolutionGoService from '@/services/channels/evolutionGoService';

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

vi.mock('@/store/appDataStore', () => ({
  useAppDataStore: () => ({ addInbox: vi.fn() }),
}));

// Validation is exercised by its own spec; here we let every payload through and
// keep the real `getStr` semantics the submission code relies on.
vi.mock('@/hooks/channels/useChannelValidation', () => ({
  useChannelValidation: () => ({
    validateByChannelAndProvider: () => true,
    getStr: (form: Record<string, unknown>, key: string, fallback = '') =>
      typeof form[key] === 'string' ? (form[key] as string) : fallback,
  }),
}));

vi.mock('@/services/channels/inboxesService', () => ({
  default: { createChannel: vi.fn() },
}));
vi.mock('@/services/channels/evolutionService', () => ({
  default: { healthCheck: vi.fn(), verifyConnection: vi.fn() },
}));
vi.mock('@/services/channels/evolutionGoService', () => ({
  default: { healthCheck: vi.fn(), verifyConnection: vi.fn(), deleteInstance: vi.fn() },
}));
vi.mock('@/services/channels/twilioService', () => ({
  default: { verifyConnection: vi.fn().mockResolvedValue({ success: true }) },
}));
vi.mock('@/services/channels/notificameService', () => ({
  default: { verifyConnection: vi.fn().mockResolvedValue({ success: true }) },
}));

const createChannelMock = vi.mocked(InboxesService.createChannel);

const submit = async (channelType: string, providerId: string, form: Record<string, unknown>, config = {}) => {
  const { result } = renderHook(() => useChannelSubmission(form as never));
  await act(async () => {
    await result.current.submitCreate(
      { id: channelType, name: channelType, type: channelType } as never,
      { id: providerId, name: providerId } as never,
      form as never,
      config as never,
    );
  });
  return createChannelMock.mock.calls.at(-1)?.[0] as any;
};

describe('useChannelSubmission.submitCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createChannelMock.mockResolvedValue({ data: { id: 'inbox-1' } } as never);
  });

  it('includes business_account_id in the WhatsApp Cloud provider_config (EVO-2093 regression)', async () => {
    const payload = await submit('whatsapp', 'whatsapp_cloud', {
      name: 'wa-cloud',
      display_name: 'WA Cloud',
      phone_number: '+5511999999999',
      api_key: 'key',
      phone_number_id: 'pnid',
      business_account_id: 'baid-123',
      waba_id: 'waba',
    });

    expect(payload.channel.provider).toBe('whatsapp_cloud');
    expect(payload.channel.provider_config).toMatchObject({
      api_key: 'key',
      phone_number_id: 'pnid',
      business_account_id: 'baid-123',
      waba_id: 'waba',
    });
  });

  it('builds the SMS Twilio payload', async () => {
    const payload = await submit('sms', 'twilio', {
      name: 'sms-twilio',
      account_sid: 'sid',
      auth_token: 'tok',
      phone_number: '+111',
    });
    expect(payload.channel.type).toBe('sms');
    expect(payload.channel.provider).toBe('twilio');
    expect(payload.channel.provider_config).toMatchObject({ account_sid: 'sid', auth_token: 'tok' });
  });

  it('builds the SMS Bandwidth payload', async () => {
    const payload = await submit('sms', 'bandwidth', {
      name: 'sms-bw',
      api_key: 'k',
      api_secret: 's',
      application_id: 'app',
      account_id: 'acc',
      phone_number: '+222',
    });
    expect(payload.channel.provider).toBe('bandwidth');
    expect(payload.channel.provider_config).toMatchObject({
      api_key: 'k',
      api_secret: 's',
      application_id: 'app',
      account_id: 'acc',
    });
  });

  it('builds the WhatsApp Evolution payload (global config skips health check)', async () => {
    vi.mocked(EvolutionService.verifyConnection).mockResolvedValue({} as never);
    const payload = await submit(
      'whatsapp',
      'evolution',
      { name: 'evo', phone_number: '+333' },
      { hasEvolutionConfig: true },
    );
    expect(payload.channel.provider).toBe('evolution');
    expect(EvolutionService.healthCheck).not.toHaveBeenCalled();
  });

  it('builds the WhatsApp Evolution Go payload from the verify response', async () => {
    vi.mocked(EvolutionGoService.verifyConnection).mockResolvedValue({
      instance_uuid: 'uuid-1',
      instance_token: 'tok-1',
    } as never);
    const payload = await submit(
      'whatsapp',
      'evolution_go',
      { name: 'evo-go', phone_number: '+444' },
      { hasEvolutionGoConfig: true },
    );
    expect(payload.channel.provider).toBe('evolution_go');
    expect(payload.channel.provider_config).toMatchObject({
      instance_uuid: 'uuid-1',
      instance_token: 'tok-1',
    });
  });

  it('omits stale manual credentials from Evolution creation and authorization', async () => {
    const payload = await submit('whatsapp', 'evolution', {
      name: 'atendimento',
      phone_number: '+5511999999999',
      api_url: 'https://private.example.test',
      admin_token: 'test-only-admin-token',
      api_key: 'test-only-api-key',
      api_hash: 'test-only-api-hash',
    }, { hasEvolutionConfig: true });

    const authorization = vi.mocked(EvolutionService.verifyConnection).mock.calls[0][0];
    expect(authorization).not.toHaveProperty('apiUrl');
    expect(authorization).not.toHaveProperty('adminToken');
    for (const key of ['api_url', 'admin_token', 'api_key', 'api_hash']) {
      expect(payload.channel.provider_config).not.toHaveProperty(key);
    }
    expect(payload.channel.provider_config.instance_name).toBe('atendimento');
    expect(EvolutionService.healthCheck).not.toHaveBeenCalled();
  });

  it('tests Evolution using the backend without forwarding stale credentials', async () => {
    const form = {
      name: 'atendimento', phone_number: '+5511999999999',
      api_url: 'https://private.example.test', admin_token: 'test-only-admin-token',
    };
    const { result } = renderHook(() => useChannelSubmission(form));
    await act(async () => {
      await result.current.testConnection(
        { id: 'whatsapp', name: 'WhatsApp', type: 'whatsapp' } as never,
        { id: 'evolution', name: 'WhatsApp' } as never,
        form,
        { hasEvolutionConfig: true, hasEvolutionGoConfig: false },
      );
    });
    expect(result.current.healthCheckPassed).toBe(true);
    expect(EvolutionService.verifyConnection).toHaveBeenCalledWith(expect.objectContaining({
      instanceName: 'atendimento', phoneNumber: '+5511999999999',
    }));
    expect(vi.mocked(EvolutionService.verifyConnection).mock.calls[0][0]).not.toHaveProperty('adminToken');
    expect(vi.mocked(EvolutionService.verifyConnection).mock.calls[0][0]).not.toHaveProperty('apiUrl');
  });

  it('preserves manual credentials for Evolution Go', async () => {
    vi.mocked(EvolutionGoService.healthCheck).mockResolvedValue(true);
    vi.mocked(EvolutionGoService.verifyConnection).mockResolvedValue({} as never);
    const payload = await submit('whatsapp', 'evolution_go', {
      name: 'go', phone_number: '+5511999999999',
      api_url: 'https://go.example.test', admin_token: 'test-only-go-token',
    }, { hasEvolutionGoConfig: false });
    expect(payload.channel.provider_config).toMatchObject({
      api_url: 'https://go.example.test', admin_token: 'test-only-go-token',
    });
  });

  it('confirms the creation on screen', async () => {
    await submit('api', 'api', { name: 'api-inbox', webhook_url: 'https://hook' });

    expect(toast.success).toHaveBeenCalledWith('Canal criado com sucesso');
  });

  it('shows the reason the backend gave for refusing the create', async () => {
    createChannelMock.mockRejectedValue({
      response: {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: 'Limite do plano excedido (5/5) para channels',
          },
        },
      },
      message: 'Request failed with status code 422',
    } as never);

    await submit('api', 'api', { name: 'api-inbox', webhook_url: 'https://hook' });

    expect(toast.error).toHaveBeenCalledWith('Limite do plano excedido (5/5) para channels');
  });

  it('falls back to its own message when the failure carries no envelope', async () => {
    createChannelMock.mockRejectedValue(new Error('Network Error') as never);

    await submit('api', 'api', { name: 'api-inbox', webhook_url: 'https://hook' });

    expect(toast.error).toHaveBeenCalledWith('Network Error');
  });

  // An envelope with a code and no message must fall THROUGH, not pick up the
  // English default extractError would have supplied for that shape.
  it('does not invent a message when the envelope carries none', async () => {
    createChannelMock.mockRejectedValue({
      response: { status: 422, data: { success: false, error: { code: 'QUOTA_EXCEEDED' } } },
      message: 'Request failed with status code 422',
    } as never);

    await submit('api', 'api', { name: 'api-inbox', webhook_url: 'https://hook' });

    expect(toast.error).not.toHaveBeenCalledWith('An error occurred');
    expect(toast.error).toHaveBeenCalledWith('Request failed with status code 422');
  });
});

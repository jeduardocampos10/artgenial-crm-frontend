import { afterEach, describe, expect, it, vi } from 'vitest';

const mockApi = { post: vi.fn() };

vi.mock('@/services/core/api', () => ({
  default: {
    post: (...args: unknown[]) => mockApi.post(...args),
  },
}));

import { conversationAPI } from './conversationService';

describe('conversationAPI.assignConversation', () => {
  afterEach(() => vi.clearAllMocks());

  it('sends only assignee_id for an agent assignment', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { success: true, data: { assignee: { id: 'agent-1' } } } });

    await conversationAPI.assignConversation('conversation-1', 'agent-1');

    expect(mockApi.post).toHaveBeenCalledWith('/conversations/conversation-1/assignments', {
      assignee_id: 'agent-1',
    });
  });

  it('sends only team_id for a team assignment', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { success: true, data: { team: { id: 'team-1' } } } });

    await conversationAPI.assignConversation('conversation-1', null, 'team-1');

    expect(mockApi.post).toHaveBeenCalledWith('/conversations/conversation-1/assignments', {
      team_id: 'team-1',
    });
  });

  it('keeps an explicit blank assignee_id for an agent unassignment', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { success: true, data: {} } });

    await conversationAPI.assignConversation('conversation-1', null);

    expect(mockApi.post).toHaveBeenCalledWith('/conversations/conversation-1/assignments', {
      assignee_id: null,
    });
  });
});

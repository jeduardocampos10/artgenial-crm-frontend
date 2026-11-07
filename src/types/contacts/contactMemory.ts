import type { PaginatedResponse } from '@/types/core';

// This is deliberately the public read contract, not the MemoryRecord model.
// Do not add value, category, semantic_key or metadata here: those fields are
// intentionally withheld by the Customer 360 API.
export interface ContactMemory {
  id: string;
  scope: 'person' | 'company' | 'relationship' | 'context';
  kind: 'fact' | 'inference';
  status: 'active' | 'contested' | 'superseded' | 'expired' | 'anonymized';
  review_status: 'not_required' | 'pending' | 'approved' | 'rejected';
  confidence: number | null;
  observed_at: string | null;
  valid_from: string | null;
  valid_until: string | null;
  evidence_count: number;
}

export interface ContactMemoriesParams {
  page?: number;
  pageSize?: number;
}

export interface ContactMemoriesResponse extends PaginatedResponse<ContactMemory> {}

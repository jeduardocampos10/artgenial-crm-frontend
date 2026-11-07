import { useEffect, useRef, useState } from 'react';
import { Button } from '@evoapi/design-system';
import { AlertCircle, Brain, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { contactsService } from '@/services/contacts';
import type { ContactMemory } from '@/types/contacts';
import type { PaginationMeta } from '@/types/core/api';

interface ContactMemoriesCardProps {
  contactId: string;
}

const PAGE_SIZE = 20;

function formatObservedAt(value: string | null): string {
  if (!value) return 'â€”';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function ContactMemoriesCard({ contactId }: ContactMemoriesCardProps) {
  const { t } = useLanguage('contacts');
  const [memories, setMemories] = useState<ContactMemory[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const loadPage = async (page: number, append: boolean) => {
    const request = ++requestId.current;
    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError(false);

    try {
      const response = await contactsService.getContactMemories(contactId, { page, pageSize: PAGE_SIZE });
      if (request !== requestId.current) return;

      setMemories((current) => (append ? [...current, ...response.data] : response.data));
      setPagination(response.meta.pagination);
    } catch {
      if (request === requestId.current) setError(true);
    } finally {
      if (request === requestId.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    setMemories([]);
    setPagination(null);
    void loadPage(1, false);
    // loadPage intentionally reads the current contact id and request token;
    // a changed id starts a new request and invalidates the old response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  const hasMore = Boolean(pagination && pagination.page < pagination.total_pages);

  return (
    <section className="rounded-xl border border-border p-4" data-testid="contact-memories-card">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-sm font-semibold">{t('memory.title')}</h3>
      </div>

      {isLoading && (
        <div role="status" className="flex items-center gap-2 py-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('memory.loading')}
        </div>
      )}

      {!isLoading && error && (
        <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{t('memory.error')}</span>
          <Button size="sm" variant="outline" onClick={() => void loadPage(1, false)}>
            {t('memory.retry')}
          </Button>
        </div>
      )}

      {!isLoading && !error && memories.length === 0 && (
        <p className="py-4 text-sm text-muted-foreground">{t('memory.empty')}</p>
      )}

      {!isLoading && !error && memories.length > 0 && (
        <div className="space-y-2">
          {memories.map((memory) => (
            <article key={memory.id} className="rounded-lg border border-border/70 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{memory.kind === 'fact' ? t('memory.fact') : t('memory.inference')}</span>
                <span className="text-xs text-muted-foreground">{memory.review_status}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('memory.observedAt')}: {formatObservedAt(memory.observed_at)} Â· {t('memory.evidenceCount', { count: memory.evidence_count })}
              </p>
            </article>
          ))}

          {hasMore && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void loadPage((pagination?.page ?? 1) + 1, true)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? t('memory.loadingMore') : t('memory.loadMore')}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

export default ContactMemoriesCard;

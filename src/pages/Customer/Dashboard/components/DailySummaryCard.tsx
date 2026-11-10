import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@evoapi/design-system';
import type { DailySummaryResponse } from '@/types/analytics/dashboard';

interface DailySummaryCardProps {
  data: DailySummaryResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md border border-border p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

const DailySummaryCard = ({ data, loading, error, onRefresh }: DailySummaryCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Resumo diário</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Indicadores operacionais agregados, sem conteúdo de mensagens ou dados pessoais.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
        {!error && !data && <p className="text-sm text-muted-foreground">Carregando resumo...</p>}
        {data && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{data.date}</Badge>
              <span className="text-xs text-muted-foreground">{data.timezone}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
              <Metric label="Conversas criadas" value={data.conversations.created} />
              <Metric label="Conversas resolvidas" value={data.conversations.resolved} />
              <Metric label="Sem atendimento" value={data.conversations.unattended_now} />
              <Metric label="Mensagens recebidas" value={data.messages.incoming} />
              <Metric label="Novos itens no pipeline" value={data.pipeline.new_items} />
              <Metric label="Tarefas atrasadas" value={data.tasks.overdue} />
            </div>
            <div className="space-y-2">
              {data.highlights.map(highlight => (
                <div key={highlight.code} className="flex items-center gap-2 text-sm">
                  {highlight.kind === 'info' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className={`h-4 w-4 ${highlight.kind === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                  )}
                  {highlight.text}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailySummaryCard;

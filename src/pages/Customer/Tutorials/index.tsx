import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const Tutorials = () => {
  const { t } = useLanguage('tutorials');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
      </div>
      <div className="flex-1 px-6 pb-6">
        <div className="rounded-lg border border-border p-6 space-y-4">
          <h2 className="text-xl font-semibold">ArtGenial CRM</h2>
          <p className="text-muted-foreground">{t('gettingStarted')}</p>
          <Link to="/channels/new" className="inline-flex text-primary underline">{t('connectChannel')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;

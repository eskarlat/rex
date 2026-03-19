import { useParams, useNavigate } from 'react-router-dom';
import { DynamicPanel } from './components/DynamicPanel';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { cn } from '@/lib/utils';

export function ExtensionPanelPage() {
  const { name, panelId } = useParams<{ name: string; panelId?: string }>();
  const { data: marketplace } = useMarketplace();
  const navigate = useNavigate();

  if (!name) {
    return (
      <div className="text-muted-foreground">
        No extension specified.
      </div>
    );
  }

  const extension = marketplace?.active.find((ext) => ext.name === name);
  const displayTitle = extension?.title ?? name;
  const panels = extension?.panels ?? [];
  const hasMultiplePanels = panels.length > 1;
  const activePanelId = panelId ?? panels[0]?.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{displayTitle}</h1>
        <p className="text-muted-foreground">Extension panel</p>
      </div>
      {hasMultiplePanels && (
        <div className="flex gap-1 border-b">
          {panels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => navigate(`/extensions/${name}/${panel.id}`)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                activePanelId === panel.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
              )}
            >
              {panel.title}
            </button>
          ))}
        </div>
      )}
      <DynamicPanel
        key={`${name}-${activePanelId ?? 'default'}`}
        extensionName={name}
        panelId={activePanelId}
      />
    </div>
  );
}

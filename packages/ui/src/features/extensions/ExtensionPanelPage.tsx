import { useParams } from 'react-router-dom';
import { DynamicPanel } from './components/DynamicPanel';

export function ExtensionPanelPage() {
  const { name } = useParams<{ name: string }>();

  if (!name) {
    return (
      <div className="text-muted-foreground">
        No extension specified.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
        <p className="text-muted-foreground">Extension panel</p>
      </div>
      <DynamicPanel extensionName={name} />
    </div>
  );
}

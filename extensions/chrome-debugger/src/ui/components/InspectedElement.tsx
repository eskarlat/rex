import { Card, CardHeader, CardTitle, CardContent, Separator } from '@renre-kit/extension-sdk/components';

interface InspectedElementProps {
  output: string;
}

export function InspectedElement({ output }: Readonly<InspectedElementProps>) {
  return (
    <>
      <Separator />
      <Card>
        <CardHeader><CardTitle>Inspected Element</CardTitle></CardHeader>
        <CardContent>
          <pre style={{ background: 'var(--muted, #1e1e1e)', padding: '12px', borderRadius: '6px', overflow: 'auto', maxHeight: '300px', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
            {output}
          </pre>
        </CardContent>
      </Card>
    </>
  );
}

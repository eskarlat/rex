import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: Readonly<CodeBlockProps>) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-4">
        <pre className="overflow-auto">
          <code className="font-mono text-sm" data-language={language}>
            {code}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
}

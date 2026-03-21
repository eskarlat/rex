import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

export interface MarkdownRendererProps {
  readonly children: string;
  readonly className?: string;
  readonly testId?: string;
}

export function MarkdownRenderer({ children, className, testId }: MarkdownRendererProps) {
  return (
    <div data-testid={testId} className={cn('prose-markdown', className)}>
      <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>
    </div>
  );
}

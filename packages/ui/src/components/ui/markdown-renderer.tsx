import type { ComponentPropsWithoutRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  readonly children: string;
  readonly className?: string;
  readonly testId?: string;
}

function isExternalUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function isSafeHref(href: string): boolean {
  return href.startsWith('/') || href.startsWith('#') || isExternalUrl(href);
}

function SafeLink({ href, children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  if (!href || !isSafeHref(href)) {
    return <span {...rest}>{children}</span>;
  }

  const external = isExternalUrl(href);
  return (
    <a
      {...rest}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}
    >
      {children}
    </a>
  );
}

function SafeImage({ src, alt, ...rest }: ComponentPropsWithoutRef<'img'>) {
  if (!src || isExternalUrl(src)) {
    return alt ? <span>{alt}</span> : null;
  }
  return <img {...rest} src={src} alt={alt ?? ''} />;
}

const safeComponents = { a: SafeLink, img: SafeImage };

export function MarkdownRenderer({ children, className, testId }: MarkdownRendererProps) {
  return (
    <div data-testid={testId} className={cn('prose-markdown', className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={safeComponents}>
        {children}
      </Markdown>
    </div>
  );
}

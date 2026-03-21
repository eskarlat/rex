import * as clack from '@clack/prompts';

export interface EventsPublishOptions {
  type: string;
  data: string;
  source: string;
}

export async function handleEventsPublish(options: EventsPublishOptions): Promise<void> {
  let parsedData: Record<string, unknown>;
  try {
    parsedData = JSON.parse(options.data) as Record<string, unknown>;
  } catch {
    clack.log.error(`Invalid JSON for --data: ${options.data}`);
    return;
  }

  const url = 'http://localhost:4200/api/events';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: options.type,
        source: options.source,
        data: parsedData,
      }),
    });

    if (!response.ok) {
      clack.log.error(`Server returned ${response.status}: ${response.statusText}`);
      return;
    }

    clack.log.success(`Event published: ${options.type}`);
  } catch {
    clack.log.warn(
      'Could not reach dashboard server at http://localhost:4200. Is it running? (renre-kit ui)',
    );
  }
}

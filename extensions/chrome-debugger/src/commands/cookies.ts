import { withBrowser } from '../shared/connection.js';
import { markdownTable, truncate } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function cookies(context: ExecutionContext): Promise<CommandResult> {
  const domain = typeof context.args.domain === 'string' ? context.args.domain : null;

  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();
    const { cookies: allCookies } = (await client.send('Network.getAllCookies')) as {
      cookies: Array<{
        name: string;
        value: string;
        domain: string;
        path: string;
        secure: boolean;
        httpOnly: boolean;
        expires: number;
      }>;
    };

    let filtered = allCookies;
    if (domain) {
      filtered = allCookies.filter((c) => c.domain.includes(domain));
    }

    if (filtered.length === 0) {
      return {
        output: domain
          ? `No cookies found for domain: ${domain}`
          : 'No cookies found.',
        exitCode: 0,
      };
    }

    const rows = filtered.map((c) => [
      truncate(c.name, 30),
      truncate(c.value, 40),
      c.domain,
      c.path,
      c.secure ? 'yes' : 'no',
      c.httpOnly ? 'yes' : 'no',
    ]);

    const table = markdownTable(
      ['Name', 'Value', 'Domain', 'Path', 'Secure', 'HttpOnly'],
      rows
    );

    return {
      output: [`## Cookies (${String(filtered.length)})`, '', table].join('\n'),
      exitCode: 0,
    };
  });
}

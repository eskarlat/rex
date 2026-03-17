import * as clack from '@clack/prompts';
import { aggregateSkills } from '../capabilities-aggregator.js';

interface CapabilitiesOptions {
  projectPath: string;
}

export function handleCapabilities(options: CapabilitiesOptions): void {
  const result = aggregateSkills(options.projectPath);
  clack.log.info(result);
}

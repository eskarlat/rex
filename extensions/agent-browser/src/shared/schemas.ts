import { z } from '@renre-kit/extension-sdk/node';

// --- Element targeting ---
export const refSchema = z.string().min(1, 'ref is required (e.g. @e1 or CSS selector)');

// --- URL ---
export const urlSchema = z.string().min(1, 'url is required');

// --- Scroll ---
export const scrollDirectionSchema = z.enum(['up', 'down', 'left', 'right']);

// --- Storage ---
export const storageTypeSchema = z.enum(['local', 'session']);
export const storageActionSchema = z.enum(['get', 'set', 'clear']);

// --- Find actions ---
export const findActionSchema = z.enum(['click', 'fill', 'hover', 'focus', 'check', 'uncheck']);

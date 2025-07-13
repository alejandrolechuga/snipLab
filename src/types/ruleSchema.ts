import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { Rule } from './rule';

export const ruleSchema = z.object({
  id: z.string().optional(),
  urlPattern: z.string(),
  isRegExp: z.boolean().optional(),
  method: z.string(),
  enabled: z.boolean(),
  statusCode: z.number(),
  date: z.string().optional(),
  response: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => v ?? null),
  requestBody: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return null;
      return v.trim() === '' ? null : v;
    })
    .optional(),
  delayMs: z
    .union([z.number(), z.null(), z.undefined()])
    .transform((v) => (v === undefined ? null : v)),
});

export type RuleInput = z.input<typeof ruleSchema>;

export const toRule = (data: RuleInput): Rule => {
  const parsed = ruleSchema.parse(data);
  return {
    id: parsed.id ?? uuidv4(),
    urlPattern: parsed.urlPattern,
    isRegExp: parsed.isRegExp ?? false,
    method: parsed.method,
    enabled: parsed.enabled,
    statusCode: parsed.statusCode,
    date: parsed.date ?? new Date().toISOString().split('T')[0],
    response: parsed.response,
    requestBody: parsed.requestBody ?? null,
    delayMs: parsed.delayMs ?? null,
  };
};

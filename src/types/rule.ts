export interface Rule {
  id: string;
  urlPattern: string;
  /** Whether the urlPattern should be treated as a RegExp */
  isRegExp?: boolean;
  method: string;
  /** Optional override for the outgoing request body */
  requestBody?: string | null;
  /** Optional override for outgoing request headers */
  requestHeaders?: Record<string, string> | null;
  enabled: boolean;
  statusCode: number;
  date: string;
  response: string | null;
  /** Optional override for incoming response headers */
  responseHeaders?: Record<string, string> | null;
  /** Optional delay in milliseconds before responding */
  delayMs?: number | null;
}

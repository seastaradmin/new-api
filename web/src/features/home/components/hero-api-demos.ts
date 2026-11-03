/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
/**
 * Static request/response samples for the hero API panel.
 *
 * Kept apart from the rendering components so the panel and the code preview
 * can share one source of truth without importing each other.
 */

export interface ApiDemoConfig {
  id: string
  /** Protocol name shown in the tab strip; proper nouns stay untranslated. */
  label: string
  method: 'POST' | 'GET'
  endpoint: string
  headers: string[]
  request: string[]
  response: string[]
  tokens: number
  latency: number
}

export const API_DEMOS: ApiDemoConfig[] = [
  {
    id: 'chat',
    label: 'Chat',
    method: 'POST',
    endpoint: '/v1/chat/completions',
    headers: ['"Authorization: Bearer sk-••••"'],
    request: [
      '"model": "your-model",',
      '"messages": [',
      '  { "role": "user", "content": "..." }',
      ']',
    ],
    response: [
      '{',
      '  "choices": [{ "content": <text> }],',
      '  "usage": { "total_tokens": <tokens> }',
      '}',
    ],
    tokens: 27,
    latency: 142,
  },
  {
    id: 'responses',
    label: 'Responses',
    method: 'POST',
    endpoint: '/v1/responses',
    headers: ['"Authorization: Bearer sk-••••"'],
    request: ['"model": "your-model",', '"input": "..."'],
    response: [
      '{',
      '  "output": [{ "text": <text> }],',
      '  "usage": { "total_tokens": <tokens> }',
      '}',
    ],
    tokens: 31,
    latency: 168,
  },
  {
    id: 'claude',
    label: 'Claude',
    method: 'POST',
    endpoint: '/v1/messages',
    headers: ['"x-api-key: sk-••••"', '"anthropic-version: 2023-06-01"'],
    request: [
      '"model": "your-model",',
      '"max_tokens": 1024,',
      '"messages": [',
      '  { "role": "user", "content": "..." }',
      ']',
    ],
    response: [
      '{',
      '  "content": [{ "text": <text> }],',
      '  "usage": { "input_tokens": <in>, "output_tokens": <out> }',
      '}',
    ],
    tokens: 29,
    latency: 156,
  },
  {
    id: 'gemini',
    label: 'Gemini',
    method: 'POST',
    endpoint: '/v1beta/models/{model}:generateContent',
    headers: ['"x-goog-api-key: sk-••••"'],
    request: [
      '"contents": [',
      '  { "role": "user",',
      '    "parts": [{ "text": "..." }] }',
      ']',
    ],
    response: [
      '{',
      '  "candidates": [{ "text": <text> }],',
      '  "usageMetadata": { "totalTokenCount": <tokens> }',
      '}',
    ],
    tokens: 25,
    latency: 93,
  },
]

/** Short stand-in text for the `<text>` placeholder in each sample response. */
const RESPONSE_SUMMARY: Record<string, string> = {
  chat: 'Chat request routed.',
  responses: 'Response workflow ready.',
  claude: 'Claude message routed.',
  gemini: 'Gemini request served.',
}

export function getResponseSummary(demoId: string): string {
  return RESPONSE_SUMMARY[demoId] ?? '...'
}

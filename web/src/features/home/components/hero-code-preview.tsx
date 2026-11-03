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
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { getResponseSummary, type ApiDemoConfig } from './hero-api-demos'

interface CodePreviewProps {
  demo: ApiDemoConfig
  transitioning: boolean
}

/**
 * `curl` sample for the selected protocol: request line, headers and JSON body.
 */
export function RequestBlock(props: CodePreviewProps) {
  const { t } = useTranslation()

  return (
    <div className='min-w-0 px-4 py-4 sm:px-5'>
      <SectionLabel>{t('Request')}</SectionLabel>
      <div
        className={cn(
          'mt-2.5 transition-opacity duration-100',
          props.transitioning ? 'opacity-0' : 'opacity-100'
        )}
      >
        <CodeLine>
          <Command>curl</Command> <Flag>-X</Flag> <Flag>POST</Flag>{' '}
          <StringText>&quot;{props.demo.endpoint}&quot;</StringText>{' '}
          <Muted>{'\\'}</Muted>
        </CodeLine>
        {props.demo.headers.map((header) => (
          <CodeLine key={header} indent={2}>
            <Flag>-H</Flag> <StringText>{header}</StringText>{' '}
            <Muted>{'\\'}</Muted>
          </CodeLine>
        ))}
        <CodeLine indent={2}>
          <Flag>-d</Flag> <StringText>&apos;{'{'}</StringText>
        </CodeLine>
        {props.demo.request.map((line) => (
          <CodeLine key={line} indent={4}>
            {renderJsonLine(line)}
          </CodeLine>
        ))}
        <CodeLine indent={2}>
          <StringText>{'}'}&apos;</StringText>
        </CodeLine>
      </div>
    </div>
  )
}

/**
 * JSON response for the selected protocol, with sample values in place of the
 * `<text>` / `<tokens>` placeholders so the panel never reads as fake data.
 */
export function ResponseBlock(props: CodePreviewProps) {
  const { t } = useTranslation()

  return (
    <div className='border-border bg-muted/50 border-t px-4 py-4 sm:px-5'>
      <SectionLabel>{t('Response')}</SectionLabel>
      <div
        className={cn(
          'mt-2.5 transition-opacity duration-100',
          props.transitioning ? 'opacity-0' : 'opacity-100'
        )}
      >
        {props.demo.response.map((line) => (
          <CodeLine key={line}>{renderResponseLine(line, props.demo)}</CodeLine>
        ))}
      </div>
    </div>
  )
}

function SectionLabel(props: { children: string }) {
  return (
    <span className='text-muted-foreground font-mono text-[10px] font-semibold tracking-[0.14em] uppercase'>
      {props.children}
    </span>
  )
}

const STRING_RE = /"[^"]*"/g
const PLACEHOLDER_RE = /<[a-z]+>/gi

function renderJsonLine(line: string) {
  if (!line.trim()) return <Muted> </Muted>
  return tokenize(line)
}

function renderResponseLine(line: string, demo: ApiDemoConfig) {
  if (!line.trim()) return <Muted> </Muted>

  const segments: ReactNode[] = []
  let cursor = 0
  const matches = [...line.matchAll(PLACEHOLDER_RE)]

  if (matches.length === 0) return tokenize(line)

  matches.forEach((match) => {
    const start = match.index ?? 0
    if (start > cursor) {
      segments.push(
        <span key={`pre-${start}`}>{tokenize(line.slice(cursor, start))}</span>
      )
    }
    const placeholder = match[0]
    if (placeholder === '<text>') {
      segments.push(
        <Accent key={`ph-${start}`}>
          {`"${getResponseSummary(demo.id)}"`}
        </Accent>
      )
    } else if (placeholder === '<tokens>') {
      segments.push(<NumberText key={`ph-${start}`}>{demo.tokens}</NumberText>)
    } else if (placeholder === '<in>') {
      segments.push(
        <NumberText key={`ph-${start}`}>
          {Math.floor(demo.tokens * 0.4)}
        </NumberText>
      )
    } else if (placeholder === '<out>') {
      segments.push(
        <NumberText key={`ph-${start}`}>
          {Math.ceil(demo.tokens * 0.6)}
        </NumberText>
      )
    } else {
      segments.push(<Muted key={`ph-${start}`}>{placeholder}</Muted>)
    }
    cursor = start + placeholder.length
  })

  if (cursor < line.length) {
    segments.push(<span key='tail'>{tokenize(line.slice(cursor))}</span>)
  }

  return segments
}

function tokenize(input: string) {
  // Split the line into "..." string runs and the punctuation between them,
  // then distinguish JSON keys from string values by the following colon.
  const segments: ReactNode[] = []
  let cursor = 0
  const matches = [...input.matchAll(STRING_RE)]

  matches.forEach((match) => {
    const start = match.index ?? 0
    if (start > cursor) {
      segments.push(
        <Muted key={`m-${start}`}>{input.slice(cursor, start)}</Muted>
      )
    }
    const text = match[0]
    const after = input.slice(start + text.length).trimStart()
    if (after.startsWith(':')) {
      segments.push(<Key key={`k-${start}`}>{text}</Key>)
    } else {
      segments.push(<StringText key={`s-${start}`}>{text}</StringText>)
    }
    cursor = start + text.length
  })

  if (cursor < input.length) {
    segments.push(<Muted key='tail'>{input.slice(cursor)}</Muted>)
  }

  return segments
}

function CodeLine(props: { children: ReactNode; indent?: number }) {
  return (
    <div className='break-words whitespace-pre-wrap'>
      {props.indent ? (
        <span
          aria-hidden
          className='inline-block'
          style={{ width: `${props.indent}ch` }}
        />
      ) : null}
      {props.children}
    </div>
  )
}

function Command(props: { children: ReactNode }) {
  return <span className='font-semibold'>{props.children}</span>
}

function Flag(props: { children: ReactNode }) {
  return (
    <span className='underline decoration-1 underline-offset-4'>
      {props.children}
    </span>
  )
}

function Key(props: { children: ReactNode }) {
  return <span className='text-foreground'>{props.children}</span>
}

function StringText(props: { children: ReactNode }) {
  return <span className='text-muted-foreground'>{props.children}</span>
}

function NumberText(props: { children: ReactNode }) {
  return <span className='font-semibold'>{props.children}</span>
}

function Muted(props: { children: ReactNode }) {
  return <span className='text-muted-foreground'>{props.children}</span>
}

function Accent(props: { children: ReactNode }) {
  return <span className='font-semibold'>{props.children}</span>
}

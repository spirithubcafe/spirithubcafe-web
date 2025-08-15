interface RichTextDisplayProps {
  content: string
  className?: string
  dir?: 'ltr' | 'rtl'
}

export function RichTextDisplay({
  content,
  className = '',
  dir = 'ltr',
}: RichTextDisplayProps) {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const isHtmlLike = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s)

  const inlineMarkdown = (s: string) => {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, '<em>$1</em>')
      .replace(/_(?!\s)(.+?)(?<!\s)_/g, '<em>$1</em>')
  }

  const sanitizeHtmlInput = (html: string) => {
    return html
      .replace(/<p>\s*<\/p>/gi, '')
      .replace(/(?:<br\s*\/?>\s*){2,}/gi, '<br>')
      .replace(/\n{2,}/g, '\n')
  }

  const parsePlainTextToHtml = (text: string) => {
    const lines = text.replace(/\r\n?/g, '\n').trim().split('\n')

    const out: string[] = []
    let i = 0

    const flushParagraph = (buf: string[]) => {
      if (!buf.length) return
      const joined = buf.join('<br>')
      out.push(`<p>${inlineMarkdown(joined)}</p>`)
      buf.length = 0
    }

    while (i < lines.length) {
      const line = lines[i].trim()

      if (!line) {
        i++
        continue
      }

      const h = /^(#{1,6})\s+(.+)$/.exec(line)
      if (h) {
        const level = Math.min(h[1].length, 3) 
        const title = inlineMarkdown(escapeHtml(h[2]))
        out.push(`<h${level + 1} class="rt-h">${title}</h${level + 1}>`)
        i++
        continue
      }

      if (/^\d+\.\s+/.test(line)) {
        const items: string[] = []
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          const m = lines[i].trim().match(/^\d+\.\s+(.+)$/)!
          items.push(`<li>${inlineMarkdown(escapeHtml(m[1]))}</li>`)
          i++
        }
        out.push(`<ol class="rt-ol">${items.join('')}</ol>`)
        continue
      }

      if (/^[-*•]\s+/.test(line)) {
        const items: string[] = []
        while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
          const m = lines[i].trim().match(/^[-*•]\s+(.+)$/)!
          items.push(`<li>${inlineMarkdown(escapeHtml(m[1]))}</li>`)
          i++
        }
        out.push(`<ul class="rt-ul">${items.join('')}</ul>`)
        continue
      }

      const buf: string[] = []
      while (i < lines.length) {
        const l = lines[i].trim()
        if (
          !l ||
          /^(#{1,6})\s+/.test(l) ||
          /^\d+\.\s+/.test(l) ||
          /^[-*•]\s+/.test(l)
        )
          break
        buf.push(inlineMarkdown(escapeHtml(l)))
        i++
      }
      flushParagraph(buf)
    }

    return out.join('')
  }

  const processedContent = isHtmlLike(content)
    ? sanitizeHtmlInput(content)
    : parsePlainTextToHtml(content)

  return (
    <div
      dir={dir}
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}

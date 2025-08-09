import DOMPurify from 'dompurify'

interface HTMLContentProps {
  content: string
  className?: string
  maxLength?: number
}

export function HTMLContent({ content, className = '', maxLength }: HTMLContentProps) {
  if (!content) return null

  // Convert plain text to HTML if needed
  let processedContent = content
  
  // Check if content contains HTML tags
  const hasHTMLTags = /<[^>]*>/g.test(content)
  
  if (!hasHTMLTags) {
    // Convert plain text to HTML paragraphs
    processedContent = content
      .split('\n\n')
      .filter(paragraph => paragraph.trim())
      .map(paragraph => `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`)
      .join('')
  }

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedHTML = DOMPurify.sanitize(processedContent, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote',
      'a', 'img',
      'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'style'
    ],
    ALLOW_DATA_ATTR: false
  })

  // Truncate if maxLength is specified
  let displayContent = sanitizedHTML
  if (maxLength && content.length > maxLength) {
    // Remove HTML tags for length calculation
    const textContent = content.replace(/<[^>]*>/g, '')
    if (textContent.length > maxLength) {
      // Find a good breaking point
      const truncated = textContent.substring(0, maxLength)
      const lastSpace = truncated.lastIndexOf(' ')
      const cutPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength
      displayContent = DOMPurify.sanitize(textContent.substring(0, cutPoint) + '...', {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      })
    }
  }

  return (
    <div 
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: displayContent }}
    />
  )
}

import DOMPurify from 'dompurify'

interface HTMLContentProps {
  content: string
  className?: string
  maxLength?: number
}

export function HTMLContent({ content, className = '', maxLength }: HTMLContentProps) {
  if (!content || content.trim() === '') {
    return (
      <div className={`html-content ${className}`}>
        <p className="text-muted-foreground">No content available</p>
      </div>
    )
  }

  // Clean and prepare content
  let processedContent = content.trim()
  
  // Simple approach: Just ensure proper paragraph structure
  // First, normalize line endings and clean up the content
  processedContent = processedContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .trim()

  // Check if content contains HTML paragraph tags
  const hasHTMLParagraphs = /<p\b[^>]*>/i.test(processedContent)
  
  if (!hasHTMLParagraphs) {
    // If no HTML paragraphs, split content into paragraphs
    const paragraphs = processedContent
      .split(/\n\s*\n/)  // Split on double newlines
      .filter(p => p.trim())
      .map(paragraph => {
        // Clean the paragraph and replace single newlines with <br>
        let cleanParagraph = paragraph.trim()
        
        // If paragraph contains HTML tags other than simple formatting, keep as is
        if (/<(?!\/?(b|strong|i|em|u|br|span)\b)[^>]+>/i.test(cleanParagraph)) {
          return cleanParagraph
        }
        
        // Replace single newlines with <br> tags within paragraphs
        cleanParagraph = cleanParagraph.replace(/\n/g, '<br>')
        
        // Wrap in paragraph tag if not already wrapped
        if (!cleanParagraph.startsWith('<') || !cleanParagraph.includes('>')) {
          return `<p>${cleanParagraph}</p>`
        }
        
        return cleanParagraph
      })
    
    processedContent = paragraphs.join('\n')
  }
  
  // Clean up any remaining issues
  processedContent = processedContent
    .replace(/<br\s*\/?>/gi, '<br>')  // Normalize br tags
    .replace(/>\s+</g, '><')          // Remove whitespace between tags
    .trim()

  // Enhanced sanitization configuration
  const sanitizedHTML = DOMPurify.sanitize(processedContent, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'span', 'div', 'small', 'mark'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title',
      'src', 'alt', 'width', 'height',
      'class', 'style', 'id'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false
  })

  // Handle truncation if needed
  let displayContent = sanitizedHTML
  if (maxLength && maxLength > 0) {
    // Create a temporary div to get text content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = sanitizedHTML
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    
    if (textContent.length > maxLength) {
      // Find a good breaking point
      const truncated = textContent.substring(0, maxLength)
      const lastSpace = truncated.lastIndexOf(' ')
      const lastPeriod = truncated.lastIndexOf('.')
      const lastExclamation = truncated.lastIndexOf('!')
      const lastQuestion = truncated.lastIndexOf('?')
      
      // Find the best breaking point (prioritize sentence endings)
      const sentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)
      let cutPoint = maxLength
      
      if (sentenceEnd > maxLength * 0.7) {
        cutPoint = sentenceEnd + 1
      } else if (lastSpace > maxLength * 0.8) {
        cutPoint = lastSpace
      }
      
      const truncatedText = textContent.substring(0, cutPoint).trim()
      displayContent = `<p>${truncatedText}...</p>`
      displayContent = DOMPurify.sanitize(displayContent)
    }
  }

  // Final validation
  if (!displayContent || displayContent.trim() === '') {
    displayContent = '<p>No content available</p>'
  }

  return (
    <div 
      className={`html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: displayContent }}
    />
  )
}

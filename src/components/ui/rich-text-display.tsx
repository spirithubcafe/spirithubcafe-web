interface RichTextDisplayProps {
  content: string
  className?: string
  dir?: 'ltr' | 'rtl'
}

export function RichTextDisplay({ content, className = '', dir = 'ltr' }: RichTextDisplayProps) {
  // Function to safely render HTML content with better formatting
  const formatContent = (text: string) => {
    // First clean and format the content
    let formattedContent = text

    // Handle line breaks and paragraphs
    formattedContent = formattedContent
      .replace(/\n\n+/g, '</p><p>')  // Double line breaks become paragraph breaks
      .replace(/\n/g, '<br>')        // Single line breaks become <br>
      .replace(/^\s*/, '<p>')        // Start with paragraph
      .replace(/\s*$/, '</p>')       // End with paragraph

    // Handle numbered lists (1. 2. 3. etc.)
    formattedContent = formattedContent.replace(
      /(\d+\.\s+[^\n]*)/g, 
      '<div class="numbered-item">$1</div>'
    )

    // Handle bullet points
    formattedContent = formattedContent.replace(
      /•\s+([^\n]*)/g, 
      '<div class="bullet-item">• $1</div>'
    )

    // Handle bold text (markdown style)
    formattedContent = formattedContent.replace(
      /\*\*(.*?)\*\*/g, 
      '<strong>$1</strong>'
    )

    // Handle italic text
    formattedContent = formattedContent.replace(
      /\*(.*?)\*/g, 
      '<em>$1</em>'
    )

    // Handle headers (simple ## style)
    formattedContent = formattedContent.replace(
      /##\s+(.*?)(<br>|<\/p>)/g, 
      '<h3 class="section-header">$1</h3>$2'
    )

    // Clean up empty paragraphs
    formattedContent = formattedContent.replace(/<p>\s*<\/p>/g, '')
    
    return formattedContent
  }

  const processedContent = formatContent(content)

  return (
    <div 
      className={`rich-text-content leading-loose text-base ${className}`}
      dir={dir}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}

// CSS styles to be added to global CSS or component styles
export const richTextStyles = `
.rich-text-content {
  line-height: 1.8;
  font-size: 16px;
  color: var(--foreground);
}

.rich-text-content p {
  margin-bottom: 1rem;
  margin-top: 0;
  line-height: 1.7;
}

.rich-text-content .section-header {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  color: var(--foreground);
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.5rem;
}

.rich-text-content .numbered-item {
  margin: 0.75rem 0;
  padding-left: 1rem;
  line-height: 1.6;
  font-weight: 500;
}

.rich-text-content .bullet-item {
  margin: 0.5rem 0;
  padding-left: 1rem;
  line-height: 1.6;
}

.rich-text-content strong {
  font-weight: 600;
  color: var(--foreground);
}

.rich-text-content em {
  font-style: italic;
  color: var(--muted-foreground);
}

.rich-text-content br {
  margin: 0.25rem 0;
}

/* RTL support */
.rich-text-content[dir="rtl"] .numbered-item {
  padding-right: 1rem;
  padding-left: 0;
  text-align: right;
}

.rich-text-content[dir="rtl"] .bullet-item {
  padding-right: 1rem;
  padding-left: 0;
  text-align: right;
}
`

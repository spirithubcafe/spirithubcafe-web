import { useRef, useState } from 'react'
import { Button } from './button'
import { HTMLContent } from './html-content'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Type
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  direction?: 'ltr' | 'rtl'
  className?: string
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = '', 
  direction = 'ltr',
  className = '' 
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isPreview, setIsPreview] = useState(false)

  const insertTag = (openTag: string, closeTag: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText
    if (selectedText) {
      // Wrap selected text
      newText = value.substring(0, start) + openTag + selectedText + closeTag + value.substring(end)
    } else {
      // Insert tags at cursor position
      if (openTag.includes('<li>')) {
        // For lists, add sample text
        newText = value.substring(0, start) + openTag + 'List item' + closeTag + value.substring(end)
      } else if (openTag.includes('<a href=')) {
        // For links, add sample text and URL
        newText = value.substring(0, start) + '<a href="https://example.com">Link text</a>' + value.substring(end)
      } else {
        // For other tags, add sample text
        const sampleText = openTag.includes('<h') ? 'Heading text' : 'Text'
        newText = value.substring(0, start) + openTag + sampleText + closeTag + value.substring(end)
      }
    }
    
    onChange(newText)
    
    // Set cursor position after the content
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = selectedText ? 
        start + openTag.length + selectedText.length + closeTag.length : 
        start + newText.substring(start).indexOf(closeTag) + closeTag.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatButtons = [
    { icon: Bold, action: () => insertTag('<strong>', '</strong>'), title: 'Bold' },
    { icon: Italic, action: () => insertTag('<em>', '</em>'), title: 'Italic' },
    { icon: Underline, action: () => insertTag('<u>', '</u>'), title: 'Underline' },
    { icon: Type, action: () => insertTag('<h3>', '</h3>'), title: 'Heading' },
    { icon: List, action: () => insertTag('<ul>\n<li>', '</li>\n</ul>'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertTag('<ol>\n<li>', '</li>\n</ol>'), title: 'Numbered List' },
    { icon: AlignLeft, action: () => insertTag('<div style="text-align: left;">', '</div>'), title: 'Align Left' },
    { icon: AlignCenter, action: () => insertTag('<div style="text-align: center;">', '</div>'), title: 'Align Center' },
    { icon: AlignRight, action: () => insertTag('<div style="text-align: right;">', '</div>'), title: 'Align Right' },
    { icon: Link, action: () => insertTag('<a href="URL">', '</a>'), title: 'Link' },
  ]

  return (
    <div className={`rich-text-editor border rounded-lg ${className}`} dir={direction}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50">
        {formatButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.title}
            className="h-8 w-8 p-0"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="h-8"
          >
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="p-3">
        {isPreview ? (
          <div className={`min-h-[200px] ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
            {value && value.trim() ? (
              <HTMLContent 
                content={value} 
                className={`${direction === 'rtl' ? 'rtl' : 'ltr'} text-sm`}
              />
            ) : (
              <div className="text-muted-foreground text-sm italic p-4 border-2 border-dashed rounded-lg text-center">
                {direction === 'rtl' ? 'لا يوجد محتوى للمعاينة' : 'No content to preview'}
              </div>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full min-h-[200px] resize-none border-0 outline-none bg-transparent text-sm leading-relaxed rich-text-textarea ${direction === 'rtl' ? 'rtl' : 'ltr'}`}
          />
        )}
      </div>
      
      {/* Help Text */}
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        Use the buttons above to format your text. Switch to Preview to see the final result.
      </div>
    </div>
  )
}

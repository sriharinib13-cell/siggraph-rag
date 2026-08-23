'use client'

import { useEffect, useRef } from 'react'
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import 'highlight.js/styles/github.min.css'
import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'

// Register languages
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)

interface Source {
  title: string
  pdf_url?: string
  github_link?: string
  acm_url?: string
}

interface AnswerSectionProps {
  answer: string
  processingTime?: number
  isVisible: boolean
  sources?: Source[]
}

export function AnswerSection({ answer, processingTime, isVisible, sources = [] }: AnswerSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current && answer) {
      const renderMarkdown = async () => {
        try {
          const html = await marked.parse(answer)

          // Replace [Citation Title] patterns with styled badges linking to the source PDF
          const processedHtml = (html as string).replace(/\[([^\]<]+)\]/g, (match, title) => {
            const source = sources.find(s => {
              const t = s.title?.toLowerCase() ?? ''
              const c = title.toLowerCase()
              return t === c || t.includes(c) || c.includes(t)
            })
            const url = source?.pdf_url || source?.acm_url || source?.github_link
            if (url) {
              return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="citation-badge">${title}</a>`
            }
            return `<span class="citation-badge">${title}</span>`
          })

          if (contentRef.current) {
            contentRef.current.innerHTML = processedHtml
            
            // Render math and highlight code after DOM update
            setTimeout(() => {
              if (contentRef.current) {
                renderMathInElement(contentRef.current, {
                  delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                  ],
                  throwOnError: false,
                })
                contentRef.current.querySelectorAll('pre code').forEach((block) => {
                  hljs.highlightElement(block as HTMLElement)
                })
              }
            }, 0)
          }
        } catch (error) {
          console.error('Error parsing markdown:', error)
          if (contentRef.current) {
            contentRef.current.innerHTML = answer
          }
        }
      }
      
      renderMarkdown()
    }
  }, [answer])

  if (!isVisible) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 md:px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Answer</h3>
          </div>
          {processingTime && (
            <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {processingTime.toFixed(1)}s
            </span>
          )}
        </div>
      </div>
      <div className="px-6 md:px-8 py-6 md:py-8">
        <div
          ref={contentRef}
          className="prose prose-lg max-w-none
            prose-headings:text-gray-900 prose-headings:font-semibold
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-justify prose-p:mb-4
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-xl prose-pre:shadow-sm
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-ul:text-gray-700 prose-ol:text-gray-700
            prose-li:text-gray-700"
        />
      </div>
    </div>
  )
}


import React, { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"

const MarkdownRenderer = memo(({ content }) => {
  return (
    <div className="prose prose-sm max-w-none wrap-break-word">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: (props) => (
            <h1 className="text-xl font-bold mt-6 mb-3" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-lg font-semibold mt-5 mb-2" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-base font-semibold mt-4 mb-2" {...props} />
          ),

          
          // Paragraph
          
          p: (props) => (
            <p className="mb-3 leading-relaxed" {...props} />
          ),

          
          // Links
          
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline font-medium"
              {...props}
            >
              {children}
            </a>
          ),

          
          // Lists
          
          ul: (props) => (
            <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />
          ),
          li: (props) => (
            <li className="leading-relaxed" {...props} />
          ),

          
          // Emphasis
          
          strong: (props) => (
            <strong className="font-semibold" {...props} />
          ),
          em: (props) => (
            <em className="italic" {...props} />
          ),

          
          // Blockquote
          
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-emerald-500 pl-4 italic text-slate-600 my-4"
              {...props}
            />
          ),

          
          // Code
          
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")

            if (!inline && match) {
              return (
                <div className="my-4 rounded-xl overflow-hidden">
                  <SyntaxHighlighter
                    style={dracula}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      fontSize: "0.8rem"
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              )
            }

            return (
              <code
                className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            )
          },

          ////////////////////////////////////////////////////
          // Pre wrapper
          ////////////////////////////////////////////////////
          pre: (props) => (
            <pre className="overflow-x-auto" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

export default MarkdownRenderer

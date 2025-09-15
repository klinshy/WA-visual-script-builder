"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download } from "lucide-react"

interface CodePreviewProps {
  code: string
}

export function CodePreview({ code }: CodePreviewProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
  }

  const downloadScript = () => {
    const blob = new Blob([code], { type: "text/typescript" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "workadventure-script.ts"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const defaultCode = `// No blocks added yet - start building your automation!
// Drag blocks from the toolbox to create your WorkAdventure script`

  const renderHighlightedCode = (code: string) => {
    const lines = code.split("\n")
    return lines.map((line, lineIndex) => {
      const tokens = []
      const currentIndex = 0

      // Process the line character by character to apply highlighting
      const processLine = (text: string) => {
        const patterns = [
          { regex: /\/\/.*$/g, className: "text-green-400" }, // Comments
          {
            regex:
              /\b(const|let|var|function|class|interface|type|import|export|from|async|await|return|if|else|for|while|try|catch|then|subscribe)\b/g,
            className: "text-blue-400",
          }, // Keywords
          { regex: /"([^"\\]|\\.)*"/g, className: "text-yellow-300" }, // Double quotes
          { regex: /'([^'\\]|\\.)*'/g, className: "text-yellow-300" }, // Single quotes
          { regex: /`([^`\\]|\\.)*`/g, className: "text-yellow-300" }, // Template literals
          { regex: /\b\d+\b/g, className: "text-orange-400" }, // Numbers
          { regex: /\b(WA|console|bootstrapExtra)\b/g, className: "text-purple-400" }, // API objects
        ]

        const result = text
        const matches = []

        // Find all matches
        patterns.forEach((pattern) => {
          let match
          while ((match = pattern.regex.exec(text)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              className: pattern.className,
              text: match[0],
            })
          }
          pattern.regex.lastIndex = 0 // Reset regex
        })

        // Sort matches by start position
        matches.sort((a, b) => a.start - b.start)

        // Remove overlapping matches (keep the first one)
        const filteredMatches = []
        let lastEnd = 0
        matches.forEach((match) => {
          if (match.start >= lastEnd) {
            filteredMatches.push(match)
            lastEnd = match.end
          }
        })

        // Build the result with spans
        const parts = []
        let currentPos = 0

        filteredMatches.forEach((match, index) => {
          // Add text before the match
          if (match.start > currentPos) {
            parts.push(<span key={`text-${lineIndex}-${index}`}>{text.slice(currentPos, match.start)}</span>)
          }

          // Add the highlighted match
          parts.push(
            <span key={`match-${lineIndex}-${index}`} className={match.className}>
              {match.text}
            </span>,
          )

          currentPos = match.end
        })

        // Add remaining text
        if (currentPos < text.length) {
          parts.push(<span key={`end-${lineIndex}`}>{text.slice(currentPos)}</span>)
        }

        return parts.length > 0 ? parts : [<span key={`line-${lineIndex}`}>{text}</span>]
      }

      return (
        <div key={lineIndex} className="leading-relaxed">
          {processLine(line)}
        </div>
      )
    })
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Generated Code</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={downloadScript}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <pre className="text-sm font-mono bg-slate-900 text-slate-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-full">
              {renderHighlightedCode(code || defaultCode)}
            </pre>
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  )
}

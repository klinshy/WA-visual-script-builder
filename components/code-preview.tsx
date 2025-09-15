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

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <pre className="p-4 text-sm font-mono bg-muted/30 text-foreground whitespace-pre-wrap">
            {code ||
              "// No blocks added yet - start building your automation!\n// Drag blocks from the toolbox to create your WorkAdventure script"}
          </pre>
        </ScrollArea>
      </CardContent>
    </div>
  )
}

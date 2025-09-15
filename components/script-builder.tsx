"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { VisualCanvas } from "./visual-canvas"
import { CodePreview } from "./code-preview"
import { ThemeToggle } from "./theme-toggle"
import { Download, Save, Settings, Github } from "lucide-react"

export function ScriptBuilder() {
  const [generatedCode, setGeneratedCode] = useState("")
  const [showCodePreview, setShowCodePreview] = useState(true)

  const handleCodeChange = (code: string) => {
    setGeneratedCode(code)
  }

  const handleExport = () => {
    const blob = new Blob([generatedCode], { type: "text/typescript" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "workadventure-script.ts"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGitHubClick = () => {
    window.open("https://github.com/klinshy/WA-visual-script-builder", "_blank")
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">WorkAdventure Script Builder</h1>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-muted-foreground">Visual Canvas Editor</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleGitHubClick}>
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCodePreview(!showCodePreview)}>
              <Settings className="w-4 h-4 mr-2" />
              {showCodePreview ? "Hide Code" : "Show Code"}
            </Button>
            <Button size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export .ts
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Visual Workspace */}
        <div className="flex-1 min-w-0">
          <VisualCanvas onCodeChange={handleCodeChange} />
        </div>

        {/* Code Preview Panel */}
        {showCodePreview && (
          <div className="w-96 bg-card border-l border-border flex-shrink-0">
            <CodePreview code={generatedCode} />
          </div>
        )}
      </div>
    </div>
  )
}

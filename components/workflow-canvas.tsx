"use client"

import type React from "react"

import { useRef, useState, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WorkflowEngine } from "@/lib/workflow-engine"

interface Connection {
  id: string
  fromBlockId: string
  toBlockId: string
  fromPort: "output" | "success" | "failure"
  toPort: "input"
}

interface WorkflowCanvasProps {
  workflow: any[]
  onWorkflowChange: (workflow: any[]) => void
  selectedBlock: any
  onBlockSelect: (block: any) => void
  connections: Connection[]
  onConnectionsChange: (connections: Connection[]) => void
}

export function WorkflowCanvas({
  workflow,
  onWorkflowChange,
  selectedBlock,
  onBlockSelect,
  connections,
  onConnectionsChange,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedBlock, setDraggedBlock] = useState<any>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{
    blockId: string
    port: string
    position: { x: number; y: number }
  } | null>(null)
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null)
  const [workflowValidation, setWorkflowValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: [],
  })

  useEffect(() => {
    if (workflow.length > 0) {
      const engine = new WorkflowEngine(workflow, connections)
      const validation = engine.validateWorkflow()
      setWorkflowValidation(validation)
    } else {
      setWorkflowValidation({ isValid: true, errors: [] })
    }
  }, [workflow, connections])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (!canvasRef.current) return

      let blockData
      try {
        blockData = JSON.parse(e.dataTransfer.getData("application/json"))
      } catch {
        blockData = selectedBlock
      }

      if (!blockData) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newBlock = {
        ...blockData,
        id: `${blockData.id}-${Date.now()}`,
        position: { x, y },
        connections: [],
        userConfig: {},
      }

      onWorkflowChange([...workflow, newBlock])
      setDraggedBlock(null)
    },
    [selectedBlock, workflow, onWorkflowChange],
  )

  const handleBlockDragStart = useCallback((e: React.DragEvent, block: any) => {
    setDraggedBlock(block)
    e.dataTransfer.effectAllowed = "move"
  }, [])

  const handleBlockDrop = useCallback(
    (e: React.DragEvent, targetBlock: any) => {
      e.preventDefault()
      e.stopPropagation()

      if (!draggedBlock || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const updatedWorkflow = workflow.map((block) =>
        block.id === draggedBlock.id ? { ...block, position: { x, y } } : block,
      )

      onWorkflowChange(updatedWorkflow)
      setDraggedBlock(null)
    },
    [draggedBlock, workflow, onWorkflowChange],
  )

  const handleConnectionStart = useCallback((e: React.MouseEvent, blockId: string, port: string) => {
    e.stopPropagation()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    setIsConnecting(true)
    setConnectionStart({
      blockId,
      port,
      position: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    })
  }, [])

  const handleConnectionEnd = useCallback(
    (e: React.MouseEvent, blockId: string, port: string) => {
      e.stopPropagation()
      if (!connectionStart || connectionStart.blockId === blockId) {
        setIsConnecting(false)
        setConnectionStart(null)
        setTempConnection(null)
        return
      }

      const newConnection: Connection = {
        id: `${connectionStart.blockId}-${blockId}-${Date.now()}`,
        fromBlockId: connectionStart.blockId,
        toBlockId: blockId,
        fromPort: connectionStart.port as any,
        toPort: port as any,
      }

      onConnectionsChange([...connections, newConnection])
      setIsConnecting(false)
      setConnectionStart(null)
      setTempConnection(null)
    },
    [connectionStart, connections, onConnectionsChange],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isConnecting && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setTempConnection({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }
    },
    [isConnecting],
  )

  const getBlockPosition = (blockId: string) => {
    const block = workflow.find((b) => b.id === blockId)
    return block?.position || { x: 0, y: 0 }
  }

  const renderConnection = (connection: Connection) => {
    const fromPos = getBlockPosition(connection.fromBlockId)
    const toPos = getBlockPosition(connection.toBlockId)

    const startX = fromPos.x + 192
    const startY = fromPos.y + 40
    const endX = toPos.x
    const endY = toPos.y + 40

    const midX = startX + (endX - startX) / 2

    const getConnectionColor = () => {
      switch (connection.fromPort) {
        case "success":
          return "#22c55e"
        case "failure":
          return "#ef4444"
        default:
          return "#0891b2"
      }
    }

    return (
      <path
        key={connection.id}
        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
        stroke={getConnectionColor()}
        strokeWidth="2"
        fill="none"
        className="pointer-events-none"
      />
    )
  }

  const renderTempConnection = () => {
    if (!connectionStart || !tempConnection) return null

    const startX = connectionStart.position.x
    const startY = connectionStart.position.y
    const endX = tempConnection.x
    const endY = tempConnection.y
    const midX = startX + (endX - startX) / 2

    return (
      <path
        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
        stroke="#0891b2"
        strokeWidth="2"
        strokeDasharray="5,5"
        fill="none"
        className="pointer-events-none"
      />
    )
  }

  const getBlockStatus = (block: any) => {
    if (!block.config) return "complete"

    for (const [key, field] of Object.entries(block.config)) {
      const fieldConfig = field as any
      if (fieldConfig.required) {
        const userValue = block.userConfig?.[key]
        if (!userValue && userValue !== 0 && userValue !== false) {
          return "incomplete"
        }
      }
    }
    return "complete"
  }

  return (
    <div className="h-full overflow-auto">
      {!workflowValidation.isValid && (
        <div className="bg-destructive/10 border-b border-destructive/20 p-3">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Validation Issues</Badge>
            <span className="text-sm text-destructive">{workflowValidation.errors.join(", ")}</span>
          </div>
        </div>
      )}

      <div
        ref={canvasRef}
        className="min-h-full min-w-full workflow-canvas bg-background relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        style={{ minHeight: "100vh", minWidth: "100%" }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {connections.map(renderConnection)}
          {renderTempConnection()}
        </svg>

        {workflow.map((block) => {
          const blockStatus = getBlockStatus(block)
          return (
            <Card
              key={block.id}
              className={`absolute p-4 min-w-48 cursor-move hover:shadow-lg transition-shadow select-none ${
                onBlockSelect && block.id === selectedBlock?.id ? "ring-2 ring-primary" : ""
              } ${blockStatus === "incomplete" ? "border-destructive" : ""}`}
              style={{
                left: block.position.x,
                top: block.position.y,
                zIndex: 2,
              }}
              draggable
              onDragStart={(e) => handleBlockDragStart(e, block)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleBlockDrop(e, block)}
              onClick={() => onBlockSelect?.(block)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${blockStatus === "incomplete" ? "bg-destructive" : "bg-primary"}`}
                ></div>
                <h4 className="font-medium text-sm">{block.name}</h4>
                {blockStatus === "incomplete" && (
                  <Badge variant="destructive" className="text-xs">
                    Config Required
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{block.description}</p>

              <div
                className="absolute -right-2 top-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                onMouseDown={(e) => handleConnectionStart(e, block.id, "output")}
                title="Connect to next block"
              ></div>
              <div
                className="absolute -left-2 top-1/2 w-4 h-4 bg-secondary rounded-full border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                onMouseDown={(e) => handleConnectionEnd(e, block.id, "input")}
                title="Connect from previous block"
              ></div>

              {block.id.includes("if-condition") && (
                <>
                  <div
                    className="absolute -right-2 top-1/4 w-3 h-3 bg-green-500 rounded-full border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                    onMouseDown={(e) => handleConnectionStart(e, block.id, "success")}
                    title="Success path"
                  ></div>
                  <div
                    className="absolute -right-2 top-3/4 w-3 h-3 bg-red-500 rounded-full border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                    onMouseDown={(e) => handleConnectionStart(e, block.id, "failure")}
                    title="Failure path"
                  ></div>
                </>
              )}
            </Card>
          )
        })}

        {isDragOver && (
          <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-lg font-medium text-primary mb-2">Drop to Add Block</div>
              <div className="text-sm text-muted-foreground">Release to add the block to your workflow</div>
            </div>
          </div>
        )}

        {workflow.length === 0 && !isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-medium text-muted-foreground mb-2">Start Building Your Automation</div>
              <div className="text-sm text-muted-foreground">Drag blocks from the library to create your workflow</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface Position {
  x: number
  y: number
}

interface Connection {
  from: string
  to: string
  fromPort: string
  toPort: string
}

interface BlockData {
  id: string
  type: string
  position: Position
  data: Record<string, any>
}

interface Port {
  id: string
  type: "input" | "output"
  label: string
  dataType: string
}

interface VisualCanvasProps {
  onCodeChange?: (code: string) => void
}

const BLOCK_TYPES = {
  // Triggers
  onEnterZone: {
    title: "On Enter Zone",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [{ name: "zoneName", label: "Zone Name", type: "text" }],
  },
  onPlayerJoin: {
    title: "On Player Join",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [],
  },
  onChatMessage: {
    title: "On Chat Message",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [{ name: "message", label: "Message Contains", type: "text" }],
  },

  // Actions
  sendChatMessage: {
    title: "Send Chat Message",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "message", label: "Message", type: "text" },
      { name: "author", label: "Author", type: "text" },
    ],
  },
  moveCamera: {
    title: "Move Camera",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "x", label: "X Position", type: "number" },
      { name: "y", label: "Y Position", type: "number" },
    ],
  },
  playSound: {
    title: "Play Sound",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "soundUrl", label: "Sound URL", type: "text" }],
  },

  // Control Flow
  ifCondition: {
    title: "If Condition",
    color: "bg-purple-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "true", type: "output", label: "True", dataType: "flow" },
      { id: "false", type: "output", label: "False", dataType: "flow" },
    ],
    fields: [
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ["player.name === value", "variable === value", "player.position.x > value"],
      },
      { name: "value", label: "Value", type: "text" },
    ],
  },
  delay: {
    title: "Wait/Delay",
    color: "bg-orange-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "duration", label: "Duration (ms)", type: "number" }],
  },

  // Variables
  setVariable: {
    title: "Set Variable",
    color: "bg-yellow-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "variableName", label: "Variable Name", type: "text" },
      { name: "value", label: "Value", type: "text" },
    ],
  },
}

export function VisualCanvas({ onCodeChange }: VisualCanvasProps) {
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [draggedBlock, setDraggedBlock] = useState<BlockData | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<{ blockId: string; portId: string } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const addBlock = useCallback((type: string, position: Position) => {
    const newBlock: BlockData = {
      id: `block_${Date.now()}`,
      type,
      position,
      data: {},
    }
    setBlocks((prev) => [...prev, newBlock])
  }, [])

  const updateBlockPosition = useCallback((blockId: string, position: Position) => {
    setBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, position } : block)))
  }, [])

  const updateBlockData = useCallback((blockId: string, data: Record<string, any>) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, data: { ...block.data, ...data } } : block)),
    )
  }, [])

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== blockId))
    setConnections((prev) => prev.filter((conn) => conn.from !== blockId && conn.to !== blockId))
  }, [])

  const handlePortClick = useCallback(
    (blockId: string, portId: string, portType: "input" | "output") => {
      if (connecting) {
        if (connecting.blockId !== blockId) {
          // Create connection
          const newConnection: Connection = {
            from: portType === "output" ? blockId : connecting.blockId,
            to: portType === "input" ? blockId : connecting.blockId,
            fromPort: portType === "output" ? portId : connecting.portId,
            toPort: portType === "input" ? portId : connecting.portId,
          }
          setConnections((prev) => [...prev, newConnection])
        }
        setConnecting(null)
      } else {
        setConnecting({ blockId, portId })
      }
    },
    [connecting],
  )

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const blockType = e.dataTransfer.getData("blockType")
      if (blockType && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
        addBlock(blockType, position)
      }
    },
    [addBlock],
  )

  const renderBlock = (block: BlockData) => {
    const blockType = BLOCK_TYPES[block.type as keyof typeof BLOCK_TYPES]
    if (!blockType) return null

    return (
      <div
        key={block.id}
        className={`absolute cursor-move select-none ${selectedBlock === block.id ? "ring-2 ring-blue-400" : ""}`}
        style={{ left: block.position.x, top: block.position.y }}
        onClick={() => setSelectedBlock(block.id)}
        onMouseDown={(e) => {
          const startX = e.clientX - block.position.x
          const startY = e.clientY - block.position.y

          const handleMouseMove = (e: MouseEvent) => {
            updateBlockPosition(block.id, {
              x: e.clientX - startX,
              y: e.clientY - startY,
            })
          }

          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
          }

          document.addEventListener("mousemove", handleMouseMove)
          document.addEventListener("mouseup", handleMouseUp)
        }}
      >
        <Card className={`p-3 min-w-[200px] ${blockType.color} text-white shadow-lg`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">{blockType.title}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteBlock(block.id)
              }}
              className="text-white hover:text-red-200 text-xs"
            >
              ×
            </button>
          </div>

          {/* Input ports */}
          <div className="flex flex-col gap-1 mb-2">
            {blockType.ports
              .filter((p) => p.type === "input")
              .map((port) => (
                <div key={port.id} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-white cursor-pointer hover:bg-white ${connecting?.blockId === block.id && connecting?.portId === port.id ? "bg-white" : "bg-transparent"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePortClick(block.id, port.id, "input")
                    }}
                  />
                  <span className="ml-2 text-xs">{port.label}</span>
                </div>
              ))}
          </div>

          {/* Fields */}
          {blockType.fields.map((field) => (
            <div key={field.name} className="mb-2">
              <label className="block text-xs mb-1">{field.label}</label>
              {field.type === "select" ? (
                <select
                  className="w-full text-xs p-1 rounded text-black"
                  value={block.data[field.name] || ""}
                  onChange={(e) => updateBlockData(block.id, { [field.name]: e.target.value })}
                >
                  <option value="">Select...</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="w-full text-xs p-1 rounded text-black"
                  value={block.data[field.name] || ""}
                  onChange={(e) => updateBlockData(block.id, { [field.name]: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          ))}

          {/* Output ports */}
          <div className="flex flex-col gap-1">
            {blockType.ports
              .filter((p) => p.type === "output")
              .map((port) => (
                <div key={port.id} className="flex items-center justify-end">
                  <span className="mr-2 text-xs">{port.label}</span>
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-white cursor-pointer hover:bg-white ${connecting?.blockId === block.id && connecting?.portId === port.id ? "bg-white" : "bg-transparent"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePortClick(block.id, port.id, "output")
                    }}
                  />
                </div>
              ))}
          </div>
        </Card>
      </div>
    )
  }

  const renderConnections = () => {
    return connections.map((conn, index) => {
      const fromBlock = blocks.find((b) => b.id === conn.from)
      const toBlock = blocks.find((b) => b.id === conn.to)

      if (!fromBlock || !toBlock) return null

      const fromX = fromBlock.position.x + 200 // Approximate block width
      const fromY = fromBlock.position.y + 50 // Approximate port position
      const toX = toBlock.position.x
      const toY = toBlock.position.y + 50

      return (
        <svg
          key={index}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        >
          <path
            d={`M ${fromX} ${fromY} C ${fromX + 50} ${fromY} ${toX - 50} ${toY} ${toX} ${toY}`}
            stroke="#4F46E5"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      )
    })
  }

  // Code generation functions
  const generateCode = useCallback(() => {
    if (blocks.length === 0) {
      return "// No blocks added yet\nexport {};"
    }

    let code = `// Generated WorkAdventure Script
import { bootstrapExtra } from "@workadventure/scripting-api-extra";

// Wait for the API to be ready
WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player tags: ', WA.player.tags);

    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
        
        // Generated code from visual blocks
`

    // Find trigger blocks (blocks with no input connections)
    const triggerBlocks = blocks.filter((block) => {
      const blockType = BLOCK_TYPES[block.type as keyof typeof BLOCK_TYPES]
      return blockType?.ports.every((port) => port.type === "output")
    })

    triggerBlocks.forEach((triggerBlock) => {
      code += generateBlockCode(triggerBlock, 2)
    })

    code += `    });
});`

    return code
  }, [blocks, connections])

  const generateBlockCode = useCallback(
    (block: BlockData, indent = 0): string => {
      const blockType = BLOCK_TYPES[block.type as keyof typeof BLOCK_TYPES]
      if (!blockType) return ""

      const indentStr = "    ".repeat(indent)
      let code = ""

      switch (block.type) {
        case "onEnterZone":
          code += `${indentStr}WA.room.area.onEnter('${block.data.zoneName || "zone"}').subscribe(() => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onPlayerJoin":
          code += `${indentStr}WA.player.onPlayerJoin.subscribe(() => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onChatMessage":
          code += `${indentStr}WA.chat.onChatMessage.subscribe((message) => {\n`
          if (block.data.message) {
            code += `${indentStr}    if (message.includes('${block.data.message}')) {\n`
            code += generateConnectedBlocks(block, indent + 2)
            code += `${indentStr}    }\n`
          } else {
            code += generateConnectedBlocks(block, indent + 1)
          }
          code += `${indentStr}});\n`
          break

        case "sendChatMessage":
          code += `${indentStr}WA.chat.sendChatMessage('${block.data.message || "Hello!"}', '${block.data.author || "System"}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "moveCamera":
          code += `${indentStr}WA.camera.set(${block.data.x || 0}, ${block.data.y || 0});\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "playSound":
          code += `${indentStr}WA.sound.loadSound('${block.data.soundUrl || ""}').play();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "ifCondition":
          const condition = block.data.condition || "player.name === value"
          const value = block.data.value || ""
          code += `${indentStr}if (${condition.replace("value", `'${value}'`)}) {\n`
          code += generateConnectedBlocks(block, indent + 1, "true")
          code += `${indentStr}} else {\n`
          code += generateConnectedBlocks(block, indent + 1, "false")
          code += `${indentStr}}\n`
          break

        case "delay":
          code += `${indentStr}setTimeout(() => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}}, ${block.data.duration || 1000});\n`
          break

        case "setVariable":
          code += `${indentStr}let ${block.data.variableName || "variable"} = '${block.data.value || ""}';\n`
          code += generateConnectedBlocks(block, indent)
          break
      }

      return code
    },
    [connections],
  )

  const generateConnectedBlocks = useCallback(
    (block: BlockData, indent: number, fromPort = "output"): string => {
      const connectedBlocks = connections
        .filter((conn) => conn.from === block.id && conn.fromPort === fromPort)
        .map((conn) => blocks.find((b) => b.id === conn.to))
        .filter(Boolean) as BlockData[]

      return connectedBlocks.map((connectedBlock) => generateBlockCode(connectedBlock, indent)).join("")
    },
    [connections, blocks],
  )

  useEffect(() => {
    const code = generateCode()
    onCodeChange?.(code)
  }, [blocks, connections, generateCode, onCodeChange])

  return (
    <div className="flex h-full">
      {/* Block Palette */}
      <div className="w-64 bg-gray-50 p-4 border-r overflow-y-auto">
        <h3 className="font-semibold mb-4">Block Palette</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Triggers</h4>
            {Object.entries(BLOCK_TYPES)
              .filter(([_, type]) => type.color === "bg-green-500")
              .map(([key, type]) => (
                <div
                  key={key}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("blockType", key)}
                  className={`p-2 mb-2 rounded cursor-move ${type.color} text-white text-sm`}
                >
                  {type.title}
                </div>
              ))}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Actions</h4>
            {Object.entries(BLOCK_TYPES)
              .filter(([_, type]) => type.color === "bg-blue-500")
              .map(([key, type]) => (
                <div
                  key={key}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("blockType", key)}
                  className={`p-2 mb-2 rounded cursor-move ${type.color} text-white text-sm`}
                >
                  {type.title}
                </div>
              ))}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Control Flow</h4>
            {Object.entries(BLOCK_TYPES)
              .filter(([_, type]) => type.color === "bg-purple-500" || type.color === "bg-orange-500")
              .map(([key, type]) => (
                <div
                  key={key}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("blockType", key)}
                  className={`p-2 mb-2 rounded cursor-move ${type.color} text-white text-sm`}
                >
                  {type.title}
                </div>
              ))}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Variables</h4>
            {Object.entries(BLOCK_TYPES)
              .filter(([_, type]) => type.color === "bg-yellow-500")
              .map(([key, type]) => (
                <div
                  key={key}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("blockType", key)}
                  className={`p-2 mb-2 rounded cursor-move ${type.color} text-white text-sm`}
                >
                  {type.title}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative bg-gray-100 overflow-hidden"
        onDrop={handleCanvasDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => {
          setSelectedBlock(null)
          setConnecting(null)
        }}
      >
        {renderConnections()}
        {blocks.map(renderBlock)}

        {connecting && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded text-sm">
            Click on a port to connect
          </div>
        )}
      </div>
    </div>
  )
}

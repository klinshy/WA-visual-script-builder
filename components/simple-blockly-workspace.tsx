"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface SimpleBlocklyWorkspaceProps {
  onCodeChange: (code: string) => void
}

export function SimpleBlocklyWorkspace({ onCodeChange }: SimpleBlocklyWorkspaceProps) {
  const [blocks, setBlocks] = useState<any[]>([])
  const [draggedBlock, setDraggedBlock] = useState<any>(null)

  const blockTypes = [
    {
      id: "wa_on_init",
      name: "When Script Starts",
      color: "bg-green-500",
      code: "WA.onInit().then(() => {\n  console.log('Script initialized');\n});",
    },
    {
      id: "wa_player_enters",
      name: "When Player Enters Zone",
      color: "bg-blue-500",
      code: "WA.room.onEnterLayer('myZone').subscribe(() => {\n  console.log('Player entered zone');\n});",
      fields: [{ name: "zoneName", label: "Zone Name", default: "myZone" }],
    },
    {
      id: "wa_show_message",
      name: "Show Message",
      color: "bg-purple-500",
      code: "WA.ui.displayActionMessage('{{message}}', () => {});",
      fields: [{ name: "message", label: "Message", default: "Hello!" }],
    },
    {
      id: "wa_send_chat",
      name: "Send Chat Message",
      color: "bg-orange-500",
      code: "WA.chat.sendChatMessage('{{message}}', '{{author}}');",
      fields: [
        { name: "message", label: "Message", default: "Hello everyone!" },
        { name: "author", label: "Author", default: "Bot" },
      ],
    },
    {
      id: "wa_play_sound",
      name: "Play Sound",
      color: "bg-red-500",
      code: "WA.sound.loadSound('{{soundUrl}}').then((sound) => {\n  sound.play({ volume: {{volume}} });\n});",
      fields: [
        { name: "soundUrl", label: "Sound URL", default: "/sounds/notification.mp3" },
        { name: "volume", label: "Volume", default: "0.5" },
      ],
    },
    {
      id: "wa_move_player",
      name: "Move Player",
      color: "bg-indigo-500",
      code: "WA.player.moveTo({{x}}, {{y}});",
      fields: [
        { name: "x", label: "X Position", default: "100" },
        { name: "y", label: "Y Position", default: "100" },
      ],
    },
  ]

  const generateCode = (blockList: any[]) => {
    const codeLines = blockList.map((block) => {
      let code = block.code
      if (block.fields) {
        block.fields.forEach((field: any) => {
          const value = block.values?.[field.name] || field.default
          code = code.replace(new RegExp(`{{${field.name}}}`, "g"), value)
        })
      }
      return code
    })

    const fullCode = `/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

// Wait for the API to be ready
WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player name: ', WA.player.name);

    // Initialize the scripting API extra
    bootstrapExtra().then(() => {
        console.log('Scripting API Extra ready');
    }).catch(e => console.error(e));

    // Generated blocks
${codeLines.map((line) => `    ${line}`).join("\n\n")}

}).catch(e => console.error(e));

export {};`

    return fullCode
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedBlock) {
      const newBlock = {
        ...draggedBlock,
        id: `${draggedBlock.id}_${Date.now()}`,
        values: {},
      }
      const updatedBlocks = [...blocks, newBlock]
      setBlocks(updatedBlocks)
      onCodeChange(generateCode(updatedBlocks))
      setDraggedBlock(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const updateBlockValue = (blockId: string, fieldName: string, value: string) => {
    const updatedBlocks = blocks.map((block) => {
      if (block.id === blockId) {
        return {
          ...block,
          values: { ...block.values, [fieldName]: value },
        }
      }
      return block
    })
    setBlocks(updatedBlocks)
    onCodeChange(generateCode(updatedBlocks))
  }

  const removeBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter((block) => block.id !== blockId)
    setBlocks(updatedBlocks)
    onCodeChange(generateCode(updatedBlocks))
  }

  useEffect(() => {
    // Initialize with a simple example
    const exampleBlocks = [
      {
        ...blockTypes[0],
        id: "wa_on_init_example",
        values: {},
      },
      {
        ...blockTypes[2],
        id: "wa_show_message_example",
        values: { message: "Welcome to WorkAdventure!" },
      },
    ]
    setBlocks(exampleBlocks)
    onCodeChange(generateCode(exampleBlocks))
  }, [])

  return (
    <div className="flex h-full">
      {/* Toolbox */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border p-4">
        <h3 className="font-semibold mb-4">Block Library</h3>
        <div className="space-y-2">
          {blockTypes.map((blockType) => (
            <div
              key={blockType.id}
              className={`${blockType.color} text-white p-3 rounded cursor-grab hover:opacity-80 transition-opacity`}
              draggable
              onDragStart={() => setDraggedBlock(blockType)}
            >
              <div className="font-medium text-sm">{blockType.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4 bg-muted/20" onDrop={handleDrop} onDragOver={handleDragOver}>
        <h3 className="font-semibold mb-4">Workspace</h3>
        <div className="space-y-4">
          {blocks.map((block) => (
            <div key={block.id} className={`${block.color} text-white p-4 rounded shadow-lg`}>
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{block.name}</div>
                <button onClick={() => removeBlock(block.id)} className="text-white/70 hover:text-white text-sm">
                  ×
                </button>
              </div>
              {block.fields && (
                <div className="space-y-2">
                  {block.fields.map((field: any) => (
                    <div key={field.name}>
                      <label className="block text-xs text-white/80 mb-1">{field.label}</label>
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-sm text-black rounded"
                        defaultValue={block.values?.[field.name] || field.default}
                        onChange={(e) => updateBlockValue(block.id, field.name, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {blocks.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>Drag blocks from the toolbox to start building your script</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

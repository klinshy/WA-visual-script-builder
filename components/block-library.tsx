"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Zap,
  Users,
  MapPin,
  Settings,
  Code,
  MessageCircle,
  Camera,
  Volume2,
  Monitor,
  Gamepad2,
  Eye,
} from "lucide-react"

const blockCategories = [
  {
    name: "Triggers",
    icon: Zap,
    color: "bg-chart-1",
    blocks: [
      {
        id: "player-enters",
        name: "Player Enters Zone",
        description: "Triggered when player enters a specific area",
        config: {
          zoneName: { type: "text", label: "Zone Name", default: "myZone", required: true },
          delay: { type: "number", label: "Delay (ms)", default: 0, min: 0 },
        },
      },
      {
        id: "player-leaves",
        name: "Player Leaves Zone",
        description: "Triggered when player leaves a specific area",
        config: {
          zoneName: { type: "text", label: "Zone Name", default: "myZone", required: true },
        },
      },
      {
        id: "player-interacts",
        name: "Player Interacts",
        description: "Triggered when player interacts with object",
        config: {
          objectName: { type: "text", label: "Object Name", default: "interactable", required: true },
          message: { type: "text", label: "Interaction Message", default: "Press SPACE to interact" },
        },
      },
      {
        id: "timer",
        name: "Timer",
        description: "Triggered after specified time delay",
        config: {
          duration: { type: "number", label: "Duration (seconds)", default: 5, min: 1, required: true },
          repeat: { type: "boolean", label: "Repeat", default: false },
        },
      },
      {
        id: "on-init",
        name: "On Init",
        description: "Triggered when the script initializes",
        config: {
          delay: { type: "number", label: "Delay (ms)", default: 0, min: 0 },
        },
      },
      {
        id: "variable-change",
        name: "Variable Change",
        description: "Triggered when a variable changes",
        config: {
          variableName: { type: "text", label: "Variable Name", default: "myVar", required: true },
        },
      },
      {
        id: "user-joined",
        name: "User Joined",
        description: "Triggered when a user joins the room",
        config: {
          welcomeMessage: { type: "text", label: "Welcome Message", default: "Welcome!" },
        },
      },
      {
        id: "user-left",
        name: "User Left",
        description: "Triggered when a user leaves the room",
        config: {
          farewellMessage: { type: "text", label: "Farewell Message", default: "Goodbye!" },
        },
      },
    ],
  },
  {
    name: "Actions",
    icon: Settings,
    color: "bg-chart-2",
    blocks: [
      {
        id: "show-message",
        name: "Show Message",
        description: "Display a message to the player",
        config: {
          text: { type: "textarea", label: "Message Text", default: "Hello from WorkAdventure!", required: true },
          bgColor: { type: "color", label: "Background Color", default: "#0891b2" },
          textColor: { type: "color", label: "Text Color", default: "#ffffff" },
          duration: { type: "number", label: "Duration (seconds)", default: 3, min: 1 },
        },
      },
      {
        id: "move-player",
        name: "Move Player",
        description: "Teleport player to specific location",
        config: {
          x: { type: "number", label: "X Position", default: 100, required: true },
          y: { type: "number", label: "Y Position", default: 100, required: true },
          roomUrl: { type: "text", label: "Room URL (optional)", default: "" },
        },
      },
      {
        id: "play-sound",
        name: "Play Sound",
        description: "Play audio file",
        config: {
          soundUrl: { type: "text", label: "Sound URL", default: "/sounds/notification.mp3", required: true },
          volume: { type: "number", label: "Volume", default: 0.5, min: 0, max: 1, step: 0.1 },
          loop: { type: "boolean", label: "Loop", default: false },
        },
      },
      {
        id: "open-website",
        name: "Open Website",
        description: "Open URL in iframe or new tab",
        config: {
          url: { type: "text", label: "Website URL", default: "https://example.com", required: true },
          openInIframe: { type: "boolean", label: "Open in iframe", default: true },
          width: { type: "number", label: "Width (px)", default: 800, min: 300 },
          height: { type: "number", label: "Height (px)", default: 600, min: 200 },
        },
      },
      {
        id: "close-popup",
        name: "Close Popup",
        description: "Close an open popup",
        config: {
          popupId: { type: "text", label: "Popup ID", default: "myPopup" },
        },
      },
      {
        id: "go-to-page",
        name: "Go To Page",
        description: "Navigate to another room/map",
        config: {
          url: { type: "text", label: "Room URL", default: "/maps/room.json", required: true },
        },
      },
      {
        id: "restore-player-control",
        name: "Restore Player Control",
        description: "Give control back to the player",
        config: {},
      },
      {
        id: "disable-player-control",
        name: "Disable Player Control",
        description: "Remove player control temporarily",
        config: {},
      },
    ],
  },
  {
    name: "Chat",
    icon: MessageCircle,
    color: "bg-blue-500",
    blocks: [
      {
        id: "send-chat-message",
        name: "Send Chat Message",
        description: "Send a message to the chat",
        config: {
          message: { type: "textarea", label: "Message", default: "Hello everyone!", required: true },
          author: { type: "text", label: "Author Name", default: "Bot" },
        },
      },
    ],
  },
  {
    name: "Camera",
    icon: Camera,
    color: "bg-purple-500",
    blocks: [
      {
        id: "follow-player",
        name: "Follow Player",
        description: "Make camera follow the player",
        config: {
          smooth: { type: "boolean", label: "Smooth Transition", default: true },
        },
      },
      {
        id: "set-camera-position",
        name: "Set Camera Position",
        description: "Move camera to specific position",
        config: {
          x: { type: "number", label: "X Position", default: 0, required: true },
          y: { type: "number", label: "Y Position", default: 0, required: true },
          width: { type: "number", label: "Width", default: 1024 },
          height: { type: "number", label: "Height", default: 768 },
          lock: { type: "boolean", label: "Lock Camera", default: false },
          smooth: { type: "boolean", label: "Smooth Transition", default: true },
        },
      },
    ],
  },
  {
    name: "Sound",
    icon: Volume2,
    color: "bg-green-500",
    blocks: [
      {
        id: "load-sound",
        name: "Load Sound",
        description: "Load a sound file for later use",
        config: {
          soundUrl: { type: "text", label: "Sound URL", default: "/sounds/music.mp3", required: true },
          soundId: { type: "text", label: "Sound ID", default: "bgMusic", required: true },
        },
      },
      {
        id: "stop-sound",
        name: "Stop Sound",
        description: "Stop a playing sound",
        config: {
          soundId: { type: "text", label: "Sound ID", default: "bgMusic", required: true },
        },
      },
    ],
  },
  {
    name: "UI",
    icon: Monitor,
    color: "bg-orange-500",
    blocks: [
      {
        id: "open-popup",
        name: "Open Popup",
        description: "Display a popup with buttons",
        config: {
          targetObject: { type: "text", label: "Target Object", default: "popupZone", required: true },
          message: { type: "textarea", label: "Popup Message", default: "Welcome to this area!", required: true },
          buttons: {
            type: "textarea",
            label: "Button Config (JSON)",
            default: '[{"label": "OK", "className": "primary"}]',
          },
        },
      },
      {
        id: "display-bubble",
        name: "Display Bubble",
        description: "Show a speech bubble above player",
        config: {
          message: { type: "text", label: "Bubble Message", default: "Hello!", required: true },
          targetPlayer: { type: "text", label: "Target Player (optional)", default: "" },
        },
      },
      {
        id: "add-action-message",
        name: "Add Action Message",
        description: "Add an action message to a layer",
        config: {
          layerName: { type: "text", label: "Layer Name", default: "actionLayer", required: true },
          message: { type: "text", label: "Action Message", default: "Press SPACE to interact", required: true },
        },
      },
      {
        id: "remove-action-message",
        name: "Remove Action Message",
        description: "Remove action message from a layer",
        config: {
          layerName: { type: "text", label: "Layer Name", default: "actionLayer", required: true },
        },
      },
    ],
  },
  {
    name: "Player",
    icon: Gamepad2,
    color: "bg-red-500",
    blocks: [
      {
        id: "get-player-name",
        name: "Get Player Name",
        description: "Retrieve the current player's name",
        config: {
          storeInVariable: { type: "text", label: "Store in Variable", default: "playerName" },
        },
      },
      {
        id: "get-player-id",
        name: "Get Player ID",
        description: "Retrieve the current player's ID",
        config: {
          storeInVariable: { type: "text", label: "Store in Variable", default: "playerId" },
        },
      },
      {
        id: "get-player-position",
        name: "Get Player Position",
        description: "Get current player coordinates",
        config: {
          storeXInVariable: { type: "text", label: "Store X in Variable", default: "playerX" },
          storeYInVariable: { type: "text", label: "Store Y in Variable", default: "playerY" },
        },
      },
    ],
  },
  {
    name: "Spaces",
    icon: Users,
    color: "bg-indigo-500",
    blocks: [
      {
        id: "join-space",
        name: "Join Space",
        description: "Join or create a named space",
        config: {
          spaceName: { type: "text", label: "Space Name", default: "meetingRoom", required: true },
          filterType: { type: "select", label: "Filter Type", default: "everyone", options: ["everyone", "streaming"] },
        },
      },
      {
        id: "leave-space",
        name: "Leave Space",
        description: "Leave a space",
        config: {
          spaceName: { type: "text", label: "Space Name", default: "meetingRoom", required: true },
        },
      },
      {
        id: "start-streaming",
        name: "Start Streaming",
        description: "Start audio/video streaming in space",
        config: {
          spaceName: { type: "text", label: "Space Name", default: "meetingRoom", required: true },
        },
      },
      {
        id: "stop-streaming",
        name: "Stop Streaming",
        description: "Stop audio/video streaming in space",
        config: {
          spaceName: { type: "text", label: "Space Name", default: "meetingRoom", required: true },
        },
      },
    ],
  },
  {
    name: "Conditions",
    icon: Code,
    color: "bg-chart-3",
    blocks: [
      {
        id: "if-condition",
        name: "If Condition",
        description: "Execute blocks based on condition",
        config: {
          variable: { type: "text", label: "Variable Name", default: "playerScore", required: true },
          operator: {
            type: "select",
            label: "Operator",
            default: "equals",
            options: ["equals", "greater", "less", "contains"],
          },
          value: { type: "text", label: "Compare Value", default: "10", required: true },
        },
      },
      {
        id: "variable-check",
        name: "Variable Check",
        description: "Check variable value",
        config: {
          variable: { type: "text", label: "Variable Name", default: "gameState", required: true },
        },
      },
      {
        id: "player-count",
        name: "Player Count",
        description: "Check number of players in area",
        config: {
          zoneName: { type: "text", label: "Zone Name", default: "lobby" },
          minPlayers: { type: "number", label: "Minimum Players", default: 1, min: 0 },
          maxPlayers: { type: "number", label: "Maximum Players", default: 10, min: 1 },
        },
      },
      {
        id: "has-variable",
        name: "Has Variable",
        description: "Check if a variable exists",
        config: {
          variable: { type: "text", label: "Variable Name", default: "myVariable", required: true },
        },
      },
    ],
  },
  {
    name: "Variables",
    icon: Eye,
    color: "bg-chart-4",
    blocks: [
      {
        id: "set-variable",
        name: "Set Variable",
        description: "Set a variable value",
        config: {
          variable: { type: "text", label: "Variable Name", default: "myVariable", required: true },
          value: { type: "text", label: "Value", default: "defaultValue", required: true },
          scope: { type: "select", label: "Scope", default: "room", options: ["room", "player", "global"] },
        },
      },
      {
        id: "get-variable",
        name: "Get Variable",
        description: "Retrieve variable value",
        config: {
          variable: { type: "text", label: "Variable Name", default: "myVariable", required: true },
          scope: { type: "select", label: "Scope", default: "room", options: ["room", "player", "global"] },
        },
      },
      {
        id: "increment",
        name: "Increment",
        description: "Increase variable by amount",
        config: {
          variable: { type: "text", label: "Variable Name", default: "counter", required: true },
          amount: { type: "number", label: "Increment Amount", default: 1, required: true },
          scope: { type: "select", label: "Scope", default: "room", options: ["room", "player", "global"] },
        },
      },
      {
        id: "save-variable",
        name: "Save Variable",
        description: "Save variable to persistent state",
        config: {
          variable: { type: "text", label: "Variable Name", default: "persistentVar", required: true },
          value: { type: "text", label: "Value", default: "savedValue", required: true },
        },
      },
      {
        id: "load-variable",
        name: "Load Variable",
        description: "Load variable from persistent state",
        config: {
          variable: { type: "text", label: "Variable Name", default: "persistentVar", required: true },
        },
      },
    ],
  },
  {
    name: "WorkAdventure",
    icon: MapPin,
    color: "bg-chart-5",
    blocks: [
      {
        id: "door",
        name: "Door",
        description: "Create interactive door",
        config: {
          doorName: { type: "text", label: "Door Name", default: "mainDoor", required: true },
          targetRoom: { type: "text", label: "Target Room URL", default: "/maps/nextRoom.json", required: true },
          x: { type: "number", label: "Target X", default: 100 },
          y: { type: "number", label: "Target Y", default: 100 },
        },
      },
      {
        id: "bell",
        name: "Bell",
        description: "Add notification bell",
        config: {
          bellName: { type: "text", label: "Bell Name", default: "notificationBell", required: true },
          message: { type: "text", label: "Notification Message", default: "You have a notification!" },
          sound: { type: "text", label: "Sound URL", default: "/sounds/bell.mp3" },
        },
      },
      {
        id: "generic-action",
        name: "Generic Action",
        description: "Custom action layer",
        config: {
          layerName: { type: "text", label: "Layer Name", default: "actionLayer", required: true },
          actionType: {
            type: "select",
            label: "Action Type",
            default: "message",
            options: ["message", "teleport", "website", "sound"],
          },
          customCode: { type: "textarea", label: "Custom Code", default: "// Your custom action code here" },
        },
      },
    ],
  },
]

interface BlockLibraryProps {
  onBlockSelect: (block: any) => void
}

export function BlockLibrary({ onBlockSelect }: BlockLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = blockCategories
    .map((category) => ({
      ...category,
      blocks: category.blocks.filter(
        (block) =>
          block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => (selectedCategory ? category.name === selectedCategory : category.blocks.length > 0))

  const handleDragStart = (e: React.DragEvent, block: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(block))
    e.dataTransfer.effectAllowed = "copy"
    onBlockSelect(block)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {blockCategories.map((category) => (
            <Badge
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1 rounded ${category.color}`}>
                  <category.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-sidebar-foreground">{category.name}</h3>
              </div>

              <div className="space-y-2">
                {category.blocks.map((block) => (
                  <Card
                    key={block.id}
                    className="cursor-grab hover:bg-accent/50 transition-colors active:cursor-grabbing"
                    onClick={() => onBlockSelect(block)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, block)}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm">{block.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{block.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

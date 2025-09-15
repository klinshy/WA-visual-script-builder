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
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-room#entering-leaving-zones",
  },
  onLeaveZone: {
    title: "On Leave Zone",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [{ name: "zoneName", label: "Zone Name", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-room#entering-leaving-zones",
  },
  onEnterArea: {
    title: "On Enter Area",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [{ name: "areaName", label: "Area Name", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-room#entering-leaving-areas",
  },
  onLeaveArea: {
    title: "On Leave Area",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [{ name: "areaName", label: "Area Name", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-room#entering-leaving-areas",
  },
  onPlayerJoin: {
    title: "On Player Join",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-players#onplayerjoin",
  },
  onPlayerLeave: {
    title: "On Player Leave",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-players#onplayerleave",
  },
  onChatMessage: {
    title: "On Chat Message",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [
      { name: "message", label: "Message Contains", type: "text" },
      { name: "scope", label: "Scope", type: "select", options: ["local", "bubble"] },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-chat#onchatmessage",
  },
  onPlayerMove: {
    title: "On Player Move",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-player#onplayermove",
  },
  onCameraUpdate: {
    title: "On Camera Update",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-camera#oncameraupdate",
  },
  onVariableChange: {
    title: "On Variable Change",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [{ name: "variableName", label: "Variable Name", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-state#onvariablechange",
  },
  onEvent: {
    title: "On Event",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [{ name: "eventName", label: "Event Name", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-event#onevent",
  },
  onProximityMeetingJoin: {
    title: "On Meeting Join",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-spaces#onproximitymeetingjoin",
  },
  onProximityMeetingLeave: {
    title: "On Meeting Leave",
    color: "bg-green-500",
    ports: [{ id: "output", type: "output", label: "Next", dataType: "flow" }],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-spaces#onproximitymeetingleave",
  },

  // Chat Actions
  sendChatMessage: {
    title: "Send Chat Message",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "message", label: "Message", type: "text" },
      { name: "scope", label: "Scope", type: "select", options: ["local", "bubble"] },
      { name: "author", label: "Author", type: "text" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-chat#sendchatmessage",
  },
  openChat: {
    title: "Open Chat",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-chat#openchat",
  },
  closeChat: {
    title: "Close Chat",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-chat#closechat",
  },
  startTyping: {
    title: "Start Typing",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "scope", label: "Scope", type: "select", options: ["local", "bubble"] },
      { name: "author", label: "Author", type: "text" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-chat#starttyping",
  },
  stopTyping: {
    title: "Stop Typing",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "scope", label: "Scope", type: "select", options: ["local", "bubble"] }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-chat#stoptyping",
  },

  // Camera Actions
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
      { name: "width", label: "Width", type: "number" },
      { name: "height", label: "Height", type: "number" },
      { name: "lock", label: "Lock Camera", type: "checkbox" },
      { name: "smooth", label: "Smooth Transition", type: "checkbox" },
      { name: "duration", label: "Duration (ms)", type: "number" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-camera#movecamera",
  },
  followPlayer: {
    title: "Follow Player",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "smooth", label: "Smooth Transition", type: "checkbox" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-camera#followplayer",
  },

  // Player Actions
  movePlayer: {
    title: "Move Player",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "x", label: "X Position", type: "number" },
      { name: "y", label: "Y Position", type: "number" },
      { name: "speed", label: "Speed", type: "number" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-player#moveto",
  },
  teleportPlayer: {
    title: "Teleport Player",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "x", label: "X Position", type: "number" },
      { name: "y", label: "Y Position", type: "number" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-player#teleport",
  },
  setPlayerOutline: {
    title: "Set Player Outline",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "red", label: "Red (0-255)", type: "number" },
      { name: "green", label: "Green (0-255)", type: "number" },
      { name: "blue", label: "Blue (0-255)", type: "number" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-player#setoutlinecolor",
  },
  removePlayerOutline: {
    title: "Remove Player Outline",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-player#removeoutlinecolor",
  },

  // Sound Actions
  playSound: {
    title: "Play Sound",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "soundUrl", label: "Sound URL", type: "text" },
      { name: "volume", label: "Volume (0-1)", type: "number" },
      { name: "loop", label: "Loop", type: "checkbox" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-sound#playsound",
  },
  stopSound: {
    title: "Stop Sound",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "soundUrl", label: "Sound URL", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-sound#stopsound",
  },

  // UI Actions
  openPopup: {
    title: "Open Popup",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "targetObject", label: "Target Object", type: "text" },
      { name: "message", label: "Message", type: "text" },
      { name: "buttonLabel", label: "Button Label", type: "text" },
      {
        name: "buttonClass",
        label: "Button Class",
        type: "select",
        options: ["normal", "primary", "success", "warning", "error", "disabled"],
      },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-ui#openpopup",
  },
  displayActionMessage: {
    title: "Display Action Message",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "message", label: "Message", type: "text" },
      { name: "type", label: "Type", type: "select", options: ["message", "warning"] },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-ui#displayactionmessage",
  },
  openModal: {
    title: "Open Modal",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "src", label: "Source URL", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "position", label: "Position", type: "select", options: ["center", "left", "right"] },
      { name: "allowApi", label: "Allow API", type: "checkbox" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-ui#openmodal",
  },
  closeModal: {
    title: "Close Modal",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-ui#closemodal",
  },
  openWebsite: {
    title: "Open Website",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "url", label: "URL", type: "text" },
      {
        name: "position",
        label: "Position",
        type: "select",
        options: [
          "top-left",
          "top-middle",
          "top-right",
          "middle-left",
          "middle-middle",
          "middle-right",
          "bottom-left",
          "bottom-middle",
          "bottom-right",
        ],
      },
      { name: "width", label: "Width", type: "text" },
      { name: "height", label: "Height", type: "text" },
      { name: "allowApi", label: "Allow API", type: "checkbox" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-ui#openwebsite",
  },
  addActionButton: {
    title: "Add Action Button",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "id", label: "Button ID", type: "text" },
      { name: "label", label: "Label", type: "text" },
      { name: "imageSrc", label: "Image URL", type: "text" },
      { name: "toolTip", label: "Tooltip", type: "text" },
      { name: "bgColor", label: "Background Color", type: "text" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-ui#addactionbutton",
  },
  removeActionButton: {
    title: "Remove Action Button",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "id", label: "Button ID", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-ui#removeactionbutton",
  },

  // Navigation Actions
  goToRoom: {
    title: "Go To Room",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "url", label: "Room URL", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-nav#gotoroom",
  },
  openTab: {
    title: "Open Tab",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "url", label: "URL", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-nav#opentab",
  },
  goToPage: {
    title: "Go To Page",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "url", label: "URL", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-nav#gotopage",
  },

  // Room Actions
  showLayer: {
    title: "Show Layer",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "layerName", label: "Layer Name", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-room#showlayer",
  },
  hideLayer: {
    title: "Hide Layer",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "layerName", label: "Layer Name", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-room#hidelayer",
  },
  setLayerProperty: {
    title: "Set Layer Property",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "layerName", label: "Layer Name", type: "text" },
      { name: "propertyName", label: "Property Name", type: "text" },
      { name: "propertyValue", label: "Property Value", type: "text" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-room#setlayerproperty",
  },
  setTiles: {
    title: "Set Tiles",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "x", label: "X Position", type: "number" },
      { name: "y", label: "Y Position", type: "number" },
      { name: "tile", label: "Tile ID/Name", type: "text" },
      { name: "layer", label: "Layer Name", type: "text" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-room#settiles",
  },

  // Controls Actions
  disablePlayerControls: {
    title: "Disable Player Controls",
    color: "bg-red-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-controls#disableplayercontrols",
  },
  restorePlayerControls: {
    title: "Restore Player Controls",
    color: "bg-red-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-controls#restoreplayercontrols",
  },
  disableWebcam: {
    title: "Disable Webcam",
    color: "bg-red-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-controls#disablewebcam",
  },
  restoreWebcam: {
    title: "Restore Webcam",
    color: "bg-red-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-controls#restorewebcam",
  },
  disableMicrophone: {
    title: "Disable Microphone",
    color: "bg-red-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-controls#disablemicrophone",
  },
  restoreMicrophone: {
    title: "Restore Microphone",
    color: "bg-red-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-controls#restoremicrophone",
  },

  // Event Actions
  broadcastEvent: {
    title: "Broadcast Event",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "eventName", label: "Event Name", type: "text" },
      { name: "data", label: "Data", type: "text" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-event#broadcastevent",
  },

  // Spaces Actions
  joinSpace: {
    title: "Join Space",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "spaceName", label: "Space Name", type: "text" },
      { name: "filterType", label: "Filter Type", type: "select", options: ["everyone", "streaming"] },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-spaces#joinspace",
  },
  leaveSpace: {
    title: "Leave Space",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-spaces#leavespace",
  },
  startStreaming: {
    title: "Start Streaming",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-spaces#startstreaming",
  },
  stopStreaming: {
    title: "Stop Streaming",
    color: "bg-blue-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-spaces#stopstreaming",
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
        options: [
          "player.name === value",
          "variable === value",
          "player.position.x > value",
          "player.tags.includes(value)",
        ],
      },
      { name: "value", label: "Value", type: "text" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-player#getting-player-information",
  },
  delay: {
    title: "Wait/Delay",
    color: "bg-orange-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "duration", label: "Duration (ms)", type: "number" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-start#settimeout",
  },
  loop: {
    title: "Loop",
    color: "bg-purple-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "body", type: "output", label: "Loop Body", dataType: "flow" },
      { id: "output", type: "output", label: "After Loop", dataType: "flow" },
    ],
    fields: [{ name: "count", label: "Loop Count", type: "number" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-start#setinterval",
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
      { name: "scope", label: "Scope", type: "select", options: ["room", "world"] },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-state#setvariable",
  },
  getVariable: {
    title: "Get Variable",
    color: "bg-yellow-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [{ name: "variableName", label: "Variable Name", type: "text" }],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-state#getvariable",
  },
  setPlayerVariable: {
    title: "Set Player Variable",
    color: "bg-yellow-500",
    ports: [
      { id: "input", type: "input", label: "Execute", dataType: "flow" },
      { id: "output", type: "output", label: "Next", dataType: "flow" },
    ],
    fields: [
      { name: "variableName", label: "Variable Name", type: "text" },
      { name: "value", label: "Value", type: "text" },
      { name: "public", label: "Public", type: "checkbox" },
    ],
    docUrl: "https://docs.workadventu.re/developer/map-scripting/references/api-player#setplayervariable",
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
            <div className="flex items-center gap-1">
              {blockType.docUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(blockType.docUrl, "_blank")
                  }}
                  className="text-white hover:text-blue-200 text-sm font-bold w-5 h-5 rounded-full border border-white flex items-center justify-center"
                  title="View Documentation"
                >
                  ?
                </button>
              )}
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
        // Triggers
        case "onEnterZone":
          code += `${indentStr}WA.room.onEnterLayer('${block.data.zoneName || "zone"}').subscribe(() => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onLeaveZone":
          code += `${indentStr}WA.room.onLeaveLayer('${block.data.zoneName || "zone"}').subscribe(() => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onEnterArea":
          code += `${indentStr}WA.room.area.onEnter('${block.data.areaName || "area"}').subscribe(() => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onLeaveArea":
          code += `${indentStr}WA.room.area.onLeave('${block.data.areaName || "area"}').subscribe(() => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onPlayerJoin":
          code += `${indentStr}WA.players.onPlayerEnters.subscribe((player) => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onPlayerLeave":
          code += `${indentStr}WA.players.onPlayerLeaves.subscribe((player) => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onChatMessage":
          const scope = block.data.scope || "local"
          code += `${indentStr}WA.chat.onChatMessage((message, event) => {\n`
          if (block.data.message) {
            code += `${indentStr}    if (message.includes('${block.data.message}')) {\n`
            code += generateConnectedBlocks(block, indent + 2)
            code += `${indentStr}    }\n`
          } else {
            code += generateConnectedBlocks(block, indent + 1)
          }
          code += `${indentStr}}, { scope: '${scope}' });\n`
          break

        case "onPlayerMove":
          code += `${indentStr}WA.player.onPlayerMove((event) => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onCameraUpdate":
          code += `${indentStr}WA.camera.onCameraUpdate().subscribe((worldView) => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onVariableChange":
          code += `${indentStr}WA.state.onVariableChange('${block.data.variableName || "variable"}').subscribe((value) => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onEvent":
          code += `${indentStr}WA.event.on('${block.data.eventName || "event"}').subscribe((event) => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onProximityMeetingJoin":
          code += `${indentStr}WA.player.proximityMeeting.onJoin().subscribe((players) => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        case "onProximityMeetingLeave":
          code += `${indentStr}WA.player.proximityMeeting.onLeave().subscribe(() => {\n`
          code += generateConnectedBlocks(block, indent + 1)
          code += `${indentStr}});\n`
          break

        // Chat Actions
        case "sendChatMessage":
          const chatScope = block.data.scope || "local"
          const author = block.data.author || "System"
          if (chatScope === "local") {
            code += `${indentStr}WA.chat.sendChatMessage('${block.data.message || "Hello!"}', { scope: 'local', author: '${author}' });\n`
          } else {
            code += `${indentStr}WA.chat.sendChatMessage('${block.data.message || "Hello!"}', { scope: 'bubble' });\n`
          }
          code += generateConnectedBlocks(block, indent)
          break

        case "openChat":
          code += `${indentStr}WA.chat.open();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "closeChat":
          code += `${indentStr}WA.chat.close();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "startTyping":
          const typingScope = block.data.scope || "local"
          const typingAuthor = block.data.author || "System"
          if (typingScope === "local") {
            code += `${indentStr}WA.chat.startTyping({ scope: 'local', author: '${typingAuthor}' });\n`
          } else {
            code += `${indentStr}WA.chat.startTyping({ scope: 'bubble' });\n`
          }
          code += generateConnectedBlocks(block, indent)
          break

        case "stopTyping":
          const stopTypingScope = block.data.scope || "local"
          code += `${indentStr}WA.chat.stopTyping({ scope: '${stopTypingScope}' });\n`
          code += generateConnectedBlocks(block, indent)
          break

        // Camera Actions
        case "moveCamera":
          const x = block.data.x || 0
          const y = block.data.y || 0
          const width = block.data.width ? `, ${block.data.width}` : ""
          const height = block.data.height ? `, ${block.data.height}` : ""
          const lock = block.data.lock ? ", true" : ", false"
          const smooth = block.data.smooth ? ", true" : ", false"
          const duration = block.data.duration ? `, ${block.data.duration}` : ""
          code += `${indentStr}WA.camera.set(${x}, ${y}${width}${height}${lock}${smooth}${duration});\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "followPlayer":
          const followSmooth = block.data.smooth ? "true" : "false"
          code += `${indentStr}WA.camera.followPlayer(${followSmooth});\n`
          code += generateConnectedBlocks(block, indent)
          break

        // Player Actions
        case "movePlayer":
          code += `${indentStr}WA.player.moveTo(${block.data.x || 0}, ${block.data.y || 0}, ${block.data.speed || 10});\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "teleportPlayer":
          code += `${indentStr}WA.player.teleport(${block.data.x || 0}, ${block.data.y || 0});\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "setPlayerOutline":
          code += `${indentStr}WA.player.setOutlineColor(${block.data.red || 255}, ${block.data.green || 0}, ${block.data.blue || 0});\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "removePlayerOutline":
          code += `${indentStr}WA.player.removeOutlineColor();\n`
          code += generateConnectedBlocks(block, indent)
          break

        // Sound Actions
        case "playSound":
          const volume = block.data.volume
            ? `, { volume: ${block.data.volume}, loop: ${block.data.loop || false} }`
            : ""
          code += `${indentStr}WA.sound.loadSound('${block.data.soundUrl || ""}').play(${volume});\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "stopSound":
          code += `${indentStr}WA.sound.loadSound('${block.data.soundUrl || ""}').stop();\n`
          code += generateConnectedBlocks(block, indent)
          break

        // UI Actions
        case "openPopup":
          code += `${indentStr}WA.ui.openPopup('${block.data.targetObject || "popup"}', '${block.data.message || "Hello!"}', [{\n`
          code += `${indentStr}    label: '${block.data.buttonLabel || "OK"}',\n`
          code += `${indentStr}    className: '${block.data.buttonClass || "primary"}',\n`
          code += `${indentStr}    callback: (popup) => popup.close()\n`
          code += `${indentStr}}]);\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "displayActionMessage":
          code += `${indentStr}WA.ui.displayActionMessage({\n`
          code += `${indentStr}    message: '${block.data.message || "Press space to continue"}',\n`
          code += `${indentStr}    type: '${block.data.type || "message"}',\n`
          code += `${indentStr}    callback: () => {\n`
          code += generateConnectedBlocks(block, indent + 2)
          code += `${indentStr}    }\n`
          code += `${indentStr}});\n`
          break

        case "openModal":
          code += `${indentStr}WA.ui.modal.openModal({\n`
          code += `${indentStr}    src: '${block.data.src || ""}',\n`
          code += `${indentStr}    title: '${block.data.title || "Modal"}',\n`
          code += `${indentStr}    position: '${block.data.position || "center"}',\n`
          code += `${indentStr}    allowApi: ${block.data.allowApi || false}\n`
          code += `${indentStr}});\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "closeModal":
          code += `${indentStr}WA.ui.modal.closeModal();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "openWebsite":
          const position = block.data.position || "middle-middle"
          const [vertical, horizontal] = position.split("-")
          code += `${indentStr}WA.ui.website.open({\n`
          code += `${indentStr}    url: '${block.data.url || ""}',\n`
          code += `${indentStr}    position: { vertical: '${vertical}', horizontal: '${horizontal}' },\n`
          code += `${indentStr}    size: { width: '${block.data.width || "50vw"}', height: '${block.data.height || "50vh"}' },\n`
          code += `${indentStr}    allowApi: ${block.data.allowApi || false}\n`
          code += `${indentStr}});\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "addActionButton":
          code += `${indentStr}WA.ui.actionBar.addButton({\n`
          code += `${indentStr}    id: '${block.data.id || "button"}',\n`
          code += `${indentStr}    label: '${block.data.label || "Button"}',\n`
          code += `${indentStr}    imageSrc: '${block.data.imageSrc || ""}',\n`
          code += `${indentStr}    toolTip: '${block.data.toolTip || ""}',\n`
          code += `${indentStr}    bgColor: '${block.data.bgColor || ""}',\n`
          code += `${indentStr}    clickCallback: (event) => {\n`
          code += generateConnectedBlocks(block, indent + 2)
          code += `${indentStr}    }\n`
          code += `${indentStr}});\n`
          break

        case "removeActionButton":
          code += `${indentStr}WA.ui.actionBar.removeButton('${block.data.id || "button"}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        // Navigation Actions
        case "goToRoom":
          code += `${indentStr}WA.nav.goToRoom('${block.data.url || ""}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "openTab":
          code += `${indentStr}WA.nav.openTab('${block.data.url || ""}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "goToPage":
          code += `${indentStr}WA.nav.goToPage('${block.data.url || ""}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        // Room Actions
        case "showLayer":
          code += `${indentStr}WA.room.showLayer('${block.data.layerName || "layer"}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "hideLayer":
          code += `${indentStr}WA.room.hideLayer('${block.data.layerName || "layer"}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "setLayerProperty":
          code += `${indentStr}WA.room.setProperty('${block.data.layerName || "layer"}', '${block.data.propertyName || "property"}', '${block.data.propertyValue || ""}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "setTiles":
          code += `${indentStr}WA.room.setTiles([{\n`
          code += `${indentStr}    x: ${block.data.x || 0},\n`
          code += `${indentStr}    y: ${block.data.y || 0},\n`
          code += `${indentStr}    tile: '${block.data.tile || ""}',\n`
          code += `${indentStr}    layer: '${block.data.layer || ""}'\n`
          code += `${indentStr}}]);\n`
          code += generateConnectedBlocks(block, indent)
          break

        // Controls Actions
        case "disablePlayerControls":
          code += `${indentStr}WA.controls.disablePlayerControls();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "restorePlayerControls":
          code += `${indentStr}WA.controls.restorePlayerControls();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "disableWebcam":
          code += `${indentStr}WA.controls.disableWebcam();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "restoreWebcam":
          code += `${indentStr}WA.controls.restoreWebcam();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "disableMicrophone":
          code += `${indentStr}WA.controls.disableMicrophone();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "restoreMicrophone":
          code += `${indentStr}WA.controls.restoreMicrophone();\n`
          code += generateConnectedBlocks(block, indent)
          break

        // Event Actions
        case "broadcastEvent":
          code += `${indentStr}WA.event.broadcast('${block.data.eventName || "event"}', '${block.data.data || ""}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        // Spaces Actions
        case "joinSpace":
          code += `${indentStr}const space = WA.spaces.joinSpace('${block.data.spaceName || "space"}', '${block.data.filterType || "everyone"}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "leaveSpace":
          code += `${indentStr}space.leave();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "startStreaming":
          code += `${indentStr}space.startStreaming();\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "stopStreaming":
          code += `${indentStr}space.stopStreaming();\n`
          code += generateConnectedBlocks(block, indent)
          break

        // Control Flow
        case "ifCondition":
          const condition = block.data.condition || "player.name === value"
          const value = block.data.value || ""
          let conditionCode = condition.replace("value", `'${value}'`)
          if (condition.includes("player.name")) {
            conditionCode = `WA.player.name === '${value}'`
          } else if (condition.includes("player.tags")) {
            conditionCode = `WA.player.tags.includes('${value}')`
          } else if (condition.includes("player.position.x")) {
            conditionCode = `(await WA.player.getPosition()).x > ${value}`
          }
          code += `${indentStr}if (${conditionCode}) {\n`
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

        case "loop":
          code += `${indentStr}for (let i = 0; i < ${block.data.count || 1}; i++) {\n`
          code += generateConnectedBlocks(block, indent + 1, "body")
          code += `${indentStr}}\n`
          code += generateConnectedBlocks(block, indent, "output")
          break

        // Variables
        case "setVariable":
          code += `${indentStr}WA.state.saveVariable('${block.data.variableName || "variable"}', '${block.data.value || ""}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "getVariable":
          code += `${indentStr}const ${block.data.variableName || "variable"} = WA.state.loadVariable('${block.data.variableName || "variable"}');\n`
          code += generateConnectedBlocks(block, indent)
          break

        case "setPlayerVariable":
          const isPublic = block.data.public || false
          const persist = block.data.persist !== false
          const playerScope = block.data.scope || "world"
          code += `${indentStr}WA.player.state.saveVariable('${block.data.variableName || "variable"}', '${block.data.value || ""}', {\n`
          code += `${indentStr}    public: ${isPublic},\n`
          code += `${indentStr}    persist: ${persist},\n`
          code += `${indentStr}    scope: '${playerScope}'\n`
          code += `${indentStr}});\n`
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
            <h4 className="text-sm font-medium text-gray-600 mb-2">Chat & UI</h4>
            {Object.entries(BLOCK_TYPES)
              .filter(([_, type]) => type.color === "bg-blue-500")
              .slice(0, 15)
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
            <h4 className="text-sm font-medium text-gray-600 mb-2">Player & Camera</h4>
            {Object.entries(BLOCK_TYPES)
              .filter(([_, type]) => type.color === "bg-blue-500")
              .slice(15, 25)
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
            <h4 className="text-sm font-medium text-gray-600 mb-2">Room & Navigation</h4>
            {Object.entries(BLOCK_TYPES)
              .filter(([_, type]) => type.color === "bg-blue-500")
              .slice(25)
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
            <h4 className="text-sm font-medium text-gray-600 mb-2">Controls</h4>
            {Object.entries(BLOCK_TYPES)
              .filter(([_, type]) => type.color === "bg-red-500")
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

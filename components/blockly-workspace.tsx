"use client"

import { useEffect, useRef, useState } from "react"
import * as Blockly from "blockly/core"
import { javascriptGenerator } from "blockly/javascript"
import "blockly/blocks"

const defineWorkAdventureBlocks = () => {
  // Trigger blocks
  Blockly.Blocks["wa_player_enters"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("when player enters zone")
        .appendField(new Blockly.FieldTextInput("myZone"), "ZONE_NAME")
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("Triggered when player enters a specific area")
      this.setHelpUrl("")
    },
  }

  Blockly.Blocks["wa_player_leaves"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("when player leaves zone")
        .appendField(new Blockly.FieldTextInput("myZone"), "ZONE_NAME")
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("Triggered when player leaves a specific area")
    },
  }

  Blockly.Blocks["wa_on_init"] = {
    init: function () {
      this.appendDummyInput().appendField("when script starts")
      this.setNextStatement(true, null)
      this.setColour(120)
      this.setTooltip("Triggered when the script initializes")
    },
  }

  // Action blocks
  Blockly.Blocks["wa_show_message"] = {
    init: function () {
      this.appendDummyInput().appendField("show message").appendField(new Blockly.FieldTextInput("Hello!"), "MESSAGE")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip("Display a message to the player")
    },
  }

  Blockly.Blocks["wa_send_chat"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("send chat message")
        .appendField(new Blockly.FieldTextInput("Hello everyone!"), "MESSAGE")
        .appendField("from")
        .appendField(new Blockly.FieldTextInput("Bot"), "AUTHOR")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(160)
      this.setTooltip("Send a message to the chat")
    },
  }

  Blockly.Blocks["wa_play_sound"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("play sound")
        .appendField(new Blockly.FieldTextInput("/sounds/notification.mp3"), "SOUND_URL")
        .appendField("volume")
        .appendField(new Blockly.FieldNumber(0.5, 0, 1, 0.1), "VOLUME")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(200)
      this.setTooltip("Play an audio file")
    },
  }

  Blockly.Blocks["wa_move_player"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("move player to x:")
        .appendField(new Blockly.FieldNumber(100), "X")
        .appendField("y:")
        .appendField(new Blockly.FieldNumber(100), "Y")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip("Teleport player to specific location")
    },
  }

  Blockly.Blocks["wa_open_popup"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("open popup")
        .appendField(new Blockly.FieldTextInput("popupZone"), "TARGET")
        .appendField("message")
        .appendField(new Blockly.FieldTextInput("Welcome!"), "MESSAGE")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(290)
      this.setTooltip("Display a popup with buttons")
    },
  }

  // Variable blocks
  Blockly.Blocks["wa_set_variable"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("set variable")
        .appendField(new Blockly.FieldTextInput("myVar"), "VAR_NAME")
        .appendField("to")
        .appendField(new Blockly.FieldTextInput("value"), "VALUE")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(330)
      this.setTooltip("Set a variable value")
    },
  }

  Blockly.Blocks["wa_get_variable"] = {
    init: function () {
      this.appendDummyInput().appendField("get variable").appendField(new Blockly.FieldTextInput("myVar"), "VAR_NAME")
      this.setOutput(true, "String")
      this.setColour(330)
      this.setTooltip("Get a variable value")
    },
  }
}

const defineWorkAdventureGenerators = () => {
  // Add reserved words
  javascriptGenerator.addReservedWords("WA,console")

  // Trigger generators
  javascriptGenerator.forBlock["wa_player_enters"] = (block) => {
    const zoneName = block.getFieldValue("ZONE_NAME")
    const code = `WA.room.onEnterLayer("${zoneName}").subscribe(() => {\n  console.log("Player entered ${zoneName}");\n});\n`
    return code
  }

  javascriptGenerator.forBlock["wa_player_leaves"] = (block) => {
    const zoneName = block.getFieldValue("ZONE_NAME")
    const code = `WA.room.onLeaveLayer("${zoneName}").subscribe(() => {\n  console.log("Player left ${zoneName}");\n});\n`
    return code
  }

  javascriptGenerator.forBlock["wa_on_init"] = (block) => {
    const code = `WA.onInit().then(() => {\n  console.log("Script initialized");\n});\n`
    return code
  }

  // Action generators
  javascriptGenerator.forBlock["wa_show_message"] = (block) => {
    const message = block.getFieldValue("MESSAGE")
    const code = `WA.ui.displayActionMessage("${message}", () => {});\n`
    return code
  }

  javascriptGenerator.forBlock["wa_send_chat"] = (block) => {
    const message = block.getFieldValue("MESSAGE")
    const author = block.getFieldValue("AUTHOR")
    const code = `WA.chat.sendChatMessage("${message}", "${author}");\n`
    return code
  }

  javascriptGenerator.forBlock["wa_play_sound"] = (block) => {
    const soundUrl = block.getFieldValue("SOUND_URL")
    const volume = block.getFieldValue("VOLUME")
    const code = `WA.sound.loadSound("${soundUrl}").then((sound) => {\n  sound.play({ volume: ${volume} });\n});\n`
    return code
  }

  javascriptGenerator.forBlock["wa_move_player"] = (block) => {
    const x = block.getFieldValue("X")
    const y = block.getFieldValue("Y")
    const code = `WA.player.moveTo(${x}, ${y});\n`
    return code
  }

  javascriptGenerator.forBlock["wa_open_popup"] = (block) => {
    const target = block.getFieldValue("TARGET")
    const message = block.getFieldValue("MESSAGE")
    const code = `WA.ui.openPopup("${target}", "${message}", [{ label: "Close", className: "primary", callback: (popup) => popup.close() }]);\n`
    return code
  }

  // Variable generators
  javascriptGenerator.forBlock["wa_set_variable"] = (block) => {
    const varName = block.getFieldValue("VAR_NAME")
    const value = block.getFieldValue("VALUE")
    const code = `WA.state.saveVariable("${varName}", "${value}");\n`
    return code
  }

  javascriptGenerator.forBlock["wa_get_variable"] = (block) => {
    const varName = block.getFieldValue("VAR_NAME")
    const code = `WA.state.loadVariable("${varName}")`
    return [code, javascriptGenerator.ORDER_FUNCTION_CALL]
  }
}

interface BlocklyWorkspaceProps {
  onCodeChange: (code: string) => void
}

export function BlocklyWorkspace({ onCodeChange }: BlocklyWorkspaceProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null)
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (blocklyDiv.current && !isInitialized) {
      defineWorkAdventureBlocks()
      defineWorkAdventureGenerators()

      // Create simplified toolbox
      const toolbox = {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "Triggers",
            colour: "120",
            contents: [
              { kind: "block", type: "wa_player_enters" },
              { kind: "block", type: "wa_player_leaves" },
              { kind: "block", type: "wa_on_init" },
            ],
          },
          {
            kind: "category",
            name: "Actions",
            colour: "230",
            contents: [
              { kind: "block", type: "wa_show_message" },
              { kind: "block", type: "wa_move_player" },
              { kind: "block", type: "wa_play_sound" },
              { kind: "block", type: "wa_open_popup" },
            ],
          },
          {
            kind: "category",
            name: "Chat",
            colour: "160",
            contents: [{ kind: "block", type: "wa_send_chat" }],
          },
          {
            kind: "category",
            name: "Variables",
            colour: "330",
            contents: [
              { kind: "block", type: "wa_set_variable" },
              { kind: "block", type: "wa_get_variable" },
            ],
          },
        ],
      }

      // Initialize Blockly workspace
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        grid: {
          spacing: 20,
          length: 3,
          colour: "#ccc",
          snap: true,
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        trashcan: true,
        scrollbars: true,
        theme: Blockly.Themes.Modern,
      })

      workspace.current.addChangeListener((event) => {
        if (workspace.current && event.type !== Blockly.Events.UI) {
          try {
            const code = javascriptGenerator.workspaceToCode(workspace.current)
            onCodeChange(code)
          } catch (error) {
            console.error("Error generating code:", error)
            onCodeChange("// Error generating code from blocks")
          }
        }
      })

      setTimeout(() => {
        if (workspace.current) {
          try {
            // Create an init block
            const initBlock = workspace.current.newBlock("wa_on_init")
            initBlock.initSvg()
            initBlock.render()
            initBlock.moveBy(50, 50)

            // Create a message block
            const messageBlock = workspace.current.newBlock("wa_show_message")
            messageBlock.initSvg()
            messageBlock.render()
            messageBlock.moveBy(50, 150)
            messageBlock.setFieldValue("Welcome to WorkAdventure!", "MESSAGE")

            // Connect the blocks
            if (initBlock.nextConnection && messageBlock.previousConnection) {
              initBlock.nextConnection.connect(messageBlock.previousConnection)
            }

            // Generate initial code
            const code = javascriptGenerator.workspaceToCode(workspace.current)
            onCodeChange(code)
          } catch (error) {
            console.log("Could not create example blocks:", error)
            // Fallback to empty workspace
            onCodeChange("// Drag blocks from the toolbox to start building your script")
          }
        }
      }, 500)

      setIsInitialized(true)
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose()
        workspace.current = null
        setIsInitialized(false)
      }
    }
  }, [isInitialized, onCodeChange])

  return <div ref={blocklyDiv} className="w-full h-full" style={{ minHeight: "400px" }} />
}

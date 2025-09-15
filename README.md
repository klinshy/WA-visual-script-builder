# WorkAdventure Visual Script Builder

A comprehensive drag-and-drop visual programming interface for creating WorkAdventure map scripts without coding. This tool transforms complex TypeScript scripting into an intuitive block-based system similar to Scratch.

## 🚀 Live Demo

**[Try it here: https://wa-script-builder.vercel.app/](https://wa-script-builder.vercel.app/)**

⚠️ **Note: This is a quick experiment - bugs included!** This is a proof-of-concept built to explore visual programming for WorkAdventure. Expect rough edges and incomplete features.

## Features

- **Visual Canvas**: Drag and drop blocks onto a canvas and connect them with visual lines
- **Complete API Coverage**: 60+ blocks covering all WorkAdventure APIs (chat, camera, player controls, UI, navigation, rooms, spaces, events, variables, and more)
- **Control Flow**: If/then logic, loops, and conditional statements with visual connections
- **Real-time Code Generation**: Automatically generates clean TypeScript code as you build
- **Interactive Properties**: Edit block parameters directly in the visual interface
- **Professional Output**: Generates production-ready WorkAdventure scripts

## What it does

Perfect for map creators who want to add interactive features like custom chat commands, camera controls, player interactions, UI elements, and complex game mechanics without writing code. Makes WorkAdventure scripting accessible to designers and non-programmers while still generating professional-quality TypeScript output.

## Key Components & Tech Stack

### Core Technologies
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Component library

### Custom Visual Programming Engine
- **Drag & Drop System** - Custom implementation for block manipulation
- **Visual Connections** - SVG-based connection lines between blocks
- **Real-time Code Generation** - TypeScript AST generation from visual blocks
- **Block Categories** - Organized by WorkAdventure API domains

### WorkAdventure API Integration
- **Complete API Coverage** - All 15 WorkAdventure API modules
- **Type-safe Blocks** - Each block generates proper TypeScript
- **Parameter Validation** - Input validation for all block parameters
- **Code Templates** - Pre-built patterns for common use cases

### Supported WorkAdventure APIs
- UI (modals, banners, action messages)
- State (variables, storage)
- Chat (messages, commands)
- Camera (movement, focus, zoom)
- Player (movement, properties, wearables)
- Players (multiplayer interactions)
- Room (navigation, properties)
- Controls (disable/enable movement)
- Events (custom events, listeners)
- Navigation (goto room, open tabs)
- Sound (play, stop, volume control)
- Spaces (filter, proximity chat)
- Map Editor (dynamic map changes)
- Metadata (room information)

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the visual script builder.

## Contributing

This is an experimental project. Feel free to fork, experiment, and submit improvements!

## License

MIT License - see the [LICENSE](LICENSE) file for details.

This project is open source and available under the MIT License, allowing free use, modification, and distribution.

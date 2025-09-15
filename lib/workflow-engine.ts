export interface WorkflowBlock {
  id: string
  name: string
  description: string
  position: { x: number; y: number }
  config?: any
  userConfig?: any
  connections?: string[]
}

export interface Connection {
  id: string
  fromBlockId: string
  toBlockId: string
  fromPort: "output" | "success" | "failure"
  toPort: "input"
}

export class WorkflowEngine {
  private blocks: WorkflowBlock[]
  private connections: Connection[]

  constructor(blocks: WorkflowBlock[], connections: Connection[]) {
    this.blocks = blocks
    this.connections = connections
  }

  // Find all blocks that should execute after a given block
  getNextBlocks(blockId: string, port = "output"): WorkflowBlock[] {
    const nextConnections = this.connections.filter((conn) => conn.fromBlockId === blockId && conn.fromPort === port)
    return nextConnections
      .map((conn) => this.blocks.find((block) => block.id === conn.toBlockId))
      .filter(Boolean) as WorkflowBlock[]
  }

  // Find all blocks that execute before a given block
  getPreviousBlocks(blockId: string): WorkflowBlock[] {
    const prevConnections = this.connections.filter((conn) => conn.toBlockId === blockId)
    return prevConnections
      .map((conn) => this.blocks.find((block) => block.id === conn.fromBlockId))
      .filter(Boolean) as WorkflowBlock[]
  }

  // Get the execution order of blocks starting from triggers
  getExecutionOrder(): WorkflowBlock[][] {
    const triggerBlocks = this.blocks.filter((block) => this.isTriggerBlock(block))
    const executionPaths: WorkflowBlock[][] = []

    for (const trigger of triggerBlocks) {
      const path = this.getExecutionPath(trigger.id)
      if (path.length > 0) {
        executionPaths.push(path)
      }
    }

    return executionPaths
  }

  // Get the full execution path starting from a specific block
  private getExecutionPath(startBlockId: string, visited: Set<string> = new Set()): WorkflowBlock[] {
    if (visited.has(startBlockId)) {
      return [] // Prevent infinite loops
    }

    visited.add(startBlockId)
    const startBlock = this.blocks.find((block) => block.id === startBlockId)
    if (!startBlock) return []

    const path = [startBlock]
    const nextBlocks = this.getNextBlocks(startBlockId)

    for (const nextBlock of nextBlocks) {
      const subPath = this.getExecutionPath(nextBlock.id, new Set(visited))
      path.push(...subPath)
    }

    return path
  }

  // Check if a block is a trigger (has no incoming connections)
  private isTriggerBlock(block: WorkflowBlock): boolean {
    const blockType = block.id.split("-")[0]
    return ["player", "timer"].includes(blockType) && this.getPreviousBlocks(block.id).length === 0
  }

  // Validate the workflow for common issues
  validateWorkflow(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check for orphaned blocks (no connections)
    const connectedBlockIds = new Set([
      ...this.connections.map((c) => c.fromBlockId),
      ...this.connections.map((c) => c.toBlockId),
    ])

    const orphanedBlocks = this.blocks.filter((block) => !connectedBlockIds.has(block.id) && this.blocks.length > 1)

    if (orphanedBlocks.length > 0) {
      errors.push(`Found ${orphanedBlocks.length} disconnected blocks`)
    }

    // Check for missing required configurations
    for (const block of this.blocks) {
      if (block.config) {
        for (const [key, field] of Object.entries(block.config)) {
          const fieldConfig = field as any
          if (fieldConfig.required) {
            const userValue = block.userConfig?.[key]
            if (!userValue && userValue !== 0 && userValue !== false) {
              errors.push(`Block "${block.name}" is missing required field: ${fieldConfig.label}`)
            }
          }
        }
      }
    }

    // Check for circular dependencies
    const hasCycles = this.detectCycles()
    if (hasCycles) {
      errors.push("Workflow contains circular dependencies")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Detect circular dependencies in the workflow
  private detectCycles(): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycleDFS = (blockId: string): boolean => {
      visited.add(blockId)
      recursionStack.add(blockId)

      const nextBlocks = this.getNextBlocks(blockId)
      for (const nextBlock of nextBlocks) {
        if (!visited.has(nextBlock.id)) {
          if (hasCycleDFS(nextBlock.id)) {
            return true
          }
        } else if (recursionStack.has(nextBlock.id)) {
          return true
        }
      }

      recursionStack.delete(blockId)
      return false
    }

    for (const block of this.blocks) {
      if (!visited.has(block.id)) {
        if (hasCycleDFS(block.id)) {
          return true
        }
      }
    }

    return false
  }

  // Get workflow statistics
  getWorkflowStats() {
    const triggerCount = this.blocks.filter((block) => this.isTriggerBlock(block)).length
    const actionCount = this.blocks.filter(
      (block) =>
        block.id.includes("show-message") || block.id.includes("move-player") || block.id.includes("play-sound"),
    ).length
    const conditionCount = this.blocks.filter(
      (block) => block.id.includes("if-condition") || block.id.includes("variable-check"),
    ).length

    return {
      totalBlocks: this.blocks.length,
      totalConnections: this.connections.length,
      triggerBlocks: triggerCount,
      actionBlocks: actionCount,
      conditionBlocks: conditionCount,
      executionPaths: this.getExecutionOrder().length,
    }
  }
}

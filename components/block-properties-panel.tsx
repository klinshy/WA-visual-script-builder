"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Settings } from "lucide-react"

interface BlockPropertiesPanelProps {
  selectedBlock: any
  onBlockUpdate: (blockId: string, config: any) => void
  onClose: () => void
}

export function BlockPropertiesPanel({ selectedBlock, onBlockUpdate, onClose }: BlockPropertiesPanelProps) {
  const [config, setConfig] = useState<any>({})

  useEffect(() => {
    if (selectedBlock?.config) {
      // Initialize config with default values
      const initialConfig: any = {}
      Object.entries(selectedBlock.config).forEach(([key, field]: [string, any]) => {
        initialConfig[key] = selectedBlock.userConfig?.[key] ?? field.default
      })
      setConfig(initialConfig)
    }
  }, [selectedBlock])

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onBlockUpdate(selectedBlock.id, newConfig)
  }

  const renderConfigField = (key: string, field: any) => {
    const value = config[key] ?? field.default

    switch (field.type) {
      case "text":
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={key}
              value={value}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              placeholder={field.default}
              required={field.required}
            />
          </div>
        )

      case "textarea":
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={key}
              value={value}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              placeholder={field.default}
              rows={3}
              required={field.required}
            />
          </div>
        )

      case "number":
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={key}
              type="number"
              value={value}
              onChange={(e) => handleConfigChange(key, Number.parseFloat(e.target.value) || 0)}
              min={field.min}
              max={field.max}
              step={field.step}
              required={field.required}
            />
          </div>
        )

      case "boolean":
        return (
          <div key={key} className="flex items-center justify-between py-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {field.label}
            </Label>
            <Switch id={key} checked={value} onCheckedChange={(checked) => handleConfigChange(key, checked)} />
          </div>
        )

      case "select":
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(newValue) => handleConfigChange(key, newValue)}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "color":
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">
              {field.label}
            </Label>
            <div className="flex gap-2">
              <Input
                id={key}
                type="color"
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!selectedBlock) return null

  return (
    <Card className="w-80 h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <CardTitle className="text-lg">Block Properties</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">Block Info</h3>
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium">{selectedBlock.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{selectedBlock.description}</p>
          </div>
        </div>

        {selectedBlock.config && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Configuration</h3>
            {Object.entries(selectedBlock.config).map(([key, field]) => renderConfigField(key, field))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

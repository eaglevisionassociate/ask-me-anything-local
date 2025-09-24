import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Line } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Minus, 
  MousePointer, 
  Eraser, 
  RotateCcw, 
  Palette,
  Save
} from "lucide-react";

interface DrawingPadProps {
  onSave?: (dataURL: string) => void;
  height?: number;
  width?: number;
}

export const DrawingPad = ({ onSave, height = 400, width = 600 }: DrawingPadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rectangle" | "circle" | "line" | "erase">("draw");
  const [brushSize, setBrushSize] = useState(2);

  const colors = [
    "#000000", "#ff0000", "#00ff00", "#0000ff", 
    "#ffff00", "#ff00ff", "#00ffff", "#ffa500"
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: "#ffffff",
    });

    // Initialize the freeDrawingBrush right after canvas creation
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }

    if (activeTool === "erase") {
      fabricCanvas.isDrawingMode = true;
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = "#ffffff";
        fabricCanvas.freeDrawingBrush.width = brushSize * 2;
      }
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 50,
        top: 50,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 2,
        width: 100,
        height: 80,
      });
      fabricCanvas?.add(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 50,
        top: 50,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: 2,
        radius: 50,
      });
      fabricCanvas?.add(circle);
    } else if (tool === "line") {
      const line = new Line([50, 50, 150, 50], {
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas?.add(line);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
  };

  const handleSave = () => {
    if (!fabricCanvas || !onSave) return;
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    onSave(dataURL);
  };

  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "draw", icon: Pencil, label: "Draw" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: CircleIcon, label: "Circle" },
    { id: "erase", icon: Eraser, label: "Eraser" },
  ] as const;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pencil className="w-5 h-5" />
          Drawing Pad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleToolClick(tool.id as typeof activeTool)}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
          
          <Separator orientation="vertical" className="h-8" />
          
          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-6">{brushSize}</span>
          </div>
          
          <Separator orientation="vertical" className="h-8" />
          
          {/* Clear and Save */}
          <Button variant="outline" size="sm" onClick={handleClear}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          {onSave && (
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  activeColor === color ? "border-gray-400" : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setActiveColor(color)}
              />
            ))}
          </div>
          <input
            type="color"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value)}
            className="w-8 h-6 rounded border border-gray-200"
          />
        </div>

        {/* Canvas */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>
        
        <div className="text-xs text-muted-foreground">
          Use the tools above to draw geometric shapes, diagrams, or solve problems visually.
        </div>
      </CardContent>
    </Card>
  );
};
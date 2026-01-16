import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Line, Triangle, Polygon, Ellipse, FabricText } from "fabric";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Minus, 
  MousePointer, 
  Eraser, 
  RotateCcw, 
  Palette,
  Save,
  Triangle as TriangleIcon,
  Pentagon,
  Star,
  ArrowRight,
  Type,
  Move,
  Undo2,
  Trash2,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface KidDrawingPadProps {
  onSave?: (dataURL: string) => void;
  height?: number;
  width?: number;
  subject?: string;
}

export const KidDrawingPad = ({ onSave, height = 350, width, subject }: KidDrawingPadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const [activeTool, setActiveTool] = useState<string>("draw");
  const [brushSize, setBrushSize] = useState(4);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Kid-friendly vibrant colors
  const colors = [
    { color: "#ef4444", emoji: "🔴" }, // Red
    { color: "#f97316", emoji: "🟠" }, // Orange
    { color: "#eab308", emoji: "🟡" }, // Yellow
    { color: "#22c55e", emoji: "🟢" }, // Green
    { color: "#3b82f6", emoji: "🔵" }, // Blue
    { color: "#8b5cf6", emoji: "🟣" }, // Purple
    { color: "#ec4899", emoji: "💗" }, // Pink
    { color: "#000000", emoji: "⚫" }, // Black
  ];

  // Pre-made shapes for kids - easy to add and edit
  const shapes = [
    { id: "rectangle", label: "📦 Box", icon: Square },
    { id: "circle", label: "⚪ Circle", icon: CircleIcon },
    { id: "triangle", label: "🔺 Triangle", icon: TriangleIcon },
    { id: "line", label: "➖ Line", icon: Minus },
    { id: "arrow", label: "➡️ Arrow", icon: ArrowRight },
    { id: "star", label: "⭐ Star", icon: Star },
    { id: "oval", label: "🥚 Oval", icon: CircleIcon },
    { id: "pentagon", label: "⬠ Pentagon", icon: Pentagon },
  ];

  // Tools for drawing
  const tools = [
    { id: "select", label: "👆 Select", icon: MousePointer, description: "Tap to move things" },
    { id: "draw", label: "✏️ Draw", icon: Pencil, description: "Draw freely" },
    { id: "erase", label: "🧹 Eraser", icon: Eraser, description: "Erase mistakes" },
    { id: "text", label: "Aa Text", icon: Type, description: "Add words" },
  ];

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 400;
    const canvasWidth = width || Math.min(containerWidth - 16, 500);

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: height,
      backgroundColor: "#ffffff",
    });

    canvas.isDrawingMode = true;
    
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = brushSize;
    }

    // Save initial state
    const initialState = canvas.toJSON();
    setHistory([JSON.stringify(initialState)]);
    setHistoryIndex(0);

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    if (!fabricCanvas || !fabricCanvas.freeDrawingBrush) return;

    fabricCanvas.isDrawingMode = activeTool === "draw" || activeTool === "erase";
    
    if (activeTool === "draw") {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    } else if (activeTool === "erase") {
      fabricCanvas.freeDrawingBrush.color = "#ffffff";
      fabricCanvas.freeDrawingBrush.width = brushSize * 3;
    } else if (activeTool === "select") {
      fabricCanvas.isDrawingMode = false;
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const saveToHistory = () => {
    if (!fabricCanvas) return;
    const json = JSON.stringify(fabricCanvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (!fabricCanvas || historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    fabricCanvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const addShape = (shapeId: string) => {
    if (!fabricCanvas) return;

    const centerX = (fabricCanvas.width || 300) / 2 - 40;
    const centerY = (fabricCanvas.height || 200) / 2 - 40;

    let shape;
    
    switch (shapeId) {
      case "rectangle":
        shape = new Rect({
          left: centerX,
          top: centerY,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: 3,
          width: 80,
          height: 60,
          rx: 5,
          ry: 5,
        });
        break;
      case "circle":
        shape = new Circle({
          left: centerX,
          top: centerY,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: 3,
          radius: 40,
        });
        break;
      case "triangle":
        shape = new Triangle({
          left: centerX,
          top: centerY,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: 3,
          width: 80,
          height: 70,
        });
        break;
      case "line":
        shape = new Line([0, 0, 100, 0], {
          left: centerX,
          top: centerY,
          stroke: activeColor,
          strokeWidth: 3,
        });
        break;
      case "arrow":
        // Create arrow as a group of lines
        const arrowLine = new Line([0, 20, 80, 20], {
          stroke: activeColor,
          strokeWidth: 3,
        });
        const arrowHead1 = new Line([60, 5, 80, 20], {
          stroke: activeColor,
          strokeWidth: 3,
        });
        const arrowHead2 = new Line([60, 35, 80, 20], {
          stroke: activeColor,
          strokeWidth: 3,
        });
        fabricCanvas.add(arrowLine, arrowHead1, arrowHead2);
        arrowLine.set({ left: centerX, top: centerY });
        arrowHead1.set({ left: centerX + 60, top: centerY - 15 });
        arrowHead2.set({ left: centerX + 60, top: centerY + 15 });
        fabricCanvas.renderAll();
        saveToHistory();
        return;
      case "star":
        const points = [];
        const outerRadius = 40;
        const innerRadius = 20;
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
          });
        }
        shape = new Polygon(points, {
          left: centerX,
          top: centerY,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: 3,
        });
        break;
      case "oval":
        shape = new Ellipse({
          left: centerX,
          top: centerY,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: 3,
          rx: 50,
          ry: 30,
        });
        break;
      case "pentagon":
        const pentPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          pentPoints.push({
            x: 35 * Math.cos(angle),
            y: 35 * Math.sin(angle),
          });
        }
        shape = new Polygon(pentPoints, {
          left: centerX,
          top: centerY,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: 3,
        });
        break;
      default:
        return;
    }

    if (shape) {
      fabricCanvas.add(shape);
      fabricCanvas.setActiveObject(shape);
      fabricCanvas.renderAll();
      saveToHistory();
      setActiveTool("select"); // Switch to select so they can move it
    }
  };

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new FabricText("Type here", {
      left: (fabricCanvas.width || 300) / 2 - 40,
      top: (fabricCanvas.height || 200) / 2,
      fontSize: 20,
      fill: activeColor,
      fontFamily: "Arial",
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    saveToHistory();
    setActiveTool("select");
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    saveToHistory();
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

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => fabricCanvas.remove(obj));
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      saveToHistory();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-4 border-2 border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-bold flex items-center justify-center gap-2">
          🎨 Drawing Pad
        </h3>
        <p className="text-xs text-muted-foreground">Draw your answer, add shapes, or sketch diagrams!</p>
      </div>

      {/* Drawing Tools Row */}
      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (tool.id === "text") {
                addText();
              } else {
                setActiveTool(tool.id);
              }
            }}
            className={`text-xs gap-1 ${activeTool === tool.id ? 'ring-2 ring-primary' : ''}`}
            title={tool.description}
          >
            <tool.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        ))}
        
        {/* Brush Size */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 border">
          <span className="text-xs">Size:</span>
          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-16"
          />
        </div>
      </div>

      {/* Shapes Row */}
      <div className="mb-3">
        <p className="text-xs text-center mb-2 font-medium">📐 Tap to add a shape:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {shapes.map((shape) => (
            <Button
              key={shape.id}
              variant="outline"
              size="sm"
              onClick={() => addShape(shape.id)}
              className="text-xs bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900"
            >
              {shape.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-xs font-medium">🎨 Colors:</span>
        <div className="flex gap-1">
          {colors.map((c) => (
            <button
              key={c.color}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                activeColor === c.color ? "border-gray-800 scale-110 ring-2 ring-offset-2 ring-primary" : "border-gray-300"
              }`}
              style={{ backgroundColor: c.color }}
              onClick={() => setActiveColor(c.color)}
              title={c.emoji}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="border-4 border-dashed border-blue-300 dark:border-blue-700 rounded-xl overflow-hidden bg-white mx-auto"
        style={{ maxWidth: '100%' }}
      >
        <canvas ref={canvasRef} className="max-w-full" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="gap-1"
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={deleteSelected}
          className="gap-1 text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          Clear All
        </Button>
        {onSave && (
          <Button
            size="sm"
            onClick={handleSave}
            className="gap-1 bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4" />
            Save Drawing
          </Button>
        )}
      </div>

      {/* Tips */}
      <div className="text-xs text-center text-muted-foreground mt-3 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
        💡 <strong>Tips:</strong> Tap a shape to add it • Use "Select" to move things • Pick colors before adding shapes
      </div>
    </div>
  );
};

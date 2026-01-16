import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Line, Triangle, Polygon, Ellipse, FabricText, Group } from "fabric";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Minus, 
  MousePointer, 
  Eraser, 
  RotateCcw, 
  Save,
  Triangle as TriangleIcon,
  Pentagon,
  Star,
  ArrowRight,
  Type,
  Undo2,
  Trash2,
  Grid3X3,
  Box,
  Cylinder,
  Ruler,
  PaintBucket
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
  const [showGrid, setShowGrid] = useState(false);
  const [fillShapes, setFillShapes] = useState(false);
  const [rulerStart, setRulerStart] = useState<{ x: number; y: number } | null>(null);
  const [rulerLine, setRulerLine] = useState<Line | null>(null);
  const [rulerLabel, setRulerLabel] = useState<FabricText | null>(null);

  // Kid-friendly vibrant colors
  const colors = [
    { color: "#ef4444", emoji: "🔴" },
    { color: "#f97316", emoji: "🟠" },
    { color: "#eab308", emoji: "🟡" },
    { color: "#22c55e", emoji: "🟢" },
    { color: "#3b82f6", emoji: "🔵" },
    { color: "#8b5cf6", emoji: "🟣" },
    { color: "#ec4899", emoji: "💗" },
    { color: "#000000", emoji: "⚫" },
  ];

  // 2D shapes
  const shapes2D = [
    { id: "rectangle", label: "📦 Box" },
    { id: "circle", label: "⚪ Circle" },
    { id: "triangle", label: "🔺 Triangle" },
    { id: "line", label: "➖ Line" },
    { id: "arrow", label: "➡️ Arrow" },
    { id: "star", label: "⭐ Star" },
    { id: "oval", label: "🥚 Oval" },
    { id: "pentagon", label: "⬠ Pentagon" },
  ];

  // 3D shapes for geometry
  const shapes3D = [
    { id: "cube", label: "🧊 Cube" },
    { id: "cylinder", label: "🥫 Cylinder" },
    { id: "pyramid", label: "🔺 Pyramid" },
    { id: "cone", label: "🍦 Cone" },
    { id: "sphere", label: "🔮 Sphere" },
    { id: "prism", label: "📐 Prism" },
  ];

  // Tools for drawing
  const tools = [
    { id: "select", label: "👆 Select", icon: MousePointer, description: "Tap to move things" },
    { id: "draw", label: "✏️ Draw", icon: Pencil, description: "Draw freely" },
    { id: "erase", label: "🧹 Eraser", icon: Eraser, description: "Erase mistakes" },
    { id: "text", label: "Aa Text", icon: Type, description: "Add words" },
    { id: "ruler", label: "📏 Ruler", icon: Ruler, description: "Measure distances" },
  ];

  // Draw grid on canvas
  const drawGrid = (canvas: FabricCanvas, show: boolean) => {
    // Remove existing grid lines
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if ((obj as any).isGridLine) {
        canvas.remove(obj);
      }
    });

    if (show) {
      const gridSize = 25;
      const canvasWidth = canvas.width || 500;
      const canvasHeight = canvas.height || 350;

      // Draw vertical lines
      for (let x = gridSize; x < canvasWidth; x += gridSize) {
        const line = new Line([x, 0, x, canvasHeight], {
          stroke: '#e5e7eb',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        });
        (line as any).isGridLine = true;
        canvas.add(line);
        canvas.sendObjectToBack(line);
      }

      // Draw horizontal lines
      for (let y = gridSize; y < canvasHeight; y += gridSize) {
        const line = new Line([0, y, canvasWidth, y], {
          stroke: '#e5e7eb',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        });
        (line as any).isGridLine = true;
        canvas.add(line);
        canvas.sendObjectToBack(line);
      }
    }

    canvas.renderAll();
  };

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

    const initialState = canvas.toJSON();
    setHistory([JSON.stringify(initialState)]);
    setHistoryIndex(0);

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    if (!fabricCanvas) return;
    drawGrid(fabricCanvas, showGrid);
  }, [showGrid, fabricCanvas]);

  useEffect(() => {
    if (!fabricCanvas || !fabricCanvas.freeDrawingBrush) return;

    fabricCanvas.isDrawingMode = activeTool === "draw" || activeTool === "erase";
    
    if (activeTool === "draw") {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    } else if (activeTool === "erase") {
      fabricCanvas.freeDrawingBrush.color = "#ffffff";
      fabricCanvas.freeDrawingBrush.width = brushSize * 3;
    } else if (activeTool === "select" || activeTool === "ruler") {
      fabricCanvas.isDrawingMode = false;
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  // Ruler tool event handlers
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (opt: any) => {
      if (activeTool !== "ruler") return;
      const pointer = fabricCanvas.getPointer(opt.e);
      setRulerStart({ x: pointer.x, y: pointer.y });
      
      // Create temporary line
      const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: "#ef4444",
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
      });
      (line as any).isRulerLine = true;
      fabricCanvas.add(line);
      setRulerLine(line);
      
      // Create label
      const label = new FabricText("0 px", {
        left: pointer.x,
        top: pointer.y - 20,
        fontSize: 14,
        fill: "#ef4444",
        fontFamily: "Arial",
        fontWeight: "bold",
        backgroundColor: "rgba(255,255,255,0.9)",
        selectable: false,
        evented: false,
      });
      (label as any).isRulerLabel = true;
      fabricCanvas.add(label);
      setRulerLabel(label);
    };

    const handleMouseMove = (opt: any) => {
      if (activeTool !== "ruler" || !rulerStart || !rulerLine || !rulerLabel) return;
      const pointer = fabricCanvas.getPointer(opt.e);
      
      // Update line endpoint
      rulerLine.set({ x2: pointer.x, y2: pointer.y });
      
      // Calculate distance
      const dx = pointer.x - rulerStart.x;
      const dy = pointer.y - rulerStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Update label
      const midX = (rulerStart.x + pointer.x) / 2;
      const midY = (rulerStart.y + pointer.y) / 2;
      rulerLabel.set({
        left: midX,
        top: midY - 20,
        text: `${Math.round(distance)} px`,
      });
      
      fabricCanvas.renderAll();
    };

    const handleMouseUp = (opt: any) => {
      if (activeTool !== "ruler" || !rulerStart || !rulerLine || !rulerLabel) return;
      const pointer = fabricCanvas.getPointer(opt.e);
      
      // Calculate final distance
      const dx = pointer.x - rulerStart.x;
      const dy = pointer.y - rulerStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 10) {
        // Keep the measurement on canvas
        rulerLine.set({ selectable: true, evented: true });
        (rulerLine as any).isRulerLine = false;
        rulerLabel.set({ selectable: true, evented: true });
        (rulerLabel as any).isRulerLabel = false;
        
        // Add endpoint markers
        const startMarker = new Circle({
          left: rulerStart.x - 4,
          top: rulerStart.y - 4,
          radius: 4,
          fill: "#ef4444",
          selectable: false,
          evented: false,
        });
        const endMarker = new Circle({
          left: pointer.x - 4,
          top: pointer.y - 4,
          radius: 4,
          fill: "#ef4444",
          selectable: false,
          evented: false,
        });
        fabricCanvas.add(startMarker, endMarker);
        
        saveToHistory();
      } else {
        // Remove if too short
        fabricCanvas.remove(rulerLine);
        fabricCanvas.remove(rulerLabel);
      }
      
      setRulerStart(null);
      setRulerLine(null);
      setRulerLabel(null);
      fabricCanvas.renderAll();
    };

    fabricCanvas.on("mouse:down", handleMouseDown);
    fabricCanvas.on("mouse:move", handleMouseMove);
    fabricCanvas.on("mouse:up", handleMouseUp);

    return () => {
      fabricCanvas.off("mouse:down", handleMouseDown);
      fabricCanvas.off("mouse:move", handleMouseMove);
      fabricCanvas.off("mouse:up", handleMouseUp);
    };
  }, [fabricCanvas, activeTool, rulerStart, rulerLine, rulerLabel]);

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
      if (showGrid) drawGrid(fabricCanvas, true);
    });
  };

  const add3DShape = (shapeId: string) => {
    if (!fabricCanvas) return;

    const centerX = (fabricCanvas.width || 300) / 2 - 50;
    const centerY = (fabricCanvas.height || 200) / 2 - 50;
    const color = activeColor;

    switch (shapeId) {
      case "cube":
        // Draw a 3D cube (isometric view)
        const cubeSize = 60;
        const offset = 25;
        
        // Front face
        const frontFace = new Rect({
          left: centerX,
          top: centerY + offset,
          width: cubeSize,
          height: cubeSize,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
        });
        
        // Top face (parallelogram)
        const topFace = new Polygon([
          { x: 0, y: offset },
          { x: offset, y: 0 },
          { x: cubeSize + offset, y: 0 },
          { x: cubeSize, y: offset },
        ], {
          left: centerX,
          top: centerY,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
        });
        
        // Right face (parallelogram)
        const rightFace = new Polygon([
          { x: 0, y: 0 },
          { x: offset, y: -offset },
          { x: offset, y: cubeSize - offset },
          { x: 0, y: cubeSize },
        ], {
          left: centerX + cubeSize,
          top: centerY + offset,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
        });
        
        fabricCanvas.add(frontFace, topFace, rightFace);
        break;

      case "cylinder":
        // Draw a 3D cylinder
        const cylWidth = 70;
        const cylHeight = 80;
        
        // Top ellipse
        const topEllipse = new Ellipse({
          left: centerX,
          top: centerY,
          rx: cylWidth / 2,
          ry: 15,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
        });
        
        // Left side line
        const leftSide = new Line([centerX, centerY + 15, centerX, centerY + cylHeight], {
          stroke: color,
          strokeWidth: 3,
        });
        
        // Right side line
        const rightSide = new Line([centerX + cylWidth, centerY + 15, centerX + cylWidth, centerY + cylHeight], {
          stroke: color,
          strokeWidth: 3,
        });
        
        // Bottom ellipse (half visible)
        const bottomEllipse = new Ellipse({
          left: centerX,
          top: centerY + cylHeight - 15,
          rx: cylWidth / 2,
          ry: 15,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
        });
        
        fabricCanvas.add(bottomEllipse, leftSide, rightSide, topEllipse);
        break;

      case "pyramid":
        // Draw a 3D pyramid
        const pyrBase = 80;
        const pyrHeight = 70;
        
        // Front triangle face
        const frontTriangle = new Triangle({
          left: centerX + 10,
          top: centerY,
          width: pyrBase - 20,
          height: pyrHeight,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
        });
        
        // Base line
        const baseLine = new Line([centerX, centerY + pyrHeight, centerX + pyrBase, centerY + pyrHeight], {
          stroke: color,
          strokeWidth: 3,
        });
        
        // Back edge to apex
        const backEdge = new Line([centerX + pyrBase / 2, centerY, centerX + pyrBase + 15, centerY + pyrHeight - 10], {
          stroke: color,
          strokeWidth: 2,
          strokeDashArray: [5, 5], // Dashed for hidden edge
        });
        
        // Right base edge
        const rightBaseEdge = new Line([centerX + pyrBase, centerY + pyrHeight, centerX + pyrBase + 15, centerY + pyrHeight - 10], {
          stroke: color,
          strokeWidth: 3,
        });
        
        fabricCanvas.add(frontTriangle, baseLine, backEdge, rightBaseEdge);
        break;

      case "cone":
        // Draw a 3D cone
        const coneWidth = 70;
        const coneHeight = 80;
        
        // Left edge
        const coneLeft = new Line([centerX + coneWidth / 2, centerY, centerX, centerY + coneHeight], {
          stroke: color,
          strokeWidth: 3,
        });
        
        // Right edge
        const coneRight = new Line([centerX + coneWidth / 2, centerY, centerX + coneWidth, centerY + coneHeight], {
          stroke: color,
          strokeWidth: 3,
        });
        
        // Base ellipse
        const coneBase = new Ellipse({
          left: centerX,
          top: centerY + coneHeight - 15,
          rx: coneWidth / 2,
          ry: 15,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
        });
        
        fabricCanvas.add(coneBase, coneLeft, coneRight);
        break;

      case "sphere":
        // Draw a 3D sphere with cross-section lines
        const sphereRadius = 40;
        
        const sphereOutline = new Circle({
          left: centerX,
          top: centerY,
          radius: sphereRadius,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
        });
        
        // Horizontal cross-section (ellipse)
        const hCross = new Ellipse({
          left: centerX,
          top: centerY + sphereRadius - 12,
          rx: sphereRadius,
          ry: 12,
          fill: "transparent",
          stroke: color,
          strokeWidth: 2,
          strokeDashArray: [3, 3],
        });
        
        // Vertical cross-section (ellipse)
        const vCross = new Ellipse({
          left: centerX + sphereRadius - 12,
          top: centerY,
          rx: 12,
          ry: sphereRadius,
          fill: "transparent",
          stroke: color,
          strokeWidth: 2,
          strokeDashArray: [3, 3],
        });
        
        fabricCanvas.add(hCross, vCross, sphereOutline);
        break;

      case "prism":
        // Draw a triangular prism
        const prismWidth = 60;
        const prismDepth = 30;
        const prismHeight = 50;
        
        // Front triangle
        const prismFront = new Triangle({
          left: centerX,
          top: centerY + prismDepth,
          width: prismWidth,
          height: prismHeight,
          fill: "transparent",
          stroke: color,
          strokeWidth: 3,
        });
        
        // Top edge
        const prismTopEdge = new Line([
          centerX + prismWidth / 2, centerY + prismDepth,
          centerX + prismWidth / 2 + prismDepth, centerY
        ], {
          stroke: color,
          strokeWidth: 3,
        });
        
        // Right edge
        const prismRightEdge = new Line([
          centerX + prismWidth, centerY + prismDepth + prismHeight,
          centerX + prismWidth + prismDepth, centerY + prismHeight
        ], {
          stroke: color,
          strokeWidth: 3,
        });
        
        // Back triangle top
        const prismBackTop = new Line([
          centerX + prismWidth / 2 + prismDepth, centerY,
          centerX + prismWidth + prismDepth, centerY + prismHeight
        ], {
          stroke: color,
          strokeWidth: 2,
          strokeDashArray: [4, 4],
        });
        
        fabricCanvas.add(prismFront, prismTopEdge, prismRightEdge, prismBackTop);
        break;
    }

    fabricCanvas.renderAll();
    saveToHistory();
    setActiveTool("select");
  };

  const addShape = (shapeId: string) => {
    if (!fabricCanvas) return;

    const centerX = (fabricCanvas.width || 300) / 2 - 40;
    const centerY = (fabricCanvas.height || 200) / 2 - 40;
    const shapeFill = fillShapes ? activeColor + "40" : "transparent"; // 40 = 25% opacity

    let shape;
    
    switch (shapeId) {
      case "rectangle":
        shape = new Rect({
          left: centerX,
          top: centerY,
          fill: shapeFill,
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
          fill: shapeFill,
          stroke: activeColor,
          strokeWidth: 3,
          radius: 40,
        });
        break;
      case "triangle":
        shape = new Triangle({
          left: centerX,
          top: centerY,
          fill: shapeFill,
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
          fill: shapeFill,
          stroke: activeColor,
          strokeWidth: 3,
        });
        break;
      case "oval":
        shape = new Ellipse({
          left: centerX,
          top: centerY,
          fill: shapeFill,
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
          fill: shapeFill,
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
      setActiveTool("select");
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
    if (showGrid) drawGrid(fabricCanvas, true);
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
      activeObjects.forEach((obj) => {
        if (!(obj as any).isGridLine) {
          fabricCanvas.remove(obj);
        }
      });
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
        
        {/* Grid Toggle */}
        <Button
          variant={showGrid ? "default" : "outline"}
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className={`text-xs gap-1 ${showGrid ? 'ring-2 ring-green-500 bg-green-600 hover:bg-green-700' : ''}`}
          title="Show/Hide Grid"
        >
          <Grid3X3 className="w-4 h-4" />
          <span className="hidden sm:inline">Grid</span>
        </Button>
        
        {/* Fill Shapes Toggle */}
        <Button
          variant={fillShapes ? "default" : "outline"}
          size="sm"
          onClick={() => setFillShapes(!fillShapes)}
          className={`text-xs gap-1 ${fillShapes ? 'ring-2 ring-purple-500 bg-purple-600 hover:bg-purple-700' : ''}`}
          title="Fill shapes with color"
        >
          <PaintBucket className="w-4 h-4" />
          <span className="hidden sm:inline">Fill</span>
        </Button>
        
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
      
      {/* Ruler instruction when active */}
      {activeTool === "ruler" && (
        <div className="text-center mb-2">
          <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-full">
            📏 Click and drag to measure distance in pixels
          </span>
        </div>
      )}
      
      {/* Fill indicator */}
      {fillShapes && (
        <div className="text-center mb-2">
          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full inline-flex items-center gap-1">
            <PaintBucket className="w-3 h-3" /> Shapes will be filled with color
          </span>
        </div>
      )}

      {/* 2D Shapes Row */}
      <div className="mb-2">
        <p className="text-xs text-center mb-2 font-medium">📐 2D Shapes:</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {shapes2D.map((shape) => (
            <Button
              key={shape.id}
              variant="outline"
              size="sm"
              onClick={() => addShape(shape.id)}
              className="text-xs bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 h-8 px-2"
            >
              {shape.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 3D Shapes Row */}
      <div className="mb-3">
        <p className="text-xs text-center mb-2 font-medium">🧊 3D Shapes (Geometry):</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {shapes3D.map((shape) => (
            <Button
              key={shape.id}
              variant="outline"
              size="sm"
              onClick={() => add3DShape(shape.id)}
              className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 hover:from-blue-100 hover:to-purple-100 border-blue-300 h-8 px-2"
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
        className={`border-4 rounded-xl overflow-hidden bg-white mx-auto ${
          showGrid ? 'border-green-400 dark:border-green-600' : 'border-dashed border-blue-300 dark:border-blue-700'
        }`}
        style={{ maxWidth: '100%' }}
      >
        <canvas ref={canvasRef} className="max-w-full" />
      </div>

      {/* Grid indicator */}
      {showGrid && (
        <div className="text-center mt-2">
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
            📏 Grid ON - Each square = 25px
          </span>
        </div>
      )}

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
        💡 <strong>Tips:</strong> Use 📏 Ruler to measure • Enable Fill for colored shapes • Grid for precision • 3D shapes show dashed lines for hidden edges
      </div>
    </div>
  );
};

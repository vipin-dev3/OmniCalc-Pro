import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlottedFunction, Point2D } from '../../types/graphing';
import { compileGraphFunction } from '../../utils/mathParser';
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Activity } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const PRESETS = [
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'cos(x)', expr: 'cos(x)' },
  { label: 'x² − 4', expr: 'x^2 - 4' },
  { label: 'x³ − 3x', expr: 'x^3 - 3*x' },
  { label: '1 / x', expr: '1/x' },
  { label: 'eˣ (exp)', expr: 'e^x' },
  { label: 'ln(x)', expr: 'ln(x)' },
  { label: 'Damped Oscillation', expr: 'e^(-0.2*x) * sin(2*x)' },
  { label: 'Gaussian Bell', expr: 'e^(-(x^2))' },
];

const CURVE_PALETTE = ['#f59e0b', '#38bdf8', '#10b981', '#f43f5e', '#a855f7'];

export const GraphingMode: React.FC = () => {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [functions, setFunctions] = useState<PlottedFunction[]>([
    { id: '1', expression: 'sin(x)', color: '#f59e0b', visible: true, isValid: true },
    { id: '2', expression: '0.2*x^2 - 2', color: '#38bdf8', visible: true, isValid: true },
  ]);

  // Viewport camera parameters
  const [centerX, setCenterX] = useState<number>(0);
  const [centerY, setCenterY] = useState<number>(0);
  const [scale, setScale] = useState<number>(45); // Pixels per unit

  // Cursor Inspection state
  const [hoverPoint, setHoverPoint] = useState<Point2D | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Point2D>({ x: 0, y: 0 });

  // Add function
  const addFunction = () => {
    if (functions.length >= 5) {
      showToast('Maximum 5 concurrent functions supported', 'info');
      return;
    }
    const color = CURVE_PALETTE[functions.length % CURVE_PALETTE.length];
    setFunctions((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        expression: 'x',
        color,
        visible: true,
        isValid: true,
      },
    ]);
  };

  // Update function
  const updateFunction = (id: string, updates: Partial<PlottedFunction>) => {
    setFunctions((prev) =>
      prev.map((fn) => (fn.id === id ? { ...fn, ...updates } : fn))
    );
  };

  // Remove function
  const removeFunction = (id: string) => {
    if (functions.length <= 1) {
      showToast('Must have at least one function', 'info');
      return;
    }
    setFunctions((prev) => prev.filter((fn) => fn.id !== id));
  };

  // Zoom controls
  const handleZoom = (factor: number) => {
    setScale((prev) => Math.max(8, Math.min(500, prev * factor)));
  };

  const handleReset = () => {
    setCenterX(0);
    setCenterY(0);
    setScale(45);
  };

  // Render Canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background color matching recessed instrument screen
    ctx.fillStyle = '#06080d';
    ctx.fillRect(0, 0, width, height);

    // Canvas origin (0,0 in math coordinates)
    const originCanvasX = width / 2 - centerX * scale;
    const originCanvasY = height / 2 + centerY * scale;

    // Grid spacing calculation
    let step = 1;
    if (scale < 18) step = 5;
    else if (scale < 32) step = 2;
    else if (scale > 110) step = 0.5;
    else if (scale > 220) step = 0.2;

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';

    // Vertical grid lines
    const startX = Math.floor((-originCanvasX / scale) / step) * step;
    const endX = Math.ceil(((width - originCanvasX) / scale) / step) * step;

    for (let x = startX; x <= endX; x += step) {
      const canvasX = originCanvasX + x * scale;
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-6) {
        ctx.fillText(Number(x.toFixed(2)).toString(), canvasX + 4, originCanvasY - 6);
      }
    }

    // Horizontal grid lines
    const startY = Math.floor((-originCanvasY / scale) / step) * step;
    const endY = Math.ceil(((height - originCanvasY) / scale) / step) * step;

    for (let y = startY; y <= endY; y += step) {
      const canvasY = originCanvasY - y * scale;
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        ctx.fillText(Number(y.toFixed(2)).toString(), originCanvasX + 6, canvasY - 4);
      }
    }

    // Draw Main Axes (X & Y)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originCanvasY);
    ctx.lineTo(width, originCanvasY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originCanvasX, 0);
    ctx.lineTo(originCanvasX, height);
    ctx.stroke();

    // Origin label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillText('0', originCanvasX + 4, originCanvasY - 4);

    // Plot Functions
    functions.forEach((fn) => {
      if (!fn.visible || !fn.expression.trim()) return;

      const compiled = compileGraphFunction(fn.expression);
      if (!compiled) return;

      ctx.lineWidth = 2.2;
      ctx.strokeStyle = fn.color;
      ctx.beginPath();

      let isDrawing = false;
      const stepPixel = 1.5; // Smooth subpixel step

      for (let px = 0; px <= width; px += stepPixel) {
        const mathX = (px - originCanvasX) / scale;
        const mathY = compiled(mathX);

        if (mathY !== null && isFinite(mathY)) {
          const py = originCanvasY - mathY * scale;

          if (py >= -height && py <= height * 2) {
            if (!isDrawing) {
              ctx.moveTo(px, py);
              isDrawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      }
      ctx.stroke();
    });

    // Draw Crosshair and Cursor Inspection
    if (hoverPoint) {
      const hoverCanvasX = originCanvasX + hoverPoint.x * scale;
      const hoverCanvasY = originCanvasY - hoverPoint.y * scale;

      // Crosshairs
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';

      ctx.beginPath();
      ctx.moveTo(hoverCanvasX, 0);
      ctx.lineTo(hoverCanvasX, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, hoverCanvasY);
      ctx.lineTo(width, hoverCanvasY);
      ctx.stroke();

      ctx.setLineDash([]); // Reset line dash

      // Inspection Marker
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hoverCanvasX, hoverCanvasY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Tooltip Card
      const tooltipX = Math.min(width - 150, Math.max(10, hoverCanvasX + 15));
      const tooltipY = Math.min(height - 65, Math.max(20, hoverCanvasY - 20));

      ctx.fillStyle = 'rgba(10, 14, 22, 0.92)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, 130, 46, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`x: ${hoverPoint.x.toFixed(3)}`, tooltipX + 8, tooltipY + 17);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`y: ${hoverPoint.y.toFixed(3)}`, tooltipX + 8, tooltipY + 34);
    }
  }, [centerX, centerY, scale, functions, hoverPoint]);

  // Handle responsive canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      drawGraph();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawGraph]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Mouse Interaction: Pan and Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      setCenterX((prev) => prev - dx);
      setCenterY((prev) => prev + dy);
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    // Inspect Point
    const mathX = (clientX - rect.width / 2) / scale + centerX;
    const mathY = -(clientY - rect.height / 2) / scale + centerY;
    setHoverPoint({ x: mathX, y: mathY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    handleZoom(factor);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 flex flex-col gap-3 font-mono">
      {/* Outer Hardware Chassis */}
      <div className="hardware-chassis p-4 md:p-6 rounded-3xl space-y-4">
        {/* Function Inputs & Presets Ribbon */}
        <div className="p-4 rounded-2xl bg-[var(--key-function)] border border-[var(--border-color)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Plotted Mathematical Functions
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Presets Dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    updateFunction(functions[0].id, { expression: e.target.value });
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="p-1.5 rounded-lg bg-[var(--key-default)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              >
                <option value="" disabled>
                  Load Formula Preset...
                </option>
                {PRESETS.map((p) => (
                  <option key={p.label} value={p.expr}>
                    {p.label} ({p.expr})
                  </option>
                ))}
              </select>

              <button
                onClick={addFunction}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--key-action)] text-[var(--key-action-text)] text-xs font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Curve</span>
              </button>
            </div>
          </div>

          {/* Dynamic Function Input Rows */}
          <div className="space-y-2">
            {functions.map((fn, index) => (
              <div
                key={fn.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-[var(--key-default)] border border-[var(--border-color)]"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: fn.color }}
                />
                <span className="text-xs font-bold text-[var(--text-muted)] w-14">
                  f{index + 1}(x) =
                </span>
                <input
                  type="text"
                  value={fn.expression}
                  onChange={(e) => updateFunction(fn.id, { expression: e.target.value })}
                  placeholder="e.g. sin(x), x^2, e^x"
                  className="flex-1 bg-transparent text-sm text-[var(--text-primary)] font-bold focus:outline-none"
                />

                {/* Visible Toggle */}
                <button
                  onClick={() => updateFunction(fn.id, { visible: !fn.visible })}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  title={fn.visible ? 'Hide Curve' : 'Show Curve'}
                >
                  {fn.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-40" />}
                </button>

                {/* Remove */}
                {functions.length > 1 && (
                  <button
                    onClick={() => removeFunction(fn.id)}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-rose-400"
                    title="Remove function"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Oscilloscope Plotter Canvas Viewport */}
        <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl bg-[#06080d]">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="w-full h-[400px] md:h-[460px] cursor-crosshair block"
          />

          {/* Floating On-Canvas Workstation HUD */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
            <button
              onClick={() => handleZoom(1.2)}
              title="Zoom In (+)"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              title="Zoom Out (−)"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View to Origin (0,0)"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Telemetry HUD */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-400">
            <span>SCALE: {scale.toFixed(1)} px/unit</span>
            <span>•</span>
            <span>CENTER: ({centerX.toFixed(2)}, {centerY.toFixed(2)})</span>
            <span>•</span>
            <span className="hidden sm:inline">Drag to pan • Scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

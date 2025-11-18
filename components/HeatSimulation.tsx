import React, { useRef, useEffect, useCallback, useState } from 'react';
import { SimulationConfig, SimulationStats, ColorMap } from '../types';
import { PALETTES } from '../constants';
import { interpolateRgb } from 'd3-interpolate';

interface HeatSimulationProps {
  isRunning: boolean;
  config: SimulationConfig;
  colorMap: ColorMap;
  onStatsUpdate: (stats: SimulationStats) => void;
  resetTrigger: number;
}

const HeatSimulation: React.FC<HeatSimulationProps> = ({
  isRunning,
  config,
  colorMap,
  onStatsUpdate,
  resetTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics State (Refs for performance - avoids React render cycle)
  const gridRef = useRef<Float32Array>(new Float32Array(0));
  const nextGridRef = useRef<Float32Array>(new Float32Array(0));
  const iterationCountRef = useRef(0);
  const reqIdRef = useRef<number | null>(null);
  const lutRef = useRef<Uint8ClampedArray>(new Uint8ClampedArray(256 * 4));

  // Initialize or Resize Grid
  const initGrid = useCallback(() => {
    const size = config.resolution * config.resolution;
    if (gridRef.current.length !== size) {
      gridRef.current = new Float32Array(size);
      nextGridRef.current = new Float32Array(size);
    } else {
      // Just clear if same size
      gridRef.current.fill(0);
      nextGridRef.current.fill(0);
    }
    iterationCountRef.current = 0;
  }, [config.resolution]);

  // Generate Color Lookup Table (LUT) for fast rendering
  useEffect(() => {
    const colors = PALETTES[colorMap];
    const interpolator = (t: number) => {
      // Simple linear interpolation between stops
      if (t <= 0) return colors[0];
      if (t >= 1) return colors[colors.length - 1];
      
      const segmentLength = 1 / (colors.length - 1);
      const segmentIndex = Math.floor(t / segmentLength);
      const tInSegment = (t - segmentIndex * segmentLength) / segmentLength;
      
      const c1 = colors[segmentIndex];
      const c2 = colors[segmentIndex + 1] || colors[segmentIndex];
      
      return interpolateRgb(c1, c2)(tInSegment);
    };

    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      const colorStr = interpolator(t);
      // Parse rgb string 'rgb(r, g, b)'
      const match = colorStr.match(/\d+/g);
      if (match) {
        lutRef.current[i * 4 + 0] = parseInt(match[0], 10);
        lutRef.current[i * 4 + 1] = parseInt(match[1], 10);
        lutRef.current[i * 4 + 2] = parseInt(match[2], 10);
        lutRef.current[i * 4 + 3] = 255; // Alpha
      }
    }
  }, [colorMap]);

  // Handle Reset
  useEffect(() => {
    initGrid();
  }, [resetTrigger, initGrid]);

  // Physics Step
  const stepPhysics = useCallback(() => {
    const w = config.resolution;
    const h = config.resolution;
    const alpha = config.alpha;
    const damping = config.damping;
    const grid = gridRef.current;
    const nextGrid = nextGridRef.current;

    // 5-point stencil Finite Difference
    // Optimize loop by avoiding boundary checks inside the inner loop
    // We leave the 1px boundary at 0 (Dirichlet boundary condition T=0)
    for (let y = 1; y < h - 1; y++) {
      const rowOffset = y * w;
      for (let x = 1; x < w - 1; x++) {
        const i = rowOffset + x;
        
        const center = grid[i];
        const left = grid[i - 1];
        const right = grid[i + 1];
        const up = grid[i - w];
        const down = grid[i + w];

        const laplacian = left + right + up + down - 4 * center;
        
        // Heat equation: u_new = u + alpha * laplacian
        let val = center + alpha * laplacian;
        
        // Damping
        val *= damping;

        nextGrid[i] = val;
      }
    }

    // Swap buffers
    gridRef.current = nextGrid;
    nextGridRef.current = grid; // Recycle the old array
    iterationCountRef.current += 1;
  }, [config]);

  // Rendering Loop
  const renderLoop = useCallback(() => {
    if (!canvasRef.current) return;

    // Run physics multiple times per frame for speed
    if (isRunning) {
      for (let i = 0; i < config.iterationsPerFrame; i++) {
        stepPhysics();
      }
    }

    // Draw
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = config.resolution;
    const h = config.resolution;
    const grid = gridRef.current;
    const lut = lutRef.current;

    // Create ImageData
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let maxTemp = 0;
    let totalEnergy = 0;

    for (let i = 0; i < grid.length; i++) {
      let val = grid[i];
      totalEnergy += val;
      if (val > maxTemp) maxTemp = val;
      
      // Clamp 0-1
      if (val < 0) val = 0;
      if (val > 1) val = 1;

      // Map to LUT index (0-255)
      const lutIdx = Math.floor(val * 255) * 4;

      const pxIdx = i * 4;
      data[pxIdx + 0] = lut[lutIdx + 0]; // R
      data[pxIdx + 1] = lut[lutIdx + 1]; // G
      data[pxIdx + 2] = lut[lutIdx + 2]; // B
      data[pxIdx + 3] = 255;             // A
    }

    ctx.putImageData(imgData, 0, 0);

    // Update Stats periodically (every frame is too frequent for React state, but we can do it every 10th frame)
    // Or simple throttle logic
    if (iterationCountRef.current % 10 === 0) {
      onStatsUpdate({
        maxTemp,
        avgTemp: totalEnergy / grid.length,
        totalEnergy,
        iteration: iterationCountRef.current
      });
    }

    reqIdRef.current = requestAnimationFrame(renderLoop);
  }, [config, isRunning, stepPhysics, onStatsUpdate]);

  // Start/Stop Loop
  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [renderLoop]);

  // Interaction Handler
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;

    // Prevent scrolling on touch
    // e.preventDefault(); // Can't do this in passive listener, handled by style

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }

    // Calculate pos in grid coordinates
    const scaleX = config.resolution / rect.width;
    const scaleY = config.resolution / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Apply Heat
    const grid = gridRef.current;
    const w = config.resolution;
    const r = config.brushSize;
    const r2 = r * r;
    const intensity = config.brushIntensity;

    // Bounding box for optimization
    const minX = Math.max(0, Math.floor(x - r));
    const maxX = Math.min(w - 1, Math.ceil(x + r));
    const minY = Math.max(0, Math.floor(y - r));
    const maxY = Math.min(w - 1, Math.ceil(y + r));

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const dx = cx - x;
        const dy = cy - y;
        if (dx * dx + dy * dy <= r2) {
            const idx = cy * w + cx;
            // Add heat, clamp at 1.0 (or higher if we want 'super hot' that diffuses)
            // Let's just set it to intensity for 'painting', or add for 'injecting'
            // Setting ensures immediate visual feedback
            grid[idx] = Math.min(1.0, grid[idx] + intensity * 0.1); 
        }
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[600px] aspect-square bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700 cursor-crosshair touch-none"
    >
      <canvas
        ref={canvasRef}
        width={config.resolution}
        height={config.resolution}
        className="w-full h-full image-pixelated"
        style={{ imageRendering: 'pixelated' }}
        onMouseDown={(e) => {
           if (e.buttons === 1) handleInteraction(e);
        }}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleInteraction(e);
        }}
        onTouchStart={handleInteraction}
        onTouchMove={handleInteraction}
      />
    </div>
  );
};

export default HeatSimulation;
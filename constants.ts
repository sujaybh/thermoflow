import { SimulationConfig, ColorMap } from './types';

export const DEFAULT_CONFIG: SimulationConfig = {
  resolution: 150,
  alpha: 0.20, // Keep < 0.25 for stability
  iterationsPerFrame: 5,
  brushSize: 8,
  brushIntensity: 1.0,
  damping: 0.999 // Slight energy loss for realism in open systems
};

export const MAX_HISTORY_LENGTH = 50;

export const PALETTES: Record<ColorMap, string[]> = {
  [ColorMap.Magma]: ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf'],
  [ColorMap.Inferno]: ['#000004', '#420a68', '#932667', '#dd513a', '#fca50a', '#fcffa4'],
  [ColorMap.Viridis]: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'],
  [ColorMap.Ice]: ['#000000', '#001f3f', '#0074D9', '#7FDBFF', '#ffffff']
};
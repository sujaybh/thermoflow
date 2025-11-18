export interface SimulationStats {
  maxTemp: number;
  avgTemp: number;
  totalEnergy: number;
  iteration: number;
}

export interface SimulationConfig {
  resolution: number; // Grid width/height (square for simplicity)
  alpha: number; // Thermal diffusivity
  iterationsPerFrame: number; // Speed
  brushSize: number; // Radius of heat source
  brushIntensity: number; // Temperature applied
  damping: number; // Cooling factor (optional, for dissipation)
}

export enum ColorMap {
  Magma = 'Magma',
  Inferno = 'Inferno',
  Viridis = 'Viridis',
  Ice = 'Ice'
}
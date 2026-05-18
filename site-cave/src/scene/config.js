export const SCENE_CONFIG = {
  // Projector spotlight
  lightX: 0.8,
  lightY: -1.5,
  lightZ: 7.5,
  lightIntensity: 160,
  lightAngle: 0.45,
  lightPenumbra: 0.35,

  // Wall GLB
  wallX: 0,
  wallY: 0,
  wallZ: 0,
  wallScale: 0,
  wallRotX: 0,

  // Atmosphere
  ambientIntensity: 2,
  dustOpacity: 0.35,
  fogColor: "#000",
  fogDensity: 0.09,

  // Fire point light (warm fill)
  sunX: 0,
  sunY: 0,
  sunZ: 3,
  fireIntensity: 12,

  // Flame spotlight (flame-shader gobo)
  flameIntensity: 18,
  flameAngle: 0.7,
  flamePenumbra: 0.75,

  // Shadow quality
  shadowThreshold: 0.5,
  shadowSoftness: 0.18,

  // Projection blur (Gaussian softness on gobo)
  blurRadius: 1.5,

  // Temporal accumulation (ghost trails)
  accumDecay: 0.82,

  // Gobo contrast boost (> 1 punches lights/darks for more visible projection)
  goboContrast: 1.35,
};

export const SCENE_CONFIG = {
  // Projector spotlight
  lightX: 1.15,
  lightY: -4.00,
  lightZ: 5.00,
  lightIntensity: 500,
  lightAngle: 0.22,
  lightPenumbra: 0.23,

  // Wall GLB
  wallX: -1.22,
  wallY: 0.47,
  wallZ: -1.47,
  wallScale: 0.05,
  wallRotX: 0.29,

  // Atmosphere
  ambientIntensity: 0.00,
  dustOpacity: 0.00,
  fogColor: "#000000",
  fogDensity: 0.15,

  // Fire point light (warm fill)
  sunX: 1.51,
  sunY: 1.96,
  sunZ: 4.37,
  fireIntensity: 18.5,

  // Flame spotlight (flame-shader gobo)
  flameIntensity: 60.0,
  flameAngle: 1.40,
  flamePenumbra: 0.00,

  // Shadow quality
  shadowThreshold: 0.36,
  shadowSoftness: 0.18,

  // Projection blur (Gaussian softness on gobo)
  blurRadius: 1.3,

  // Temporal accumulation (ghost trails)
  accumDecay: 0.84,

  // Gobo contrast boost (> 1 punches lights/darks for more visible projection)
  goboContrast: 1.05,
};

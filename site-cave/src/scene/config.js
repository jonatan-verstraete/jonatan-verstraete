export const SCENE_CONFIG = {
  // Projector spotlight
  lightX: 0.4,
  lightY: -0.7,
  lightZ: 1.21,
  lightIntensity: 50,
  lightAngle: 0.42,
  lightPenumbra: 0.24,

  // Wall GLB
  wallX: -1.22,
  wallY: 0.47,
  wallZ: -1.47,
  wallScale: 0.05,
  wallRotX: 0.29,

  // Atmosphere
  ambientIntensity: 0.0,
  dustOpacity: 0.0,
  fogColor: '#000000',
  fogDensity: 0.15,

  // Fire point light (warm fill)
  sunX: 1.51,
  sunY: 1.96,
  sunZ: 4.37,
  fireIntensity: 18.5,

  // Flame spotlight (flame-shader gobo)
  flameIntensity: 60.0,
  flameAngle: 1.4,
  flamePenumbra: 0.0,

  // Shadow quality
  shadowThreshold: 0.36,
  shadowSoftness: 0.18,

  // Projection blur (Gaussian softness on gobo)
  blurRadius: 1.3,

  // Temporal accumulation (ghost trails)
  accumDecay: 0.84,

  // Gobo contrast boost (> 1 punches lights/darks for more visible projection)
  goboContrast: 1.05,

  cameraX: 0.5,
  cameraY: -0.4,
  cameraZ: 1.0,

  cameraRotX: 0.5,
  cameraRotY: -0.4,
  cameraRotZ: 1.0,
};

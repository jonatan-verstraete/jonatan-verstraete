import { GrassShrubs } from './GrassShrubs';
import { SoilFloor } from './SoilFloor';

// ─────────────────────────────────────────────────────────────────────────────
//  Ground — composes floor surfaces. Each surface is plug-and-play:
//  disable any layer without touching its implementation.
// ─────────────────────────────────────────────────────────────────────────────
export function Ground({
  // shared layout
  groundY = -0.5,
  groundSize = 6,

  // soil
  textureRepeat = 3,

  // feature flags
  enableGrass = true,
  enableShrubs = true,

  // grass blade options (forwarded to GrassBlades)
  grassStrands = 85000,
  heightMin = 0.04,
  heightMax = 0.08,
  windStrength = 0.01,
  windDir = [1, 0.3],
  colorRoot = '#0d1807',
  colorMid = '#2e5917',
  colorTip = '#76b833',

  // shrub options (forwarded to GrassShrubs)
  shrubCount = 350,
  shrubScaleMin = 0.25,
  shrubScaleMax = 0.95,
}) {
  return (
    <group>
      <SoilFloor groundSize={groundSize} groundY={groundY} textureRepeat={textureRepeat} />

      {/* {enableGrass && (
        <GrassBlades
          strands={grassStrands}
          groundSize={groundSize}
          groundY={groundY}
          heightMin={heightMin}
          heightMax={heightMax}
          windStrength={windStrength}
          windDir={windDir}
          colorRoot={colorRoot}
          colorMid={colorMid}
          colorTip={colorTip}
        />
      )} */}

      {enableShrubs && (
        <GrassShrubs
          count={shrubCount}
          groundSize={groundSize}
          groundY={groundY}
          scaleMin={shrubScaleMin}
          scaleMax={shrubScaleMax}
        />
      )}
    </group>
  );
}

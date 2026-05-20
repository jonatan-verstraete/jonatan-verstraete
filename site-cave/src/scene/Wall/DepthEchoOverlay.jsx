import { useRef } from "react";
import { AdditiveBlending, Matrix4, ShaderMaterial, Vector2 } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls, folder } from "leva";

const vertexShader = /* glsl */ `
uniform mat4 uProjMatrix;
varying vec4 vProjCoord;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vProjCoord = uProjMatrix * worldPos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uAccumTex;
uniform vec2 uEchoOffset;
uniform float uOpacity;
varying vec4 vProjCoord;
void main() {
  vec2 uv = (vProjCoord.xy / vProjCoord.w) * 0.5 + 0.5 + uEchoOffset;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
  vec4 echo = texture2D(uAccumTex, uv);
  gl_FragColor = vec4(echo.rgb * uOpacity, 1.0);
}
`;

export const DepthEchoOverlay = ({ spotRef, accumRef }) => {
  const mat = useRef(
    new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uAccumTex:   { value: null },
        uProjMatrix: { value: new Matrix4() },
        uEchoOffset: { value: new Vector2(0, 0) },
        uOpacity:    { value: 0.35 },
      },
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
    })
  ).current;

  const { overlayW, overlayH } = useControls({
    "Depth Echo": folder({
      overlayW: { value: 4.0, min: 1, max: 8, step: 0.1 },
      overlayH: { value: 3.0, min: 1, max: 6, step: 0.1 },
    }),
  });

  useFrame(() => {
    const spot = spotRef.current;
    const accum = accumRef.current?.current;
    if (!spot || !accum) return;
    const shadowCam = spot.shadow.camera;
    shadowCam.updateMatrixWorld();
    mat.uniforms.uProjMatrix.value.multiplyMatrices(
      shadowCam.projectionMatrix,
      shadowCam.matrixWorldInverse
    );
    mat.uniforms.uAccumTex.value = accum.texture;
  }, 0);

  return (
    <mesh
      position={[-1.22, -0.53, 0.42]}
      rotation={[0.29, Math.PI, 0]}
      material={mat}
    >
      <planeGeometry args={[overlayW, overlayH]} />
    </mesh>
  );
};

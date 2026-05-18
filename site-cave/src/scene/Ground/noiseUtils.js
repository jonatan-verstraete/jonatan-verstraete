// CPU value noise — returns [0, 1] for any (x, z) pair.
// Used once at scatter time, no per-frame cost.
export function cpuVnoise(x, z) {
  const ix = Math.floor(x),
    iz = Math.floor(z);
  const fx = x - ix,
    fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const h = (px, pz) => {
    const n = Math.sin(px * 127.1 + pz * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  return (
    h(ix, iz) * (1 - ux) * (1 - uz) +
    h(ix + 1, iz) * ux * (1 - uz) +
    h(ix, iz + 1) * (1 - ux) * uz +
    h(ix + 1, iz + 1) * ux * uz
  );
}

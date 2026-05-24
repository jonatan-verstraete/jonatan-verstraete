import { Suspense, useRef } from 'react';
import { PerformanceMonitor, StatsGl, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useAtom, useAtomValue } from 'jotai';
import { Layers, Video, VideoOff } from 'lucide-react';
import { LiveTextTile } from '@/components/LiveTextTile';
import { OracleSidebar } from '@/components/OracleSidebar';
import { OracleWidget } from '@/components/OracleWidget';
import { ProjectPicker } from '@/components/ProjectPicker';
import { SceneLoader } from '@/components/SceneLoader';
import { useCamera } from '@/hooks/useCamera';
import { Scene } from '@/scene';
import { pickerOpenAtom, selectedProjectAtom } from './store/cave';

// Configure local Draco decoder (avoids CDN dependency)
useGLTF.setDecoderPath('/draco/');

const cameraArgs = {
  position: [0.4656758094947514, -0.3863831343078484, 1.0565297821385193],
  rotation: [0.35060093165446576, 0.3924713568462487, -0.13897243777020846],
  fov: 65,
};

export const App = () => {
  const captureRef = useRef(null);
  const { videoRef, isActive, toggle } = useCamera();

  return (
    <>
      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        shadows
        camera={cameraArgs}
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
      >
        <Suspense fallback={null}>
          <StatsGl />
          <PerformanceMonitor>
            <Scene captureRef={captureRef} videoRef={videoRef} isActive={isActive} />
          </PerformanceMonitor>
        </Suspense>
      </Canvas>

      <SceneLoader />
      <CameraToggle isActive={isActive} onToggle={toggle} />
      <LiveTextTile />
      <OracleWidget />
      <OracleSidebar />
      <ProjectPickerTrigger />
      <ProjectPicker />
    </>
  );
};

function ProjectPickerTrigger() {
  const [pickerOpen, setPickerOpen] = useAtom(pickerOpenAtom);
  const selected = useAtomValue(selectedProjectAtom);

  return (
    <button
      onClick={() => setPickerOpen((v) => !v)}
      className={[
        'fixed bottom-4 left-1/2 -translate-x-1/2',
        'flex items-center gap-[6px]',
        'py-[6px] pr-[12px] pl-[10px]',
        'cursor-pointer rounded-lg font-mono',
        'backdrop-blur transition-all duration-200',
        'z-picker-trigger pointer-events-auto',
        'max-w-[50vw] overflow-hidden whitespace-nowrap',
        'text-label',
        pickerOpen
          ? 'bg-white-dim text-ink/80 border-white-mild border'
          : 'text-ink-ghost border-white-subtle hover:border-white-mild hover:text-ink-muted border bg-transparent',
      ].join(' ')}
    >
      <Layers size={12} className="shrink-0 opacity-70" />
      <span className="overflow-hidden text-ellipsis">{selected?.name ?? 'select project'}</span>
    </button>
  );
}

function CameraToggle({ isActive, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={[
        'fixed top-4 right-4',
        'flex items-center gap-2 p-2! py-[7px]',
        'cursor-pointer rounded-lg font-mono',
        'text-label backdrop-blur transition-all duration-200',
        'pointer-events-auto z-20',
        isActive
          ? 'bg-white-dim text-secondary/80 border-secondary/20 border'
          : 'text-ink-ghost border-white-subtle hover:border-white-mild hover:text-ink-muted border bg-transparent',
      ].join(' ')}
    >
      {isActive ? (
        <Video size={12} className="shrink-0" />
      ) : (
        <VideoOff size={12} className="shrink-0 opacity-60" />
      )}
      <span>{isActive ? 'Shadow on' : 'Shadow off'}</span>
    </button>
  );
}

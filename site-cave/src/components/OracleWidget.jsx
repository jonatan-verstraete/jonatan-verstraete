import { useRef } from 'react';
import { useAtom } from 'jotai';
import { Eye } from 'lucide-react';
import Draggable from 'react-draggable';
import { sidebarOpenAtom } from '../store/cave';

export const OracleWidget = () => {
  const [open, setOpen] = useAtom(sidebarOpenAtom);
  const nodeRef = useRef(null);
  const draggedRef = useRef(false);

  return (
    <Draggable
      nodeRef={nodeRef}
      onStart={() => {
        draggedRef.current = false;
      }}
      onDrag={() => {
        draggedRef.current = true;
      }}
    >
      <div
        ref={nodeRef}
        data-oracle-widget
        className="z-widget fixed bottom-6 left-6 cursor-grab active:cursor-grabbing"
      >
        {/* Barely-there rotating halo ring */}
        <div className="oracle-halo inline-flex rounded-full p-[1px]">
          <button
            onClick={() => {
              if (!draggedRef.current) setOpen((v) => !v);
            }}
            title={open ? 'Close oracle' : 'Open oracle'}
            className={[
              'relative h-10 w-10 cursor-pointer rounded-full',
              'flex items-center justify-center border-0 outline-none',
              'backdrop-blur-low',
              'transition-colors duration-500',
              open ? 'bg-primary-muted text-primary' : 'bg-overlay-high text-ink-muted',
            ].join(' ')}
            style={{
              animation: open
                ? 'glowPrimary 5s ease-in-out infinite'
                : 'glowAmber 5s ease-in-out infinite',
            }}
          >
            <Eye size={15} strokeWidth={1.3} />
          </button>
        </div>
      </div>
    </Draggable>
  );
};

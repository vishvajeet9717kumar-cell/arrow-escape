import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { ArrowTile, CubeFace, CUBE_FACES } from '../types/game';
import { ArrowTileComponent } from './ArrowTileComponent';
import { sounds } from '../utils/audio';
import { RotateCw, Sparkles, Compass } from 'lucide-react';

interface CubeBoardProps {
  faceGridSize: number;
  arrows: ArrowTile[];
  hintedArrowId: string | null;
  blockedArrowId: string | null;
  blockedCoord: { row: number; col: number; face?: CubeFace } | null;
  flyingArrowId: string | null;
  combo?: number;
  reducedMotion?: boolean;
  onTileClick: (arrow: ArrowTile) => void;
}

// Preset orientations for quick-snapping to any face
const FACE_ROTATIONS: Record<CubeFace, { rotX: number; rotY: number }> = {
  FRONT: { rotX: 0, rotY: 0 },
  RIGHT: { rotX: 0, rotY: -90 },
  BACK: { rotX: 0, rotY: 180 },
  LEFT: { rotX: 0, rotY: 90 },
  TOP: { rotX: -85, rotY: 0 },
  BOTTOM: { rotX: 85, rotY: 0 },
};

export const CubeBoard: React.FC<CubeBoardProps> = ({
  faceGridSize,
  arrows,
  hintedArrowId,
  blockedArrowId,
  blockedCoord,
  flyingArrowId,
  combo = 0,
  reducedMotion = false,
  onTileClick,
}) => {
  // 3D rotation angles in degrees (default viewing FRONT with slight tilt)
  const [rotX, setRotX] = useState<number>(-15);
  const [rotY, setRotY] = useState<number>(25);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [cubeSize, setCubeSize] = useState<number>(270);

  const dragStartRef = useRef<{ x: number; y: number; startRotX: number; startRotY: number } | null>(
    null
  );
  const dragDistRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);

  // Dynamically calculate cube dimension based on mobile viewport
  useEffect(() => {
    const updateSize = () => {
      const minDim = Math.min(window.innerWidth * 0.76, (window.innerHeight - 260) * 0.72);
      const size = Math.min(300, Math.max(220, Math.floor(minDim)));
      setCubeSize(size);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const halfSize = cubeSize / 2;

  // Determine which face is currently most facing the camera
  const currentFace = useMemo((): CubeFace => {
    // Normalize rotY into [-180, 180]
    let y = ((rotY % 360) + 360) % 360;
    if (y > 180) y -= 360;

    if (rotX < -55) return 'TOP';
    if (rotX > 55) return 'BOTTOM';

    if (y >= -45 && y <= 45) return 'FRONT';
    if (y > 45 && y <= 135) return 'LEFT';
    if (y < -45 && y >= -135) return 'RIGHT';
    return 'BACK';
  }, [rotX, rotY]);

  // Pointer drag event handlers for 360-degree rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    dragDistRef.current = 0;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotX: rotX,
      startRotY: rotY,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);
    dragDistRef.current = dist;

    if (dist > 6) {
      setIsRotating(true);
      const sensitivity = 0.55;
      const nextX = Math.max(-75, Math.min(75, dragStartRef.current.startRotX - dy * sensitivity));
      const nextY = dragStartRef.current.startRotY + dx * sensitivity;
      setRotX(nextX);
      setRotY(nextY);
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    dragStartRef.current = null;
    setTimeout(() => {
      setIsRotating(false);
    }, 50);
  };

  // Quick snap to a specific face
  const handleSnapToFace = useCallback((face: CubeFace) => {
    sounds.playCubeSwipe();
    const target = FACE_ROTATIONS[face];
    setRotX(target.rotX);
    setRotY(target.rotY);
  }, []);

  // Safe tile click that ignores drags
  const handleSafeTileClick = (arrow: ArrowTile) => {
    if (dragDistRef.current > 7 || isRotating) {
      return; // Ignore tap during drag rotation
    }
    onTileClick(arrow);
  };

  // Filter arrows per face
  const arrowsByFace = useMemo(() => {
    const map: Record<CubeFace, ArrowTile[]> = {
      FRONT: [],
      BACK: [],
      LEFT: [],
      RIGHT: [],
      TOP: [],
      BOTTOM: [],
    };
    for (const a of arrows) {
      const f = a.face || 'FRONT';
      map[f].push(a);
    }
    return map;
  }, [arrows]);

  // Grid coordinates matrix for a single face
  const faceCells = useMemo(() => {
    const cells = [];
    for (let r = 0; r < faceGridSize; r++) {
      for (let c = 0; c < faceGridSize; c++) {
        cells.push({ row: r, col: c, key: `${r}-${c}` });
      }
    }
    return cells;
  }, [faceGridSize]);

  return (
    <div className="w-full flex flex-col items-center justify-between select-none py-1 relative">
      {/* 3D Scene Viewport */}
      <div
        className="relative flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
        style={{
          width: `${cubeSize + 60}px`,
          height: `${cubeSize + 50}px`,
          perspective: '1000px',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Subtle Ambient Depth Lighting behind the Cube */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{
            background:
              combo >= 5
                ? 'radial-gradient(circle, #fbbf24 0%, transparent 70%)'
                : 'radial-gradient(circle, #10b981 0%, transparent 70%)',
          }}
        />

        {/* The 3D Cube Container */}
        <div
          className="relative transition-transform duration-75"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {CUBE_FACES.map((face: CubeFace) => {
            const faceArrows = arrowsByFace[face];
            const isFacingActive = currentFace === face;

            // Compute 3D Face Transform
            let transform = '';
            switch (face) {
              case 'FRONT':
                transform = `rotateY(0deg) translateZ(${halfSize}px)`;
                break;
              case 'BACK':
                transform = `rotateY(180deg) translateZ(${halfSize}px)`;
                break;
              case 'LEFT':
                transform = `rotateY(-90deg) translateZ(${halfSize}px)`;
                break;
              case 'RIGHT':
                transform = `rotateY(90deg) translateZ(${halfSize}px)`;
                break;
              case 'TOP':
                transform = `rotateX(90deg) translateZ(${halfSize}px)`;
                break;
              case 'BOTTOM':
                transform = `rotateX(-90deg) translateZ(${halfSize}px)`;
                break;
            }

            return (
              <div
                key={face}
                className={`absolute inset-0 rounded-2xl p-2 border-2 transition-colors duration-200 select-none
                  ${
                    isFacingActive
                      ? 'border-emerald-400/90 bg-[#12161f]/95 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                      : 'border-[#262e3d] bg-[#0e1118]/90 shadow-xl'
                  }
                `}
                style={{
                  transform,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Face Title Tag */}
                <div className="absolute top-1 left-2 text-[9px] font-black uppercase tracking-widest text-slate-400/80 pointer-events-none flex items-center gap-1">
                  <span>{face}</span>
                  <span className="text-emerald-400 text-[8px]">({faceArrows.length})</span>
                </div>

                {/* Face Grid Inner Container */}
                <div
                  className="w-full h-full pt-3"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${faceGridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${faceGridSize}, 1fr)`,
                  }}
                >
                  {/* Empty Cells */}
                  {faceCells.map((cell) => {
                    const hasArrow = faceArrows.some(
                      (a: ArrowTile) => a.row === cell.row && a.col === cell.col
                    );
                    const isBlockedTarget =
                      blockedCoord &&
                      blockedCoord.face === face &&
                      blockedCoord.row === cell.row &&
                      blockedCoord.col === cell.col;

                    return (
                      <div
                        key={cell.key}
                        className="p-0.5 sm:p-1 flex items-center justify-center relative"
                      >
                        <div
                          className={`w-full h-full rounded-xl transition-all border
                            ${
                              isBlockedTarget
                                ? 'border-rose-500/80 bg-rose-950/30 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                : hasArrow
                                ? 'border-transparent bg-transparent'
                                : 'border-[#1b2230] bg-[#141924]/40'
                            }
                          `}
                        />
                      </div>
                    );
                  })}

                  {/* Active Arrows on this Face */}
                  {faceArrows.map((arrow: ArrowTile) => {
                    const isHinted = arrow.id === hintedArrowId;
                    const isBlocked = arrow.id === blockedArrowId;
                    const isFlying = arrow.id === flyingArrowId;

                    return (
                      <div
                        key={arrow.id}
                        style={{
                          gridRowStart: arrow.row + 1,
                          gridColumnStart: arrow.col + 1,
                        }}
                        className="relative w-full h-full flex items-center justify-center"
                      >
                        <ArrowTileComponent
                          arrow={arrow}
                          gridSize={faceGridSize}
                          isHinted={isHinted}
                          isBlocked={isBlocked}
                          isFlying={isFlying}
                          combo={combo}
                          reducedMotion={reducedMotion}
                          onClick={() => handleSafeTileClick(arrow)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Face Navigator & Quick Snap Controls */}
      <div className="w-full max-w-sm flex flex-col items-center gap-1.5 mt-2 px-2">
        <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-semibold px-1">
          <div className="flex items-center gap-1 text-emerald-400">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Facing: {currentFace}</span>
          </div>
          <span className="text-slate-500">Drag cube 360° to rotate</span>
        </div>

        {/* 6 Face Quick Snap Buttons */}
        <div className="grid grid-cols-6 gap-1 w-full p-1 bg-[#151923] border border-[#242b3b] rounded-xl shadow-md">
          {CUBE_FACES.map((face: CubeFace) => {
            const count = arrowsByFace[face].length;
            const isActive = currentFace === face;

            return (
              <button
                key={face}
                type="button"
                onClick={() => handleSnapToFace(face)}
                className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center
                  ${
                    isActive
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                      : count > 0
                      ? 'text-slate-300 hover:text-white bg-[#1a202c]/60 border border-transparent'
                      : 'text-slate-600 bg-transparent'
                  }
                `}
              >
                <span>{face.slice(0, 3)}</span>
                <span className={`text-[8px] ${count > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

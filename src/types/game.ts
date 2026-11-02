export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 'CLASSIC' | 'RUSH';

export type CubeFace = 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

export const CUBE_FACES: CubeFace[] = ['FRONT', 'RIGHT', 'BACK', 'LEFT', 'TOP', 'BOTTOM'];

export type SpecialArrowType =
  | 'teleport'
  | 'explosive'
  | 'double'
  | 'locked'
  | 'key'
  | 'rotating';

export interface ArrowTile {
  id: string;
  row: number;
  col: number;
  direction: Direction;
  face?: CubeFace; // Defined for 3D Cube levels
  status?: 'idle' | 'flying' | 'blocked' | 'hinted';
  blockedByCoord?: { row: number; col: number; face?: CubeFace } | null;
  // Special Arrow mechanics
  specialType?: SpecialArrowType;
  isLocked?: boolean;
  unlocksAtRemaining?: number;
  isKey?: boolean;
  keyForId?: string; // Links key arrow to locked arrow id
  doubleStage?: number; // 0: primary, 1: secondary activated
  teleportTarget?: { row: number; col: number; face?: CubeFace };
  rotationCount?: number;
}

export interface LevelData {
  id: number;
  levelNumber: number;
  chapter: number; // 1 to 5
  chapterTitle: string;
  difficulty: Difficulty;
  gridSize: number; // 2D grid size or 3D face grid size
  arrows: ArrowTile[];
  parMoves: number;
  title?: string;
  archetype?: string;
  is3D?: boolean; // True for Chapter 2, 4, 5 levels
  isSpecial?: boolean;
  specialType?: 'locked' | 'limited_moves' | 'teleport' | 'explosive' | 'double' | 'rotating';
  specialMechanics?: SpecialArrowType[];
  moveLimit?: number;
}

export interface PlayerProgress {
  unlockedLevel: number;
  currentLevel: number;
  levelStars: Record<number, number>; // levelNumber -> 1, 2, 3
  coins: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  reducedMotion: boolean;
  vibrationEnabled: boolean;
  dailyStreak: number;
  lastClaimDate: string | null;
  bestRushScore: number;
  rushGamesPlayed: number;
  // Tutorials seen flags
  seen3DTutorial?: boolean;
  seenSpecialTutorials?: Record<string, boolean>;
}

export interface UndoStep {
  arrow: ArrowTile;
  arrowsSnapshot: ArrowTile[];
  movesCount: number;
}

export interface RushStats {
  score: number;
  puzzlesSolved: number;
  maxCombo: number;
  isNewHighScore: boolean;
  coinsEarned: number;
}

export interface ChapterInfo {
  number: number;
  title: string;
  subtitle: string;
  levelRange: [number, number];
  is3D: boolean;
  mechanics: string[];
}

export const CHAPTERS: ChapterInfo[] = [
  {
    number: 1,
    title: 'Neon Origins',
    subtitle: 'Classic 2D Arrow Escape',
    levelRange: [1, 100],
    is3D: false,
    mechanics: ['Standard Arrows', 'Locked Milestones', 'Move Limits'],
  },
  {
    number: 2,
    title: 'Cube Dimension',
    subtitle: '3D Cube Introduction',
    levelRange: [101, 200],
    is3D: true,
    mechanics: ['6-Sided Cube', '360° Touch Rotation', 'Face Inspection'],
  },
  {
    number: 3,
    title: 'Quantum Matrix',
    subtitle: 'Special Arrow Mechanics',
    levelRange: [201, 300],
    is3D: false,
    mechanics: ['Teleport Portals', 'Explosive EMP', 'Double Arrows', 'Rotating Compass', 'Key Locks'],
  },
  {
    number: 4,
    title: 'Hypercube Orbit',
    subtitle: 'Advanced 3D Spatial Puzzles',
    levelRange: [301, 400],
    is3D: true,
    mechanics: ['3D Cube + Special Arrows', 'Cross-Face Teleport', 'Rotational Tactics'],
  },
  {
    number: 5,
    title: 'Master Singularity',
    subtitle: 'Grandmaster Expert Challenges',
    levelRange: [401, 500],
    is3D: true,
    mechanics: ['High Complexity 3D', 'Chained Explosives', 'Precision Limits', 'Mastery'],
  },
];

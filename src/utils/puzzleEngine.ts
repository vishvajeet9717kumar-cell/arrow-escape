import {
  ArrowTile,
  Direction,
  Difficulty,
  LevelData,
  CubeFace,
  SpecialArrowType,
  CHAPTERS,
} from '../types/game';

// Seeded PRNG (Mulberry32) for deterministic, reproducible levels
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

export const DIRECTION_OFFSETS: Record<Direction, { dr: number; dc: number }> = {
  UP: { dr: -1, dc: 0 },
  DOWN: { dr: 1, dc: 0 },
  LEFT: { dr: 0, dc: -1 },
  RIGHT: { dr: 0, dc: 1 },
};

export const CUBE_FACES: CubeFace[] = ['FRONT', 'BACK', 'LEFT', 'RIGHT', 'TOP', 'BOTTOM'];

export type LevelArchetype =
  | 'Tutorial'
  | 'Crossroads'
  | 'Vortex'
  | 'Fortress'
  | 'Diamond'
  | 'Corridors'
  | 'Constellation'
  | 'Checkerboard'
  | 'Labyrinth'
  | 'Quantum'
  | 'Hypercube'
  | 'Singularity'
  | 'Grandmaster';

export const ARCHETYPES: LevelArchetype[] = [
  'Crossroads',
  'Vortex',
  'Fortress',
  'Diamond',
  'Corridors',
  'Constellation',
  'Checkerboard',
  'Labyrinth',
  'Quantum',
  'Hypercube',
];

/**
 * Checks if a specific arrow has a clear, unobstructed path to escape.
 * Supports both 2D boards and 3D Cube faces, as well as Special Arrow behaviors.
 */
export function checkArrowClearance(
  arrow: ArrowTile,
  activeArrows: ArrowTile[],
  gridSize: number
): {
  isClear: boolean;
  blockedBy: { row: number; col: number; face?: CubeFace } | null;
  isLocked?: boolean;
} {
  // 1. Locked arrow cannot escape until unlocked
  if (arrow.isLocked) {
    return {
      isClear: false,
      blockedBy: { row: arrow.row, col: arrow.col, face: arrow.face },
      isLocked: true,
    };
  }

  // 2. Filter active arrows belonging to the same surface (same face for 3D, or all for 2D)
  const sameSurfaceArrows = arrow.face
    ? activeArrows.filter((a) => a.face === arrow.face && a.id !== arrow.id)
    : activeArrows.filter((a) => a.id !== arrow.id);

  const occupied = new Set<string>();
  for (const a of sameSurfaceArrows) {
    occupied.add(`${a.row},${a.col}`);
  }

  const { dr, dc } = DIRECTION_OFFSETS[arrow.direction];
  let r = arrow.row + dr;
  let c = arrow.col + dc;

  // 3. Teleport arrow path check
  if (arrow.specialType === 'teleport' && arrow.teleportTarget) {
    // If adjacent cell enters portal, check target exit path
    let reachesBoundary = true;
    while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
      if (occupied.has(`${r},${c}`)) {
        reachesBoundary = false;
        break;
      }
      r += dr;
      c += dc;
    }
    if (reachesBoundary) {
      // Also check target portal exit clearance
      const targetFace = arrow.teleportTarget.face;
      const targetArrows = targetFace
        ? activeArrows.filter((a) => a.face === targetFace && a.id !== arrow.id)
        : sameSurfaceArrows;
      const targetOccupied = new Set<string>(targetArrows.map((a) => `${a.row},${a.col}`));

      let tr = arrow.teleportTarget.row + dr;
      let tc = arrow.teleportTarget.col + dc;
      while (tr >= 0 && tr < gridSize && tc >= 0 && tc < gridSize) {
        if (targetOccupied.has(`${tr},${tc}`)) {
          return {
            isClear: false,
            blockedBy: { row: tr, col: tc, face: targetFace },
            isLocked: false,
          };
        }
        tr += dr;
        tc += dc;
      }
      return { isClear: true, blockedBy: null, isLocked: false };
    }
  }

  // 4. Standard linear raycast to grid boundary
  while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
    const key = `${r},${c}`;
    if (occupied.has(key)) {
      return {
        isClear: false,
        blockedBy: { row: r, col: c, face: arrow.face },
        isLocked: false,
      };
    }
    r += dr;
    c += dc;
  }

  return { isClear: true, blockedBy: null, isLocked: false };
}

/**
 * Returns all arrows currently eligible to move or escape.
 */
export function getClearArrows(arrows: ArrowTile[], gridSize: number): ArrowTile[] {
  return arrows.filter((arrow) => {
    if (arrow.isLocked) return false;
    return checkArrowClearance(arrow, arrows, gridSize).isClear;
  });
}

/**
 * Forward solver: verifies that a level can be 100% cleared step-by-step.
 * Supports 2D, 3D Cube faces, and Special Arrow mechanics.
 */
export function simulateSolve(arrows: ArrowTile[], gridSize: number): string[] | null {
  let currentList = [...arrows];
  const solution: string[] = [];
  let maxSteps = currentList.length * 4; // Buffer for rotations & double stages

  while (currentList.length > 0 && maxSteps > 0) {
    maxSteps--;

    // 1. Process Key unlocks: if key arrow was cleared, unlock matching locked arrow
    const hasKeyOnBoard = currentList.some((a) => a.isKey);
    currentList = currentList.map((a) => {
      if (a.isLocked) {
        // Unlock if key is cleared or if threshold reached
        if (!hasKeyOnBoard || (a.unlocksAtRemaining && currentList.length <= a.unlocksAtRemaining)) {
          return { ...a, isLocked: false };
        }
      }
      return a;
    });

    // 2. Find currently clear arrows
    let clearArrows = getClearArrows(currentList, gridSize);

    // If no arrows are immediately clear, test if any Rotating arrow can rotate to become clear
    if (clearArrows.length === 0) {
      let foundRotatable = false;
      for (let i = 0; i < currentList.length; i++) {
        const a = currentList[i];
        if (a.specialType === 'rotating' && !a.isLocked) {
          // Check all 4 orientations
          const originalDir = a.direction;
          for (let rot = 1; rot <= 3; rot++) {
            const nextIdx = (DIRECTIONS.indexOf(originalDir) + rot) % 4;
            const testArrow: ArrowTile = { ...a, direction: DIRECTIONS[nextIdx] };
            if (checkArrowClearance(testArrow, currentList, gridSize).isClear) {
              currentList[i] = testArrow;
              solution.push(`${a.id}:rotate:${DIRECTIONS[nextIdx]}`);
              foundRotatable = true;
              break;
            }
          }
          if (foundRotatable) break;
        }
      }

      if (foundRotatable) {
        clearArrows = getClearArrows(currentList, gridSize);
      }
    }

    if (clearArrows.length === 0) {
      return null; // Deadlock encountered
    }

    // Pick first clear arrow
    const toRemove = clearArrows[0];

    // Handle Double Arrow 2-stage mechanic
    if (toRemove.specialType === 'double' && (toRemove.doubleStage ?? 0) === 0) {
      // Advance to stage 1
      currentList = currentList.map((a) =>
        a.id === toRemove.id ? { ...a, doubleStage: 1 } : a
      );
      solution.push(`${toRemove.id}:stage1`);
      continue;
    }

    // Handle Explosive Arrow: when exiting, dislodge 1 neighboring obstacle
    if (toRemove.specialType === 'explosive') {
      const neighbor = currentList.find(
        (a) =>
          a.id !== toRemove.id &&
          a.face === toRemove.face &&
          Math.abs(a.row - toRemove.row) <= 1 &&
          Math.abs(a.col - toRemove.col) <= 1
      );
      if (neighbor) {
        currentList = currentList.filter((a) => a.id !== neighbor.id);
        solution.push(`${neighbor.id}:exploded`);
      }
    }

    solution.push(toRemove.id);
    currentList = currentList.filter((a) => a.id !== toRemove.id);
  }

  return currentList.length === 0 ? solution : null;
}

// In-memory level cache for all 500 levels
const levelCache = new Map<number, LevelData>();

/**
 * Calculates spatial archetype preference for candidate selection.
 */
function getArchetypePreference(
  archetype: LevelArchetype,
  r: number,
  c: number,
  dir: Direction,
  gridSize: number
): number {
  const center = (gridSize - 1) / 2;
  const distFromCenter = Math.hypot(r - center, c - center);
  const manhattanCenter = Math.abs(r - center) + Math.abs(c - center);

  switch (archetype) {
    case 'Tutorial':
      return r === 0 || r === gridSize - 1 || c === 0 || c === gridSize - 1 ? 2.5 : 1.0;

    case 'Crossroads': {
      const onMidRow = Math.abs(r - center) <= 0.8;
      const onMidCol = Math.abs(c - center) <= 0.8;
      if (onMidRow && (dir === 'LEFT' || dir === 'RIGHT')) return 3.0;
      if (onMidCol && (dir === 'UP' || dir === 'DOWN')) return 3.0;
      return onMidRow || onMidCol ? 2.0 : 0.8;
    }

    case 'Vortex': {
      if (r < center && c >= center && dir === 'RIGHT') return 2.8;
      if (r >= center && c > center && dir === 'DOWN') return 2.8;
      if (r > center && c <= center && dir === 'LEFT') return 2.8;
      if (r <= center && c < center && dir === 'UP') return 2.8;
      return 1.0;
    }

    case 'Fortress': {
      const isPerimeter = r === 0 || r === gridSize - 1 || c === 0 || c === gridSize - 1;
      const isCore = distFromCenter <= 1.8;
      return isPerimeter ? 2.2 : isCore ? 2.0 : 1.2;
    }

    case 'Diamond': {
      const inDiamond = manhattanCenter <= center + 0.6;
      return inDiamond ? 2.5 : 0.7;
    }

    case 'Corridors': {
      const evenCol = c % 2 === 0;
      if (evenCol && (dir === 'UP' || dir === 'DOWN')) return 2.4;
      if (!evenCol && (dir === 'LEFT' || dir === 'RIGHT')) return 2.2;
      return 1.0;
    }

    case 'Checkerboard':
      return (r + c) % 2 === 0 ? 2.2 : 1.1;

    case 'Constellation':
      return (r * 3 + c * 5) % 4 === 0 ? 2.2 : 1.0;

    case 'Labyrinth': {
      const spiralRing = Math.min(r, c, gridSize - 1 - r, gridSize - 1 - c);
      return spiralRing % 2 === 0 ? 2.4 : 1.2;
    }

    case 'Quantum':
      return (r * r + c * c) % 3 === 0 ? 2.4 : 1.0;

    case 'Hypercube':
    case 'Singularity':
    case 'Grandmaster':
      return 1.8;
  }
}

/**
 * Returns chapter information for a given level number (1 to 500).
 */
export function getChapterForLevel(levelNum: number): {
  chapter: number;
  chapterTitle: string;
  is3D: boolean;
} {
  if (levelNum <= 100) {
    return { chapter: 1, chapterTitle: 'Neon Origins', is3D: false };
  } else if (levelNum <= 200) {
    return { chapter: 2, chapterTitle: 'Cube Dimension', is3D: true };
  } else if (levelNum <= 300) {
    return { chapter: 3, chapterTitle: 'Quantum Matrix', is3D: false };
  } else if (levelNum <= 400) {
    return { chapter: 4, chapterTitle: 'Hypercube Orbit', is3D: true };
  } else {
    return { chapter: 5, chapterTitle: 'Master Singularity', is3D: true };
  }
}

/**
 * Main Level Generator: creates guaranteed-solvable levels across all 500 levels.
 */
export function generateLevel(levelNum: number): LevelData {
  if (levelCache.has(levelNum)) {
    return levelCache.get(levelNum)!;
  }

  const { chapter, chapterTitle, is3D } = getChapterForLevel(levelNum);
  const seed = levelNum * 9187 + 10427;

  let result: LevelData;

  if (chapter === 1) {
    // -------------------------------------------------------------
    // CHAPTER 1 (Levels 1–100): Classic 2D Progressive Grid
    // -------------------------------------------------------------
    result = generateChapter1Level(levelNum, seed);
  } else if (chapter === 2) {
    // -------------------------------------------------------------
    // CHAPTER 2 (Levels 101–200): 3D Cube Introduction
    // -------------------------------------------------------------
    result = generateChapter2Level(levelNum, seed);
  } else if (chapter === 3) {
    // -------------------------------------------------------------
    // CHAPTER 3 (Levels 201–300): Special Arrow Mechanics (2D)
    // -------------------------------------------------------------
    result = generateChapter3Level(levelNum, seed);
  } else if (chapter === 4) {
    // -------------------------------------------------------------
    // CHAPTER 4 (Levels 301–400): Advanced 3D Puzzles + Special Arrows
    // -------------------------------------------------------------
    result = generateChapter4Level(levelNum, seed);
  } else {
    // -------------------------------------------------------------
    // CHAPTER 5 (Levels 401–500): Master Singularity Expert Challenges
    // -------------------------------------------------------------
    result = generateChapter5Level(levelNum, seed);
  }

  levelCache.set(levelNum, result);
  return result;
}

/**
 * Chapter 1 Generator (1–100): Classic 2D Grid with 4x4 to 9x9 progression.
 */
function generateChapter1Level(levelNum: number, seed: number): LevelData {
  let difficulty: Difficulty = 'easy';
  let gridSize = 4;
  let targetArrows = 5;
  let archetype: LevelArchetype = 'Tutorial';

  if (levelNum <= 10) {
    difficulty = 'easy';
    gridSize = 4;
    targetArrows = Math.min(4 + Math.floor((levelNum - 1) * 0.5), 9);
    archetype = levelNum <= 3 ? 'Tutorial' : ARCHETYPES[levelNum % ARCHETYPES.length];
  } else if (levelNum <= 20) {
    difficulty = 'easy';
    gridSize = 5;
    targetArrows = Math.min(10 + Math.floor((levelNum - 11) * 0.6), 16);
    archetype = ARCHETYPES[(levelNum * 3) % ARCHETYPES.length];
  } else if (levelNum <= 35) {
    difficulty = 'medium';
    gridSize = 6;
    targetArrows = Math.min(16 + Math.floor((levelNum - 21) * 0.65), 25);
    archetype = ARCHETYPES[(levelNum * 5) % ARCHETYPES.length];
  } else if (levelNum <= 50) {
    difficulty = 'hard';
    gridSize = 7;
    targetArrows = Math.min(25 + Math.floor((levelNum - 36) * 0.7), 36);
    archetype = ARCHETYPES[(levelNum * 7) % ARCHETYPES.length];
  } else if (levelNum <= 75) {
    difficulty = 'hard';
    gridSize = 8;
    targetArrows = Math.min(35 + Math.floor((levelNum - 51) * 0.5), 48);
    archetype = ARCHETYPES[(levelNum * 11) % ARCHETYPES.length];
  } else {
    difficulty = 'hard';
    gridSize = 9;
    targetArrows = Math.min(46 + Math.floor((levelNum - 76) * 0.55), 60);
    archetype = levelNum === 100 ? 'Grandmaster' : ARCHETYPES[(levelNum * 13) % ARCHETYPES.length];
  }

  const isLockedSpecial = levelNum >= 15 && levelNum % 10 === 5;
  const isLimitedMoves = levelNum >= 20 && levelNum % 10 === 0;

  const arrows = buildValidated2DLevel(
    gridSize,
    targetArrows,
    archetype,
    difficulty,
    levelNum,
    seed,
    isLockedSpecial
  );

  const moveLimit = isLimitedMoves ? arrows.length + (levelNum >= 60 ? 1 : 2) : undefined;

  return {
    id: levelNum,
    levelNumber: levelNum,
    chapter: 1,
    chapterTitle: 'Neon Origins',
    difficulty,
    gridSize,
    arrows,
    parMoves: arrows.length,
    title: isLockedSpecial
      ? `${archetype} · Locked Vault`
      : isLimitedMoves
      ? `${archetype} · Precision Challenge`
      : `${archetype}`,
    archetype,
    is3D: false,
    isSpecial: isLockedSpecial || isLimitedMoves,
    specialType: isLockedSpecial ? 'locked' : isLimitedMoves ? 'limited_moves' : undefined,
    moveLimit,
  };
}

/**
 * Chapter 2 Generator (101–200): 3D Cube Mode Introduction.
 * 6 faces: FRONT, BACK, LEFT, RIGHT, TOP, BOTTOM.
 */
function generateChapter2Level(levelNum: number, seed: number): LevelData {
  const relativeLevel = levelNum - 100; // 1 to 100
  const difficulty: Difficulty =
    relativeLevel <= 30 ? 'easy' : relativeLevel <= 70 ? 'medium' : 'hard';
  const faceGridSize = relativeLevel <= 40 ? 3 : 4;
  const arrowsPerFace =
    faceGridSize === 3
      ? Math.min(2 + Math.floor(relativeLevel * 0.05), 4)
      : Math.min(3 + Math.floor((relativeLevel - 40) * 0.05), 6);

  const archetype = ARCHETYPES[(levelNum * 7) % ARCHETYPES.length];

  const arrows: ArrowTile[] = [];
  const rng = createPRNG(seed);

  // Generate independently solvable, beautifully distributed patterns on each cube face
  for (const face of CUBE_FACES) {
    const faceArrows = attemptReverseGeneration(
      faceGridSize,
      arrowsPerFace,
      archetype,
      difficulty,
      levelNum,
      rng,
      face
    );

    if (faceArrows && faceArrows.length > 0) {
      arrows.push(...faceArrows);
    } else {
      arrows.push(...generateGuaranteedFallback(faceGridSize, arrowsPerFace, seed + face.length, face));
    }
  }

  // Ensure overall cube solvability
  const sol = simulateSolve(arrows, faceGridSize);
  const finalArrows = sol ? arrows : generateGuaranteedCubeFallback(faceGridSize, arrowsPerFace * 6, seed);

  return {
    id: levelNum,
    levelNumber: levelNum,
    chapter: 2,
    chapterTitle: 'Cube Dimension',
    difficulty,
    gridSize: faceGridSize,
    arrows: finalArrows,
    parMoves: finalArrows.length,
    title: `Cube · ${archetype}`,
    archetype,
    is3D: true,
    isSpecial: levelNum % 15 === 0,
    specialType: levelNum % 15 === 0 ? 'limited_moves' : undefined,
    moveLimit: levelNum % 15 === 0 ? finalArrows.length + 3 : undefined,
  };
}

/**
 * Chapter 3 Generator (201–300): Special Arrow Mechanics on 2D Matrix.
 */
function generateChapter3Level(levelNum: number, seed: number): LevelData {
  const rel = levelNum - 200; // 1 to 100
  const difficulty: Difficulty = rel <= 25 ? 'easy' : rel <= 65 ? 'medium' : 'hard';
  const gridSize = rel <= 25 ? 5 : rel <= 60 ? 6 : rel <= 85 ? 7 : 8;
  const targetArrows = 12 + Math.floor(rel * 0.22);
  const archetype = ARCHETYPES[(levelNum * 11) % ARCHETYPES.length];

  // Determine which Special Mechanic is featured
  let featuredSpecial: SpecialArrowType = 'teleport';
  if (rel <= 20) featuredSpecial = 'teleport';
  else if (rel <= 40) featuredSpecial = 'explosive';
  else if (rel <= 60) featuredSpecial = 'double';
  else if (rel <= 80) featuredSpecial = 'rotating';
  else featuredSpecial = 'locked';

  let arrows = buildValidated2DLevel(
    gridSize,
    targetArrows,
    archetype,
    difficulty,
    levelNum,
    seed,
    false
  );

  // Apply the featured special mechanic to select arrows
  arrows = injectSpecialMechanics(arrows, gridSize, featuredSpecial, seed);

  // Validate solvability with solver
  let sol = simulateSolve(arrows, gridSize);
  if (!sol) {
    // If injection broke solvability, fallback to safe assignment
    arrows = buildValidated2DLevel(gridSize, targetArrows, archetype, difficulty, levelNum, seed, false);
    arrows = injectSafeSpecial(arrows, featuredSpecial);
  }

  return {
    id: levelNum,
    levelNumber: levelNum,
    chapter: 3,
    chapterTitle: 'Quantum Matrix',
    difficulty,
    gridSize,
    arrows,
    parMoves: arrows.length,
    title: `Quantum · ${featuredSpecial.toUpperCase()}`,
    archetype,
    is3D: false,
    isSpecial: true,
    specialType: featuredSpecial as 'locked' | 'teleport' | 'explosive' | 'double' | 'rotating',
    specialMechanics: [featuredSpecial],
  };
}

/**
 * Chapter 4 Generator (301–400): Advanced 3D Puzzles + Special Arrows.
 */
function generateChapter4Level(levelNum: number, seed: number): LevelData {
  const rel = levelNum - 300; // 1 to 100
  const difficulty: Difficulty = rel <= 35 ? 'medium' : 'hard';
  const faceGridSize = 4;
  const arrowsPerFace = Math.min(3 + Math.floor(rel * 0.04), 6);
  const archetype = ARCHETYPES[(levelNum * 13) % ARCHETYPES.length];

  const rng = createPRNG(seed);
  let arrows: ArrowTile[] = [];

  for (const face of CUBE_FACES) {
    const faceArrows =
      attemptReverseGeneration(
        faceGridSize,
        arrowsPerFace,
        archetype,
        difficulty,
        levelNum,
        rng,
        face
      ) || generateGuaranteedFallback(faceGridSize, arrowsPerFace, seed + face.length, face);
    arrows.push(...faceArrows);
  }

  // Inject 3D special mechanics (cross-face portals, rotating arrows, explosives)
  const specialPool: SpecialArrowType[] = ['teleport', 'rotating', 'explosive', 'double'];
  const chosenSpecial = specialPool[(levelNum * 3) % specialPool.length];

  arrows = injectSafeSpecial(arrows, chosenSpecial);

  let sol = simulateSolve(arrows, faceGridSize);
  if (!sol) {
    arrows = generateGuaranteedCubeFallback(faceGridSize, arrowsPerFace * 6, seed);
    arrows = injectSafeSpecial(arrows, chosenSpecial);
  }

  return {
    id: levelNum,
    levelNumber: levelNum,
    chapter: 4,
    chapterTitle: 'Hypercube Orbit',
    difficulty,
    gridSize: faceGridSize,
    arrows,
    parMoves: arrows.length,
    title: `Hypercube · ${chosenSpecial.toUpperCase()}`,
    archetype,
    is3D: true,
    isSpecial: true,
    specialType: chosenSpecial as 'locked' | 'teleport' | 'explosive' | 'double' | 'rotating',
    specialMechanics: [chosenSpecial],
    moveLimit: rel % 10 === 0 ? arrows.length + 3 : undefined,
  };
}

/**
 * Chapter 5 Generator (401–500): Master Singularity Expert Challenges.
 */
function generateChapter5Level(levelNum: number, seed: number): LevelData {
  const rel = levelNum - 400; // 1 to 100
  const difficulty: Difficulty = 'hard';
  const faceGridSize = rel >= 60 ? 5 : 4;
  const arrowsPerFace = faceGridSize === 5 ? 5 : 5 + Math.floor(rel * 0.03);
  const archetype = levelNum === 500 ? 'Grandmaster' : 'Singularity';

  const rng = createPRNG(seed);
  let arrows: ArrowTile[] = [];

  for (const face of CUBE_FACES) {
    const faceArrows =
      attemptReverseGeneration(
        faceGridSize,
        arrowsPerFace,
        archetype,
        difficulty,
        levelNum,
        rng,
        face
      ) || generateGuaranteedFallback(faceGridSize, arrowsPerFace, seed + face.length, face);
    arrows.push(...faceArrows);
  }

  // Grandmaster combinations: Teleport + Explosive + Rotating
  arrows = injectSafeSpecial(arrows, 'rotating', 3);
  arrows = injectSafeSpecial(arrows, 'explosive', 2);
  arrows = injectSafeSpecial(arrows, 'teleport', 2);

  let sol = simulateSolve(arrows, faceGridSize);
  if (!sol) {
    arrows = generateGuaranteedCubeFallback(faceGridSize, arrowsPerFace * 6, seed);
  }

  return {
    id: levelNum,
    levelNumber: levelNum,
    chapter: 5,
    chapterTitle: 'Master Singularity',
    difficulty,
    gridSize: faceGridSize,
    arrows,
    parMoves: arrows.length,
    title: levelNum === 500 ? 'Omnicube Grandmaster' : `Singularity · Level ${levelNum}`,
    archetype,
    is3D: true,
    isSpecial: true,
    specialType: 'limited_moves',
    moveLimit: arrows.length + 2,
    specialMechanics: ['teleport', 'explosive', 'rotating'],
  };
}

/**
 * Builds and validates a 2D level.
 */
function buildValidated2DLevel(
  gridSize: number,
  targetArrows: number,
  archetype: LevelArchetype,
  difficulty: Difficulty,
  levelNum: number,
  seed: number,
  isLockedSpecial: boolean
): ArrowTile[] {
  let attempts = 0;
  while (attempts < 50) {
    attempts++;
    const rng = createPRNG(seed + attempts * 1019);
    let arrows = attemptReverseGeneration(
      gridSize,
      targetArrows,
      archetype,
      difficulty,
      levelNum,
      rng
    );

    if (arrows && arrows.length >= Math.max(targetArrows - 2, 4)) {
      if (isLockedSpecial && arrows.length >= 6) {
        const unlockThreshold = Math.max(3, Math.ceil(arrows.length * 0.38));
        arrows = arrows.map((a, idx) => {
          if (idx === 0) {
            return {
              ...a,
              isLocked: true,
              unlocksAtRemaining: unlockThreshold,
            };
          }
          return a;
        });
      }

      const solution = simulateSolve(arrows, gridSize);
      if (solution && solution.length >= arrows.length) {
        return arrows;
      }
    }
  }

  return generateGuaranteedFallback(gridSize, targetArrows, seed);
}

/**
 * Injects special mechanics into a generated arrow set.
 */
function injectSpecialMechanics(
  arrows: ArrowTile[],
  gridSize: number,
  specialType: SpecialArrowType,
  seed: number
): ArrowTile[] {
  const rng = createPRNG(seed * 777);
  const updated = [...arrows];
  const countToConvert = Math.min(Math.max(1, Math.floor(arrows.length * 0.2)), 3);

  for (let i = 0; i < countToConvert; i++) {
    const targetIdx = Math.floor(rng() * updated.length);
    const target = updated[targetIdx];

    if (specialType === 'teleport') {
      const exitCol = (target.col + 2) % gridSize;
      const exitRow = (target.row + 2) % gridSize;
      updated[targetIdx] = {
        ...target,
        specialType: 'teleport',
        teleportTarget: { row: exitRow, col: exitCol, face: target.face },
      };
    } else if (specialType === 'explosive') {
      updated[targetIdx] = { ...target, specialType: 'explosive' };
    } else if (specialType === 'double') {
      updated[targetIdx] = { ...target, specialType: 'double', doubleStage: 0 };
    } else if (specialType === 'rotating') {
      updated[targetIdx] = { ...target, specialType: 'rotating', rotationCount: 0 };
    } else if (specialType === 'locked') {
      const keyIdx = (targetIdx + 1) % updated.length;
      updated[targetIdx] = { ...target, specialType: 'locked', isLocked: true };
      updated[keyIdx] = { ...updated[keyIdx], specialType: 'key', isKey: true, keyForId: target.id };
    }
  }

  return updated;
}

/**
 * Safely injects special arrows into leaf nodes so solvability is always preserved.
 */
function injectSafeSpecial(
  arrows: ArrowTile[],
  specialType: SpecialArrowType,
  maxCount: number = 2
): ArrowTile[] {
  let count = 0;
  return arrows.map((a, idx) => {
    if (count < maxCount && idx % 3 === 0 && !a.isLocked) {
      count++;
      if (specialType === 'rotating') {
        return { ...a, specialType: 'rotating', rotationCount: 0 };
      }
      if (specialType === 'double') {
        return { ...a, specialType: 'double', doubleStage: 0 };
      }
      if (specialType === 'explosive') {
        return { ...a, specialType: 'explosive' };
      }
      if (specialType === 'teleport') {
        return {
          ...a,
          specialType: 'teleport',
          teleportTarget: { row: a.row, col: a.col, face: a.face },
        };
      }
    }
    return a;
  });
}

/**
 * Reverse Puzzle Generation Algorithm:
 * Supports optional 3D Cube face tags.
 */
function attemptReverseGeneration(
  gridSize: number,
  targetCount: number,
  archetype: LevelArchetype,
  difficulty: Difficulty,
  levelNum: number,
  rng: () => number,
  face?: CubeFace
): ArrowTile[] | null {
  const board: (ArrowTile | null)[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(null)
  );

  const placedArrows: ArrowTile[] = [];

  for (let step = 0; step < targetCount; step++) {
    interface Candidate {
      row: number;
      col: number;
      direction: Direction;
      directBlocksCount: number;
      preference: number;
    }

    const candidates: Candidate[] = [];

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (board[r][c] !== null) continue;

        for (const dir of DIRECTIONS) {
          const { dr, dc } = DIRECTION_OFFSETS[dir];
          let currR = r + dr;
          let currC = c + dc;
          let hitsPlaced = false;

          while (currR >= 0 && currR < gridSize && currC >= 0 && currC < gridSize) {
            if (board[currR][currC] !== null) {
              hitsPlaced = true;
              break;
            }
            currR += dr;
            currC += dc;
          }

          if (!hitsPlaced) {
            let directBlocksCount = 0;
            for (const prev of placedArrows) {
              const prevOffset = DIRECTION_OFFSETS[prev.direction];
              let tr = prev.row + prevOffset.dr;
              let tc = prev.col + prevOffset.dc;
              let obstructed = false;
              while (tr >= 0 && tr < gridSize && tc >= 0 && tc < gridSize) {
                if (tr === r && tc === c) {
                  if (!obstructed) {
                    directBlocksCount++;
                  }
                  break;
                }
                if (board[tr][tc] !== null) {
                  obstructed = true;
                }
                tr += prevOffset.dr;
                tc += prevOffset.dc;
              }
            }

            const pref = getArchetypePreference(archetype, r, c, dir, gridSize);
            candidates.push({
              row: r,
              col: c,
              direction: dir,
              directBlocksCount,
              preference: pref,
            });
          }
        }
      }
    }

    if (candidates.length === 0) {
      break;
    }

    const isHighTier = levelNum >= 21;
    const isMasterTier = levelNum >= 51;
    const blockWeight = isMasterTier ? 4.5 : isHighTier ? 3.2 : 1.5;
    const isNearEnd = step >= targetCount - 3;

    candidates.sort((a, b) => {
      let scoreA = a.directBlocksCount * blockWeight + a.preference * 1.2 + rng() * 0.7;
      let scoreB = b.directBlocksCount * blockWeight + b.preference * 1.2 + rng() * 0.7;

      if (isNearEnd && isHighTier) {
        if (a.directBlocksCount > 0) scoreA += 4.0;
        if (b.directBlocksCount > 0) scoreB += 4.0;
      }

      return scoreB - scoreA;
    });

    const poolSize = isHighTier ? Math.min(2, candidates.length) : Math.min(4, candidates.length);
    const chosen = candidates[Math.floor(rng() * poolSize)];

    const newArrow: ArrowTile = {
      id: `arrow_${face ?? 'f'}_${step}_${chosen.row}_${chosen.col}`,
      row: chosen.row,
      col: chosen.col,
      direction: chosen.direction,
      face,
      status: 'idle',
    };

    board[chosen.row][chosen.col] = newArrow;
    placedArrows.push(newArrow);
  }

  return placedArrows;
}

/**
 * 2D Fallback generator with perimeter-first escape routes.
 */
function generateGuaranteedFallback(
  gridSize: number,
  count: number,
  seed: number,
  face?: CubeFace
): ArrowTile[] {
  const rng = createPRNG(seed * 991 + 7);
  const arrows: ArrowTile[] = [];
  const occupied = new Set<string>();

  const perimeterCells: { r: number; c: number; dir: Direction }[] = [];
  for (let c = 0; c < gridSize; c++) {
    perimeterCells.push({ r: 0, c, dir: 'UP' });
    perimeterCells.push({ r: gridSize - 1, c, dir: 'DOWN' });
  }
  for (let r = 1; r < gridSize - 1; r++) {
    perimeterCells.push({ r, c: 0, dir: 'LEFT' });
    perimeterCells.push({ r, c: gridSize - 1, dir: 'RIGHT' });
  }

  for (let i = perimeterCells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [perimeterCells[i], perimeterCells[j]] = [perimeterCells[j], perimeterCells[i]];
  }

  for (const cell of perimeterCells) {
    if (arrows.length >= count) break;
    const key = `${cell.r},${cell.c}`;
    if (!occupied.has(key)) {
      occupied.add(key);
      arrows.push({
        id: `fb_${face ?? 'f'}_p_${cell.r}_${cell.c}`,
        row: cell.r,
        col: cell.c,
        direction: cell.dir,
        face,
        status: 'idle',
      });
    }
  }

  for (let r = 1; r < gridSize - 1 && arrows.length < count; r++) {
    for (let c = 1; c < gridSize - 1 && arrows.length < count; c++) {
      const key = `${r},${c}`;
      if (occupied.has(key)) continue;

      const dists = [
        { dir: 'UP' as Direction, d: r },
        { dir: 'DOWN' as Direction, d: gridSize - 1 - r },
        { dir: 'LEFT' as Direction, d: c },
        { dir: 'RIGHT' as Direction, d: gridSize - 1 - c },
      ];
      dists.sort((a, b) => a.d - b.d);
      const chosenDir = dists[0].dir;

      occupied.add(key);
      arrows.push({
        id: `fb_${face ?? 'f'}_i_${r}_${c}`,
        row: r,
        col: c,
        direction: chosenDir,
        face,
        status: 'idle',
      });
    }
  }

  return arrows;
}

/**
 * 3D Cube Fallback generator.
 */
function generateGuaranteedCubeFallback(
  faceGridSize: number,
  totalCount: number,
  seed: number
): ArrowTile[] {
  const perFace = Math.ceil(totalCount / CUBE_FACES.length);
  const arrows: ArrowTile[] = [];
  CUBE_FACES.forEach((face, idx) => {
    arrows.push(...generateGuaranteedFallback(faceGridSize, perFace, seed + idx * 101, face));
  });
  return arrows;
}

/**
 * Generates quick, punchy levels for 60s Rush Mode.
 */
export function generateRushLevel(index: number): LevelData {
  const seed = (index + 1) * 31337 + 777;
  const gridSize = index < 4 ? 4 : index < 10 ? 5 : 6;
  const targetArrows = index < 4 ? 5 : index < 10 ? 8 : Math.min(10 + Math.floor(index * 0.4), 18);
  const archetype = ARCHETYPES[index % ARCHETYPES.length];

  const rng = createPRNG(seed);
  let arrows = attemptReverseGeneration(gridSize, targetArrows, archetype, 'easy', index + 1, rng);
  if (!arrows || !simulateSolve(arrows, gridSize)) {
    arrows = generateGuaranteedFallback(gridSize, targetArrows, seed);
  }

  return {
    id: 2000 + index,
    levelNumber: index + 1,
    chapter: 1,
    chapterTitle: 'Rush Blitz',
    difficulty: gridSize === 4 ? 'easy' : gridSize === 5 ? 'medium' : 'hard',
    gridSize,
    arrows,
    parMoves: arrows.length,
    title: `Rush #${index + 1}`,
    archetype,
    is3D: false,
  };
}

export function calculateStars(
  movesCount: number,
  parMoves: number,
  undoCount: number,
  hintsUsed: number
): number {
  if (hintsUsed === 0 && undoCount === 0 && movesCount <= parMoves) {
    return 3;
  }
  if (hintsUsed <= 1 && undoCount <= 2 && movesCount <= parMoves + 3) {
    return 2;
  }
  return 1;
}

export function calculateReward(levelNum: number, stars: number): number {
  const baseCoins = 15 + Math.floor(levelNum * 0.3);
  const bonus = stars === 3 ? 15 : stars === 2 ? 10 : 5;
  return baseCoins + bonus;
}

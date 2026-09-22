import type { GameType } from '../constants';

import { BinaryResultEngine } from './BinaryResultEngine';
import { CompositeStatEngine } from './CompositeStatEngine';
import { HeadToHeadEngine } from './HeadToHeadEngine';
import { HighScoreEngine } from './HighScoreEngine';
import { LowTimeEngine } from './LowTimeEngine';
import { PhysicalEngine } from './PhysicalEngine';
import { ProgressionEngine } from './ProgressionEngine';
import { SurvivalEngine } from './SurvivalEngine';

import type { TypeEngine } from './TypeEngine';

export const TypeRegistry: Record<GameType, TypeEngine> = {
  HIGH_SCORE: new HighScoreEngine(),
  LOW_TIME: new LowTimeEngine(),
  SURVIVAL: new SurvivalEngine(),
  HEAD_TO_HEAD: new HeadToHeadEngine(),
  BINARY_RESULT: new BinaryResultEngine(),
  COMPOSITE_STAT: new CompositeStatEngine(),
  PROGRESSION: new ProgressionEngine(),
  PHYSICAL: new PhysicalEngine(),
};

export function getEngine(type: GameType): TypeEngine {
  const engine = TypeRegistry[type];
  if (!engine) throw new Error(`No engine registered for type ${type}`);
  return engine;
}

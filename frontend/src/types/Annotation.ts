import type { Position } from './Position';

export type GameMode = 'STANDARD' | 'EDITING' | 'CUSTOM';

export type AnnotationType = 'ARROW' | 'CIRCLE';
export type AnnotationColor = 'GREEN' | 'RED' | 'BLUE' | 'ORANGE';

export interface Annotation {
  type: AnnotationType;
  from?: Position;
  to: Position;
  color: AnnotationColor;
}

export type OsmoBlockType =
  | 'action-walk'
  | 'action-pick'
  | 'action-listen'
  | 'action-look'
  | 'action-say'
  | 'dir-right'
  | 'dir-left'
  | 'dir-up'
  | 'dir-down'
  | 'num-1'
  | 'num-2'
  | 'num-3'
  | 'card-item'
  | 'prep-on'
  | 'prep-under'
  | 'prep-next'
  | 'play-button';

export interface OsmoTangibleBlock {
  id: string;
  type: OsmoBlockType;
  label: string;
  sublabel?: string;
  icon: string;
  color: string; // Tailwind color class or hex
  value?: number | string;
  connectedTo?: string; // id of connected block
}

export interface GridTile {
  x: number;
  y: number;
  type: 'grass' | 'sand' | 'water' | 'path';
  item?: {
    id: string;
    label: string;
    icon: string;
    type: 'strawberry' | 'letter' | 'family' | 'school' | 'bubble';
    collected?: boolean;
  };
}

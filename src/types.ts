export type Placeable = {
  id: string;
  item_id: string;
  x: number; y: number; z: number;
  rotation_index: number;
  state_data?: any;
  owner_id?: string | null;
  updated_at?: string;
}

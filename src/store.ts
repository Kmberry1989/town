import { create } from 'zustand'
import { Placeable } from './types'

type State = {
  map: Map<string, Placeable>;
  setMany: (items: Placeable[]) => void;
  upsert: (p: Placeable) => void;
  remove: (key: string) => void;
}

export const useStore = create<State>((set, get) => ({
  map: new Map(),
  setMany: (items) => {
    const m = new Map(get().map)
    for (const p of items) m.set(`${p.x},${p.y},${p.z}`, p)
    set({ map: m })
  },
  upsert: (p) => {
    const m = new Map(get().map)
    m.set(`${p.x},${p.y},${p.z}`, p)
    set({ map: m })
  },
  remove: (key) => {
    const m = new Map(get().map)
    m.delete(key)
    set({ map: m })
  }
}))

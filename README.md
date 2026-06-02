# PWA Town Scaffold

Vite + TypeScript + Three.js PWA with chunked InstancedMesh, Zustand store, and Supabase Realtime.

## Run

1. npm install
2. cp .env.example .env and fill keys
3. Create `placeables` table with chunk columns and RLS as documented
4. npm run dev
5. Deploy functions: supabase functions deploy place_item && supabase functions deploy remove_item

import * as THREE from 'three'
import { Placeable } from './types'

const CELL = 16
const LOAD = 2

type Pool = {
  mesh: THREE.InstancedMesh;
  capacity: number;
  count: number;
}

const pools = new Map<string, Pool>()
const sceneRef = { scene: null as THREE.Scene | null }

export function setScene(scene: THREE.Scene) {
  sceneRef.scene = scene
}

function getPool(itemId: string, scene: THREE.Scene): Pool {
  let p = pools.get(itemId)
  if (!p) {
    const geo = new THREE.BoxGeometry(1,1,1)
    const mat = new THREE.MeshStandardMaterial({ color: 0x88cc88 })
    const mesh = new THREE.InstancedMesh(geo, mat, 1000)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.count = 0
    scene.add(mesh)
    p = { mesh, capacity: 1000, count: 0 }
    pools.set(itemId, p)
  }
  return p
}

export function rebuildInstances(placeables: Map<string, Placeable>, playerX: number, playerZ: number) {
  const scene = sceneRef.scene
  if (!scene) return
  pools.forEach(p => { p.count = 0 })
  const minCX = Math.floor(playerX / CELL) - LOAD
  const maxCX = Math.floor(playerX / CELL) + LOAD
  const minCZ = Math.floor(playerZ / CELL) - LOAD
  const maxCZ = Math.floor(playerZ / CELL) + LOAD

  const dummy = new THREE.Object3D()
  for (const p of placeables.values()) {
    const cx = Math.floor(p.x / CELL)
    const cz = Math.floor(p.z / CELL)
    if (cx < minCX || cx > maxCX || cz < minCZ || cz > maxCZ) continue
    const pool = getPool(p.item_id, scene)
    dummy.position.set(p.x + 0.5, p.y + 0.5, p.z + 0.5)
    dummy.rotation.y = p.rotation_index * Math.PI * 0.5
    dummy.updateMatrix()
    pool.mesh.setMatrixAt(pool.count++, dummy.matrix)
  }
  pools.forEach(p => {
    p.mesh.count = p.count
    p.mesh.instanceMatrix.needsUpdate = true
  })
}

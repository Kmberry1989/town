import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type ItemDef = {
    id: string
    color?: number
    size?: [number, number, number]
    model?: string // e.g. '/blocks/tree.glb'
}

export const ITEMS: Record<string, ItemDef> = {
    grass: { id: 'grass', color: 0x5ca64b, size: [1, 1, 1] },
    dirt: { id: 'dirt', color: 0x8b5a2b, size: [1, 1, 1] },
    blue_couch: { id: 'blue_couch', color: 0x3a7bd5, size: [2, 1, 1] },
    tree: { id: 'tree', model: '/blocks/tree.glb', size: [1, 2, 1] },
    house: { id: 'house', model: '/blocks/house.glb', size: [2, 1.5, 2] },
    rock: { id: 'rock', model: '/blocks/rock.glb', size: [1, 0.6, 1] },
}

const loader = new GLTFLoader()
const gltfCache = new Map<string, THREE.Group>()
const matCache = new Map<number, THREE.MeshStandardMaterial>()

export async function makeMesh(itemId: string): Promise<THREE.Object3D> {
    const def = ITEMS[itemId] ?? ITEMS.grass

    if (def.model) {
        let base = gltfCache.get(def.model)
        if (!base) {
            const gltf = await loader.loadAsync(def.model)
            base = gltf.scene
            gltfCache.set(def.model, base)
        }
        const clone = base.clone(true)

        if (def.size) {
            const box = new THREE.Box3().setFromObject(clone)
            const size = new THREE.Vector3()
            box.getSize(size)
            if (size.x > 0) clone.scale.set(def.size[0] / size.x, def.size[1] / size.y, def.size[2] / size.z)
        }

        clone.traverse(o => {
            const m = o as THREE.Mesh
            if (m.isMesh) { m.castShadow = true; m.receiveShadow = true }
        })

        const bbox = new THREE.Box3().setFromObject(clone)
        clone.position.y -= bbox.min.y
        return clone
    }

    const size = def.size ?? [1, 1, 1]
    const geo = new THREE.BoxGeometry(...size)
    let mat = matCache.get(def.color ?? 0xffffff)
    if (!mat) {
        mat = new THREE.MeshStandardMaterial({ color: def.color ?? 0xffffff, roughness: 0.8 })
        matCache.set(def.color ?? 0xffffff, mat)
    }
    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.position.y = size[1] / 2
    return mesh
}
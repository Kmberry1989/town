import * as THREE from 'three'
import { supabase } from './supabase'

export function setupControls(camera: THREE.Camera, renderer: THREE.WebGLRenderer, scene: THREE.Scene, getActiveItem: () => string) {
  // block the menu everywhere over the canvas
  window.addEventListener('contextmenu', (e) => e.preventDefault(), { capture: true })

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const ground = scene.getObjectByName('ground') as THREE.Mesh || new THREE.Mesh(
    new THREE.PlaneGeometry(200,200),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  if (!scene.getObjectByName('ground')) {
    ground.rotation.x = -Math.PI/2
    ground.name = 'ground'
    scene.add(ground)
  }

  renderer.domElement.addEventListener('pointerdown', async (e) => {
    e.preventDefault()
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects(scene.children, true)
    if (!hits.length) return

    const point = hits[0].point
    const x = Math.floor(point.x + 0.5)
    const y = 0
    const z = Math.floor(point.z + 0.5)

    console.log('click', e.button, x, y, z) // <-- debug

    const body = {
      item_id: getActiveItem(),
      x, y, z,
      rotation_index: 0,
      client_req_id: crypto.randomUUID()
    }

    if (e.button === 0) {
      await supabase.functions.invoke('place_item', { body })
    } else if (e.button === 2) {
      await supabase.functions.invoke('remove_item', { body: {...body, world_id: 'main' } })
    }
  })
}
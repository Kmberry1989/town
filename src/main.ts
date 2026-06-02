import * as THREE from 'three'
import { createRenderer } from './renderer'
import { setScene, rebuildInstances } from './chunkManager'
import { useStore } from './store'
import { hydrate, subscribeChanges, placeIntent, removeIntent } from './supabase'
import { setupControls } from './controls'
import { makeMesh } from './items'

const canvas = document.getElementById('c') as HTMLCanvasElement
const renderer = createRenderer(canvas)
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0b0f14)
setScene(scene)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(8, 8, 8)
camera.lookAt(0,0,0)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(5,10,5)
scene.add(light)
scene.add(new THREE.AmbientLight(0x404040))

const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000,2000), new THREE.MeshStandardMaterial({ color: 0x1a242f }))
ground.rotation.x = -Math.PI/2
scene.add(ground)

let player = new THREE.Vector3(0,0,0)
let moveVec = { x:0, y:0 }

setupControls(
  document.getElementById('joy')!,
  document.getElementById('action')!,
  canvas,
  (x,y)=>{ moveVec.x = x; moveVec.y = -y },
  ()=>{},
  ()=>{},
  ()=>{},
  async ()=>{
    const gx = Math.floor(player.x)
    const gz = Math.floor(player.z)
    await removeIntent(gx,0,gz)
  }
)

canvas.addEventListener('click', async (e) => {
  const rect = canvas.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const hit = raycaster.intersectObject(ground)[0]
  if (hit) {
    const x = Math.floor(hit.point.x)
    const z = Math.floor(hit.point.z)
    await placeIntent('cube', x, 0, z, 0)
  }
})

const blocks = new Map<string, THREE.Object3D>()

async function addBlock(data: any) {
  const k = `${data.x},${data.y},${data.z}`
  if (blocks.has(k)) return
  const mesh = await makeMesh(data.item_id)
  mesh.position.set(data.x, data.y, data.z)
  scene.add(mesh)
  blocks.set(k, mesh)
}

await hydrate()
subscribeChanges(() => {
  rebuildInstances(useStore.getState().map, player.x, player.z)
})

function animate() {
  requestAnimationFrame(animate)
  player.x += moveVec.x * 0.05
  player.z += moveVec.y * 0.05
  camera.position.lerp(new THREE.Vector3(player.x + 8, 8, player.z + 8), 0.1)
  camera.lookAt(player.x, 0, player.z)
  rebuildInstances(useStore.getState().map, player.x, player.z)
  renderer.render(scene, camera)
}
animate()

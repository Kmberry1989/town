import * as THREE from 'three'

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
    alpha: false
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault()
    console.warn('Context lost')
  })
  canvas.addEventListener('webglcontextrestored', () => {
    console.warn('Context restored')
  })
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
  return renderer
}

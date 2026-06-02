import nipplejs from 'nipplejs'
import Hammer from 'hammerjs'

export function setupControls(joyEl: HTMLElement, actionEl: HTMLElement, canvas: HTMLElement, onMove: (x:number,y:number)=>void, onRotate: (delta:number)=>void, onPinch: (scale:number)=>void, onTapAction: ()=>void, onLongPressAction: ()=>void) {
  const manager = nipplejs.create({
    zone: joyEl,
    mode: 'static',
    position: { left: '70px', top: '70px' },
    size: 120,
    restOpacity: 0.8
  })
  manager.on('move', (_, data) => {
    if (!data.vector) return
    const v = data.vector
    const len = Math.hypot(v.x, v.y)
    const dz = 0.2
    if (len < dz) return onMove(0,0)
    const nx = v.x / len * ((len - dz) / (1 - dz))
    const ny = v.y / len * ((len - dz) / (1 - dz))
    onMove(nx, ny)
  })
  manager.on('end', () => onMove(0,0))

  const hammer = new Hammer(canvas)
  hammer.get('pinch').set({ enable: true })
  hammer.get('rotate').set({ enable: true })
  hammer.on('pinch', e => onPinch(e.scale))
  hammer.on('rotate', e => onRotate(e.rotation * Math.PI / 180))

  let pressTimer: number | null = null
  const start = () => {
    pressTimer = window.setTimeout(() => {
      pressTimer = null
      onLongPressAction()
    }, 500)
  }
  const cancel = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; onTapAction() } }
  actionEl.addEventListener('pointerdown', start)
  actionEl.addEventListener('pointerup', cancel)
  actionEl.addEventListener('pointerleave', () => { if (pressTimer) clearTimeout(pressTimer) })
}

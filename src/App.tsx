import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

type PrimitiveType = 'box' | 'sphere' | 'cylinder'
type ModelObject = {
  id: string
  name: string
  type: PrimitiveType
  position: [number, number, number]
  scale: [number, number, number]
}

const examples = [
  'Create a red cube',
  'Make a blue sphere',
  'Add a tall cylinder',
]

function createObject(prompt: string): ModelObject {
  const text = prompt.toLowerCase()
  let type: PrimitiveType = text.includes('sphere') || text.includes('ball') ? 'sphere' : text.includes('cylinder') ? 'cylinder' : 'box'
  const colorName = text.includes('blue') ? 'blue' : text.includes('green') ? 'green' : text.includes('yellow') ? 'yellow' : 'red'
  const id = crypto.randomUUID()
  return { id, name: `${colorName} ${type}`, type, position: [0, 0, 0], scale: type === 'cylinder' ? [1, 2, 1] : [1, 1, 1] }
}

export default function App() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [objects, setObjects] = useState<ModelObject[]>([
    { id: 'starter', name: 'Starter Cube', type: 'box', position: [0, 0, 0], scale: [1.4, 1.4, 1.4] },
  ])
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('Ready')

  useEffect(() => {
    if (!viewportRef.current) return
    const host = viewportRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x080a0f)

    const camera = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, 0.1, 1000)
    camera.position.set(5, 4, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.shadowMap.enabled = true
    host.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 0.7, 0)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x303040, 2))
    const key = new THREE.DirectionalLight(0xffffff, 3)
    key.position.set(4, 7, 5)
    key.castShadow = true
    scene.add(key)

    const grid = new THREE.GridHelper(20, 20, 0x39404f, 0x202530)
    scene.add(grid)
    scene.add(new THREE.AxesHelper(2))

    const meshes: THREE.Mesh[] = []
    objects.forEach((object) => {
      const geometry = object.type === 'sphere' ? new THREE.SphereGeometry(1, 32, 20) : object.type === 'cylinder' ? new THREE.CylinderGeometry(1, 1, 2, 32) : new THREE.BoxGeometry(2, 2, 2)
      const material = new THREE.MeshStandardMaterial({ color: object.name.includes('red') ? 0xef4444 : object.name.includes('blue') ? 0x3b82f6 : object.name.includes('green') ? 0x22c55e : object.name.includes('yellow') ? 0xeab308 : 0x8b5cf6, roughness: 0.35, metalness: 0.08 })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...object.position)
      mesh.scale.set(...object.scale)
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)
      meshes.push(mesh)
    })

    const resize = () => {
      camera.aspect = host.clientWidth / host.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(host.clientWidth, host.clientHeight)
    }
    window.addEventListener('resize', resize)
    let frame = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      controls.dispose()
      meshes.forEach((mesh) => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose() })
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
  }, [objects])

  const generate = () => {
    if (!prompt.trim()) return
    setStatus('Planner generated a model')
    setObjects((current) => [...current, createObject(prompt)])
    setPrompt('')
  }

  const save = () => {
    localStorage.setItem('three-ai-tool-project', JSON.stringify(objects))
    setStatus('Saved locally')
  }

  const load = () => {
    const saved = localStorage.getItem('three-ai-tool-project')
    if (!saved) return setStatus('No saved project yet')
    setObjects(JSON.parse(saved))
    setStatus('Loaded local project')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>3D AI Tool</span><small>V0.1</small></div>
        <div className="project-name">Untitled Project</div>
        <div className="top-actions"><button onClick={load}>Open</button><button onClick={save}>Save</button><button className="export" disabled>Export</button></div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="section-title">SCENE</div>
          <div className="scene-card">
            <div className="scene-icon">◈</div><div><strong>Scene</strong><span>{objects.length} object{objects.length === 1 ? '' : 's'}</span></div>
          </div>
          {objects.map((object) => <div className="object-row" key={object.id}><span>◇</span>{object.name}</div>)}
          <div className="sidebar-bottom"><div className="section-title">STATUS</div><div className="status">● {status}</div></div>
        </aside>

        <div className="viewport-panel">
          <div className="viewport" ref={viewportRef} />
          <div className="viewport-label"><span>Perspective</span><span>Orbit • Scroll to zoom</span></div>
        </div>

        <aside className="ai-panel">
          <div className="ai-header"><div><div className="section-title">AI BUILDER</div><h2>What should we make?</h2></div><span className="ai-dot" /></div>
          <p className="muted">Describe a model in natural language. This V0.1 uses a small local planner while the high-quality generation backend is being built.</p>
          <div className="examples">{examples.map((example) => <button key={example} onClick={() => setPrompt(example)}>{example}</button>)}</div>
          <div className="prompt-box"><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate() } }} placeholder="Describe your 3D model..." /><button onClick={generate} aria-label="Generate model">↑</button></div>
          <div className="ai-note">AI generation will later support detailed meshes, materials, textures, edits, and reference-image workflows.</div>
        </aside>
      </section>
    </main>
  )
}

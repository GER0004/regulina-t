import * as THREE from './vendor/three.module.js';

// Procedural, illustrative protein fold. No claim of a measured molecular structure.
export function createMolecule(stage, reduced) {
  const canvas = stage.querySelector('canvas');
  const button = document.querySelector('#molecule-motion');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x080f19, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  scene.add(new THREE.AmbientLight(0xc2dcec, 1.4));
  for (const [color, intensity, position] of [[0xd8edff, 5, [3, 4, 6]], [0xc77a52, 5, [-4, -1, 3]], [0x5088b1, 7, [0, 3, -4]]]) {
    const light = new THREE.DirectionalLight(color, intensity); light.position.set(...position); scene.add(light);
  }
  const group = new THREE.Group(); scene.add(group);
  const silver = new THREE.MeshStandardMaterial({ color: 0xacc8d8, metalness: 0.63, roughness: 0.3 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xbb8066, metalness: 0.48, roughness: 0.32 });
  const bondMaterial = new THREE.MeshStandardMaterial({ color: 0x658093, metalness: 0.4, roughness: 0.48 });
  const points = [];
  for (let i = 0; i < 210; i++) {
    const t = i / 209 * Math.PI * 8;
    const radius = 1.4 + 0.43 * Math.sin(t * 2.4);
    points.push(new THREE.Vector3(radius * Math.cos(t) + 0.42 * Math.sin(t * 5), 1.6 * Math.sin(t * 0.51) + 0.25 * Math.cos(t * 4), radius * Math.sin(t) * 0.68 + 0.2 * Math.cos(t * 3)));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 800, 0.055, 7, false), bondMaterial));
  const atomGeometry = new THREE.SphereGeometry(0.105, 14, 10);
  const atoms = new THREE.InstancedMesh(atomGeometry, silver, points.length);
  const matrix = new THREE.Matrix4();
  points.forEach((p, i) => { matrix.makeTranslation(p.x, p.y, p.z); atoms.setMatrixAt(i, matrix); });
  group.add(atoms);
  for (let k = 0; k < 7; k++) {
    const ribbonPoints = [];
    for (let i = 0; i < 70; i++) {
      const t = i / 69;
      const angle = t * Math.PI * 7 + k;
      ribbonPoints.push(new THREE.Vector3((k - 3) * 0.45 + Math.cos(angle) * 0.25, (t - 0.5) * 2.8, Math.sin(k * 1.5) * 0.7 + Math.sin(angle) * 0.25));
    }
    group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribbonPoints), 170, 0.075, 8, false), k % 3 === 0 ? copper : silver));
  }
  group.rotation.set(0.25, -0.45, -0.12);
  let visible = true, running = !reduced.matches, dragging = false, lastX = 0, lastY = 0, frame = 0, previous = 0, lost = false;
  function draw() { if (!lost) renderer.render(scene, camera); }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || !running || lost) return;
    if (!dragging) group.rotation.y += Math.min((now - previous) / 1000, 0.05) * 0.12;
    previous = now; draw(); frame = requestAnimationFrame(tick);
  }
  function sync() { cancelAnimationFrame(frame); frame = 0; previous = performance.now(); if (visible && !document.hidden && running && !lost) frame = requestAnimationFrame(tick); }
  function setMotion(value) { running = value; button.textContent = value ? 'Pause rotation' : 'Resume rotation'; button.setAttribute('aria-pressed', String(value)); sync(); }
  button.addEventListener('click', () => setMotion(!running));
  reduced.addEventListener('change', () => setMotion(!reduced.matches));
  document.addEventListener('visibilitychange', sync);
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button !== 0) return; dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!dragging) return; group.rotation.y += (e.clientX - lastX) * 0.008; group.rotation.x = Math.max(-1, Math.min(1, group.rotation.x + (e.clientY - lastY) * 0.003)); lastX = e.clientX; lastY = e.clientY; draw(); });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, () => { dragging = false; });
  function resize() { const { width, height } = stage.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.position.z = camera.aspect < 0.9 ? 14 : 12; camera.updateProjectionMatrix(); draw(); }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage); else addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(stage);
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; sync(); document.querySelector('#molecule-fallback').hidden = false; button.disabled = true; });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; document.querySelector('#molecule-fallback').hidden = true; button.disabled = false; resize(); sync(); });
  resize(); setMotion(running);
}

/* Lightweight Three.js decorative hero.
 * Usage: <canvas id="hero"></canvas>
 * <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
 * <script src="/assets/hero.js"></script>
 */
(() => {
  const c = document.getElementById('hero'); if(!c) return;
  const renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha:true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100); camera.position.z=4;
  const geo = new THREE.IcosahedronGeometry(2,3);
  const mat = new THREE.MeshStandardMaterial({ color:0xff8a2b, metalness:.3, roughness:.4, wireframe:true, opacity:.35, transparent:true });
  const mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
  const l1 = new THREE.PointLight(0xffb21a, 1.3); l1.position.set(3,2,3); scene.add(l1);
  const l2 = new THREE.PointLight(0x4aa3ff, .8); l2.position.set(-3,-2,-3); scene.add(l2);
  const resize = () => {
    const w=c.clientWidth, h=Math.max(260, c.clientHeight||window.innerHeight*.45);
    c.width=w*2; c.height=h*2; renderer.setSize(w*2,h*2,false);
    camera.aspect=w/h; camera.updateProjectionMatrix();
  };
  const clock = new THREE.Clock();
  const tick = () => { const t=clock.getElapsedTime(); mesh.rotation.x=t*.15; mesh.rotation.y=t*.1; renderer.render(scene,camera); requestAnimationFrame(tick); };
  window.addEventListener('resize', resize, {passive:true}); resize(); tick();
})();
// Pegasus Members — Solar System Showcase
// Requirements: Three.js available globally as THREE

(function() {
  const canvas = document.getElementById('universe');
  const card = document.getElementById('memberCard');
  const photoEl = document.getElementById('memberPhoto');
  const nameEl = document.getElementById('memberName');
  const roleEl = document.getElementById('memberRole');
  const closeBtn = document.getElementById('closeCard');

  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const maxDpr = isMobile ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070e, 20, 220);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 6, 26);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
  const sunLight = new THREE.PointLight(0xfff0c8, 2.0, 0, 2);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Background stars (adaptive)
  const starsGeometry = new THREE.BufferGeometry();
  const starCount = isMobile ? 700 : 1500;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 300 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i*3+0] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i*3+2] = r * Math.cos(phi);
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0x9fb3ff, size: 0.8, sizeAttenuation: true, transparent: true, opacity: 0.8 });
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // Sun
  const sunGeo = new THREE.SphereGeometry(2.8, 32, 32);
  const sunMat = new THREE.MeshStandardMaterial({ color: 0xffc34d, emissive: 0xffa000, emissiveIntensity: 0.5, metalness: 0.2, roughness: 0.4 });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sun);

  // Members data — update as needed
  const members = [
    { name: 'Aarav Sharma', role: 'President', photo: '/assets/members/aarav.jpg', color: 0x58d5ff },
    { name: 'Ishita Verma', role: 'Vice President', photo: '/assets/members/ishita.jpg', color: 0xff7eb6 },
    { name: 'Vivaan Gupta', role: 'Tech Lead', photo: '/assets/members/vivaan.jpg', color: 0x9dff7e },
    { name: 'Ananya Rao', role: 'Design Lead', photo: '/assets/members/ananya.jpg', color: 0xffdf6d },
    { name: 'Kabir Mehta', role: 'Events', photo: '/assets/members/kabir.jpg', color: 0xb58dff },
  ];

  // Planet system
  const planetGroup = new THREE.Group();
  scene.add(planetGroup);

  const orbitLines = [];
  const planets = [];
  const baseRadius = 6;
  const orbitGap = 4.2;

  for (let i = 0; i < members.length; i++) {
    const orbitRadius = baseRadius + i * orbitGap;

    // Orbit ring
    const ringGeo = new THREE.RingGeometry(orbitRadius - 0.02, orbitRadius + 0.02, 128);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x335566, opacity: 0.35, transparent: true, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    planetGroup.add(ring);
    orbitLines.push(ring);

    // Planet
    const planetSize = 0.8 + (i * 0.15);
    const geo = new THREE.SphereGeometry(planetSize, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: members[i].color, metalness: 0.35, roughness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(orbitRadius, 0, 0);
    mesh.userData = { index: i };
    planetGroup.add(mesh);
    planets.push({ mesh, orbitRadius, speed: 0.3 + i * 0.08, angle: Math.random() * Math.PI * 2 });
  }

  // Raycaster for clicks
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function onPointerMove(ev) {
    const rect = canvas.getBoundingClientRect();
    const x = ( (ev.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    pointer.set(x, y);
  }
  window.addEventListener('pointermove', onPointerMove);

  function openCard(idx) {
    const m = members[idx];
    if (!m) return;
    photoEl.src = m.photo || '/assets/pegasus-logo.png';
    nameEl.textContent = m.name;
    roleEl.textContent = m.role;
    card.classList.add('show');
  }
  function closeCard() { card.classList.remove('show'); }
  closeBtn.addEventListener('click', closeCard);

  function onClick() {
    raycaster.setFromCamera(pointer, camera);
    const planetMeshes = planets.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(planetMeshes, false);
    if (intersects.length > 0) {
      const first = intersects[0].object;
      const idx = first.userData.index;
      focusIndex(idx);
      openCard(idx);
    }
  }
  window.addEventListener('click', onClick);

  // Scroll navigation
  let focusedIndex = 0;
  function focusIndex(idx) {
    focusedIndex = (idx + members.length) % members.length;
    const r = planets[focusedIndex].orbitRadius;
    // Smooth camera tween-ish
    targetCameraPos.set(0, 3 + focusedIndex * 0.15, r + 6);
  }

  let scrollAccum = 0;
  function onWheel(ev) {
    scrollAccum += ev.deltaY;
    if (Math.abs(scrollAccum) > 60) {
      const dir = scrollAccum > 0 ? 1 : -1;
      focusIndex(focusedIndex + dir);
      scrollAccum = 0;
    }
  }
  window.addEventListener('wheel', onWheel, { passive: true });

  // Touch swipe navigation
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;
  function onTouchStart(e) {
    if (!e.touches || e.touches.length === 0) return;
    touchActive = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
  function onTouchEnd(e) {
    if (!touchActive) return;
    touchActive = false;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      // horizontal swipe
      const dir = dx < 0 ? 1 : -1; // swipe left = next
      focusIndex(focusedIndex + dir);
    } else if (Math.abs(dy) > 50) {
      // vertical swipe
      const dir = dy > 0 ? 1 : -1; // swipe down = next
      focusIndex(focusedIndex + dir);
    }
  }
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });

  // Resize
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // Camera controls (minimal manual tween)
  const targetCameraPos = new THREE.Vector3().copy(camera.position);

  // Animate with basic visibility/FPS-based degrade
  const clock = new THREE.Clock();
  let lastFpsSample = performance.now();
  let frames = 0;
  let qualityScale = 1; // 1 = full, 0.7 = reduced

  let isPaused = false;
  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });

  function animate() {
    if (isPaused) { requestAnimationFrame(animate); return; }
    const dt = Math.min(clock.getDelta(), 0.033);
    frames++;
    const now = performance.now();
    if (now - lastFpsSample > 1000) {
      const fps = frames * 1000 / (now - lastFpsSample);
      // If FPS drops, reduce animation complexity (slower rotations)
      qualityScale = fps < 30 ? 0.7 : 1;
      frames = 0; lastFpsSample = now;
    }

    // Subtle star twinkle
    stars.rotation.y += dt * 0.01 * qualityScale;

    // Spin the sun
    sun.rotation.y += dt * 0.15 * qualityScale;

    // Planets orbit
    for (const p of planets) {
      p.angle += dt * p.speed * qualityScale;
      p.mesh.position.set(Math.cos(p.angle) * p.orbitRadius, 0, Math.sin(p.angle) * p.orbitRadius);
      p.mesh.rotation.y += dt * 0.5;
    }

    // Ease camera toward target
    camera.position.lerp(targetCameraPos, (1 - Math.pow(0.001, dt)) * qualityScale);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Initial focus
  focusIndex(0);
})();
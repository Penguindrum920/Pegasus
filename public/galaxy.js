// Galaxy Generator - Mobile Optimized
console.log('Galaxy script starting...');

// Check for WebGL support
const hasWebGL = (() => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
})();

if (!hasWebGL) {
  console.log('WebGL not supported, using fallback');
  // Fallback to simple animation
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  
  let t = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
      // Simple star field
  for (let i = 0; i < 50; i++) {
    const x = (t * 0.5 + i * 100) % (canvas.width + 50);
    const y = canvas.height * 0.3 + Math.sin(t + i) * 20;
    const size = 1 + Math.sin(t * 2 + i) * 0.5;
    ctx.fillStyle = `hsla(180, 64%, 36%, ${0.4 + Math.sin(t + i) * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
    
    t += 0.02;
    requestAnimationFrame(animate);
  }
  animate();
} else {
  // Three.js Galaxy
  const canvas = document.getElementById('bg');
  const scene = new THREE.Scene();
  
  // Camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 5;
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Galaxy parameters (mobile optimized)
  const parameters = {
    count: Math.min(8000, Math.floor(window.innerWidth * 4)), // Adaptive particle count
    size: 0.02,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#219797', // Teal for center
    outsideColor: '#219797' // Same teal for all stars
  };
  
  let geometry = null;
  let material = null;
  let points = null;
  
  const generateGalaxy = () => {
    // Destroy old galaxy
    if (points !== null) {
      geometry.dispose();
      material.dispose();
      scene.remove(points);
    }
    
    geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);
    const scales = new Float32Array(parameters.count * 1);
    const randomness = new Float32Array(parameters.count * 3);
    
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);
    
    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      
      // Position
      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
      
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      
      positions[i3] = Math.cos(branchAngle + spinAngle) * radius;
      positions[i3 + 1] = randomY - 1; // Move galaxy center just beneath logo
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;
      
      // Color
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / parameters.radius);
      
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
      
      // Scale
      scales[i] = Math.random();
      
      // Randomness
      randomness[i3] = randomX;
      randomness[i3 + 1] = randomY;
      randomness[i3 + 2] = randomZ;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));
    
    // Material
    material = new THREE.ShaderMaterial({
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 15 * renderer.getPixelRatio() }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        
        attribute float aScale;
        attribute vec3 aRandomness;
        
        varying vec3 vColor;
        
        void main()
        {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          
          // Rotate
          float angle = atan(modelPosition.x, modelPosition.z);
          float distanceToCenter = length(modelPosition.xz);
          float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
          angle += angleOffset;
          modelPosition.x = cos(angle) * distanceToCenter;
          modelPosition.z = sin(angle) * distanceToCenter;

          // Randomness
          modelPosition.xyz += aRandomness;

          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          gl_Position = projectedPosition;

          gl_PointSize = uSize * aScale;
          gl_PointSize *= (1.0 / - viewPosition.z);

          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main()
        {
          // Create a smooth circular dot
          float strength = distance(gl_PointCoord, vec2(0.5));
          strength = 1.0 - strength;
          strength = pow(strength, 2.0); // Softer falloff for rounder dots
          
          // Add a bright center
          float center = 1.0 - distance(gl_PointCoord, vec2(0.5)) * 2.0;
          center = pow(center, 8.0);
          strength = max(strength, center * 0.3);

          vec3 color = mix(vec3(0.0), vColor, strength);
          gl_FragColor = vec4(color, strength);
        }
      `
    });
    
    points = new THREE.Points(geometry, material);
    scene.add(points);
  };
  
  // Generate galaxy
  generateGalaxy();
  
  // Clock
  const clock = new THREE.Clock();
  
  // Animation
  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    
    // Update material
    material.uniforms.uTime.value = elapsedTime;
    
    // Render
    renderer.render(scene, camera);
    
    requestAnimationFrame(tick);
  };
  
  tick();
  
  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
  
  // No loader needed
}

// Transition to game
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start');
  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const center = document.getElementById('center');
      if (center) {
        center.classList.add('fade-out');
        setTimeout(() => { window.location.href = '/members.html'; }, 380);
      }
    });
  }
});

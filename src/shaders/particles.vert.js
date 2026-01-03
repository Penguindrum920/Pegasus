// Vertex Shader - Controls particle position and size
//
// PURPOSE:
// This shader transforms each particle vertex based on audio frequency data.
// It creates organic, flowing movement using curl noise and audio-driven parameters.

export default `
varying float vDistance;

uniform float time;
uniform float offsetSize;
uniform float size;
uniform float offsetGain;
uniform float amplitude;
uniform float frequency;
uniform float maxDistance;

// Simplex noise functions for smooth random values
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

// 2D Simplex Noise by Ian McEwan, Ashima Arts
// WHY SIMPLEX: More efficient than Perlin, less directional artifacts
float noise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Curl noise - creates divergence-free vector field
// WHY: Produces flowing, organic movement without compression/expansion artifacts
// HOW: Takes derivatives of noise function to get curl (rotation) of field
vec3 curl(float x, float y, float z) {
  float eps = 1.0;
  float eps2 = 2.0 * eps;
  float n1, n2, a, b;
  
  // Add time to create continuous movement
  x += time * 0.05;
  y += time * 0.05;
  z += time * 0.05;
  
  vec3 curl = vec3(0.0);
  
  // Calculate curl.x
  n1 = noise(vec2(x, y + eps));
  n2 = noise(vec2(x, y - eps));
  a = (n1 - n2) / eps2;
  
  n1 = noise(vec2(x, z + eps));
  n2 = noise(vec2(x, z - eps));
  b = (n1 - n2) / eps2;
  
  curl.x = a - b;
  
  // Calculate curl.y
  n1 = noise(vec2(y, z + eps));
  n2 = noise(vec2(y, z - eps));
  a = (n1 - n2) / eps2;
  
  n1 = noise(vec2(x + eps, z));
  n2 = noise(vec2(x - eps, z));
  b = (n1 - n2) / eps2;
  
  curl.y = a - b;
  
  // Calculate curl.z
  n1 = noise(vec2(x + eps, y));
  n2 = noise(vec2(x - eps, y));
  a = (n1 - n2) / eps2;
  
  n1 = noise(vec2(y + eps, z));
  n2 = noise(vec2(y - eps, z));
  b = (n1 - n2) / eps2;
  
  curl.z = a - b;
  
  return curl;
}

void main() {
  vec3 newpos = position;
  
  // Calculate target position using curl noise
  // WHY: Normal provides outward direction, curl provides flow
  // AUDIO IMPACT: frequency controls detail, amplitude controls strength
  vec3 target = position + 
                (normal * 0.1) + 
                curl(newpos.x * frequency, 
                     newpos.y * frequency, 
                     newpos.z * frequency) * amplitude;
  
  // Calculate distance particle traveled (0-1 normalized)
  // WHY: Used for coloring - particles that moved more get different colors
  float d = length(newpos - target) / maxDistance;
  
  // Smoothly interpolate position based on distance
  // WHY: pow(d, 4) creates non-linear easing for more dramatic far movements
  newpos = mix(position, target, pow(d, 4.0));
  
  // Add audio-reactive z-axis pulsing
  // WHY: Mid frequencies drive this - creates depth pulsing effect
  newpos.z += sin(time) * (0.1 * offsetGain);
  
  // Transform to view space
  vec4 mvPosition = modelViewMatrix * vec4(newpos, 1.0);
  
  // Calculate point size
  // WHY: 
  // - Base size from uniform
  // - Additional size based on displacement (moved particles are bigger)
  // - Divide by -mvPosition.z for depth-based scaling (closer = bigger)
  gl_PointSize = size + (pow(d, 3.0) * offsetSize) * (1.0 / -mvPosition.z);
  
  // Final position
  gl_Position = projectionMatrix * mvPosition;
  
  // Pass distance to fragment shader for coloring
  vDistance = d;
}
`

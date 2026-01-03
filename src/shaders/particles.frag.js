// Fragment Shader - Controls particle appearance (color and opacity)

export default `
varying float vDistance;

uniform vec3 startColor;
uniform vec3 endColor;

// Create a smooth circle shape
// WHY: Without this, particles would be squares (the default)
// HOW: Uses distance from center, smoothstep for anti-aliasing
float circle(in vec2 _st, in float _radius) {
  vec2 dist = _st - vec2(0.5);
  return 1.0 - smoothstep(_radius - (_radius * 0.01),
                          _radius + (_radius * 0.01),
                          dot(dist, dist) * 4.0);
}

void main() {
  // Flip UV vertically (OpenGL convention)
  vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
  
  // Create circle mask
  vec3 circ = vec3(circle(uv, 1.0));
  
  // Mix between start and end color based on distance
  // WHY: Creates visual flow - you can see which particles are moving more
  // AUDIO IMPACT: More audio energy = more movement = more end color
  vec3 color = mix(startColor, endColor, vDistance);
  
  // Final color with alpha
  // WHY: Alpha based on circle shape AND distance creates soft, glowing particles
  // Particles that moved more are more opaque
  gl_FragColor = vec4(color, circ.r * vDistance);
}
`

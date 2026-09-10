#version 300 es
// Monochrome adaptation of React Bits Metallic Paint's reflection bands.
// Copyright (c) 2026 David Haz. See metal.LICENSE.md.
precision highp float;
in vec2 vP;
out vec4 oC;
uniform sampler2D u_tex;
uniform float u_time, u_ratio, u_imgRatio, u_liquid;
uniform vec2 u_pointer;

float metalBands(float t) {
  float c = mix(.2, .95, smoothstep(.03, .32, t));
  c = mix(c, .14, smoothstep(.37, .46, t));
  c = mix(c, .72, smoothstep(.52, .69, t));
  c = mix(c, .98, smoothstep(.72, .86, t));
  return mix(c, .2, smoothstep(.94, 1., t));
}

void main() {
  vec2 p = vP - .5;
  p.x *= u_ratio > u_imgRatio ? u_ratio / u_imgRatio : 1.;
  p.y *= u_ratio > u_imgRatio ? 1. : u_imgRatio / u_ratio;
  vec2 uv = vec2(p.x + .5, .5 - p.y);
  vec4 mask = texture(u_tex, uv);
  if (mask.a < .01) { oC = vec4(0.); return; }
  vec3 normal = normalize(mask.rgb * 2. - 1.);
  vec3 reflected = reflect(vec3(0., 0., -1.), normal);
  float time = u_time * .001;
  float flow = sin(uv.y * 5. + time * .7) * .025 * (1. + u_liquid);
  float field = reflected.x * .27 + reflected.y * .3 + uv.x * .18 + uv.y * .1;
  field += dot(u_pointer, vec2(.06, .04)) + flow + time * .08;
  float silver = metalBands(fract(field));
  // A soft grazing reflection preserves the silhouette in its darkest bands.
  silver = mix(silver, .8, pow(1. - normal.z, 3.) * .4);
  oC = vec4(vec3(silver) * mask.a, mask.a);
}

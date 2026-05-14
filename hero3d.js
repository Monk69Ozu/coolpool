(function () {
  'use strict';
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return;
  if (!window.WebGLRenderingContext) return;

  const T = window.THREE;
  if (!T) return;

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if (T.SRGBColorSpace) renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.60;

  const scene = new T.Scene();
  /* Matches the horizon fade colour in the water shader exactly — no visible seam */
  scene.background = new T.Color(0.88, 0.98, 1.00);

  /*
   * Camera steep enough that the entire frustum hits the water plane —
   * no sky strip visible, water fills 100 % of the canvas.
   */
  const camera = new T.PerspectiveCamera(52, 1, 0.1, 150);
  camera.position.set(0, 8.0, 5.5);
  camera.lookAt(0, 0.0, -2.0);

  /* ── Water plane with analytic normals ── */
  const geo = new T.PlaneGeometry(48, 48, 192, 192);

  const mat = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */`
      uniform float uTime;
      varying vec2  vUv;
      varying vec3  vPos;
      varying vec3  vNrm;
      varying float vH;

      vec4 waveData(vec2 p, vec2 d, float f, float s, float a) {
        vec2  dn = normalize(d);
        float ph = dot(p, dn) * f + uTime * s;
        return vec4(dn * cos(ph) * a * f, 0.0, sin(ph) * a);
      }

      void main() {
        vUv = uv;
        vec3 p = position;

        vec4 w1 = waveData(p.xz, vec2( 1.0,  0.5), 1.0, 0.48, 0.14);
        vec4 w2 = waveData(p.xz, vec2(-0.8,  1.0), 1.7, 0.36, 0.08);
        vec4 w3 = waveData(p.xz, vec2( 0.5, -0.9), 2.7, 0.62, 0.038);
        vec4 w4 = waveData(p.xz, vec2( 0.3,  1.0), 0.7, 0.26, 0.18);
        vec4 w5 = waveData(p.xz, vec2( 1.0, -0.3), 4.4, 0.88, 0.015);
        vec4 w6 = waveData(p.xz, vec2(-0.4, -0.8), 3.2, 0.54, 0.024);

        float h  = w1.w + w2.w + w3.w + w4.w + w5.w + w6.w;
        vec2  dh = w1.xy + w2.xy + w3.xy + w4.xy + w5.xy + w6.xy;

        p.y  += h;
        vH    = (h + 0.40) / 0.80;
        vNrm  = normalize(vec3(-dh.x, 1.0, -dh.y));
        vPos  = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying vec2  vUv;
      varying vec3  vPos;
      varying vec3  vNrm;
      varying float vH;

      void main() {
        /* ── Pool mosaic tiles visible through water ── */
        float tx = mod(vPos.x * 1.3 + 0.5, 1.0);
        float tz = mod(vPos.z * 1.3 + 0.5, 1.0);
        float grout = 1.0 - step(0.055, tx) * step(0.055, tz);
        vec3 tileCol = mix(
          vec3(0.38, 0.82, 0.93),   /* tile — vivid aqua      */
          vec3(0.94, 0.99, 1.00),   /* grout — near white     */
          grout
        );

        /* ── TEST: red water to verify cache busting ── */
        vec3 c0 = vec3(0.90, 0.10, 0.10);
        vec3 c1 = vec3(0.95, 0.20, 0.20);
        vec3 c2 = vec3(1.00, 0.40, 0.40);
        vec3 c3 = vec3(1.00, 0.70, 0.70);
        float t  = clamp(vH, 0.0, 1.0);
        vec3 col = mix(c0, c1, t);
        col = mix(col, c2, pow(t, 1.2) * 0.88);
        col = mix(col, c3, pow(t, 3.5) * 0.62);

        /* ── Diffuse sun lighting — brightens whole surface ── */
        vec3 sunDir  = normalize(vec3(1.6, 3.5, 0.8));
        float diffuse = max(dot(vNrm, sunDir), 0.0) * 0.40 + 0.62;
        col *= diffuse;

        /* Tiles shimmer through — more visible at crests */
        col = mix(col, tileCol * 0.88, clamp(vH * 0.50 + 0.12, 0.0, 0.56));

        /* ── Blinn-Phong sun specular ── */
        vec3 viewDir = normalize(cameraPosition - vPos);
        vec3 halfV   = normalize(sunDir + viewDir);
        float spec   = pow(max(dot(vNrm, halfV), 0.0), 85.0);
        col += spec * 1.10 * vec3(1.0, 0.97, 0.88);

        /* ── Fresnel rim ── */
        float fresnel = pow(1.0 - max(dot(vNrm, viewDir), 0.0), 3.0);
        col = mix(col, vec3(0.84, 0.97, 1.00), fresnel * 0.42);

        /* ── Caustic shimmer (golden sunlight) ── */
        float ca = sin(vUv.x * 36.0 + uTime * 1.30) * sin(vUv.y * 29.0 + uTime * 0.95);
        float cb = sin(vUv.x * 21.0 - uTime * 0.74) * sin(vUv.y * 17.0 + uTime * 1.20);
        float cc = sin(vUv.x * 54.0 + uTime * 0.90) * sin(vUv.y * 49.0 - uTime * 1.06);
        col += (ca*ca + cb*cb + cc*cc*0.4) * 0.055 * vec3(1.0, 0.90, 0.60);

        /* ── Edge fade — blends seamlessly into background ── */
        float edgeDist = length(vPos.xz) / 18.0;
        col = mix(col, vec3(0.88, 0.98, 1.00), clamp(edgeDist * edgeDist * 0.80, 0.0, 1.0));

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const mesh = new T.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  function resize() {
    const w = canvas.offsetWidth  || window.innerWidth;
    const h = canvas.offsetHeight || window.innerHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let alive = true;
  const clock = new T.Clock();
  (function tick() {
    if (!alive) return;
    requestAnimationFrame(tick);
    mat.uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  })();

  window.__heroStop = function () {
    alive = false;
    window.removeEventListener('resize', resize);
    renderer.dispose(); mat.dispose(); geo.dispose();
    window.__heroStop = null;
  };
})();

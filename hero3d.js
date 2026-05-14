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
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new T.Scene();
  scene.background = new T.Color(0x5dcff0);

  /* Camera — gentle angle across bright pool surface */
  const camera = new T.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 3.2, 7.2);
  camera.lookAt(0, 0.4, -1);

  /* Water plane */
  const geo = new T.PlaneGeometry(28, 28, 160, 160);

  const mat = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */`
      uniform float uTime;
      varying float vH;
      varying vec2  vUv;
      varying vec3  vPos;

      float wave(vec2 p, vec2 d, float f, float s, float a) {
        return sin(dot(p, normalize(d)) * f + uTime * s) * a;
      }

      void main() {
        vUv = uv;
        vec3 p = position;

        float h  = wave(p.xz, vec2( 1.0,  0.5), 1.0, 0.48, 0.13);
              h += wave(p.xz, vec2(-0.8,  1.0), 1.7, 0.36, 0.07);
              h += wave(p.xz, vec2( 0.5, -0.9), 2.7, 0.62, 0.035);
              h += wave(p.xz, vec2( 0.3,  1.0), 0.7, 0.26, 0.17);
              h += wave(p.xz, vec2( 1.0, -0.3), 4.4, 0.88, 0.014);
              h += wave(p.xz, vec2(-0.4, -0.8), 3.2, 0.54, 0.022);

        p.y   += h;
        vH     = (h + 0.38) / 0.76;
        vPos   = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying float vH;
      varying vec2  vUv;
      varying vec3  vPos;

      void main() {
        /* Bright pool water palette */
        vec3 c0 = vec3(0.04, 0.40, 0.68);   /* deep pool blue */
        vec3 c1 = vec3(0.08, 0.64, 0.82);   /* mid turquoise */
        vec3 c2 = vec3(0.18, 0.84, 0.90);   /* bright aqua */
        vec3 c3 = vec3(0.72, 0.96, 1.00);   /* bright crest/foam */

        float t   = clamp(vH, 0.0, 1.0);
        vec3  col = mix(c0, c1, t);
        col = mix(col, c2, pow(t, 1.6) * 0.80);
        col = mix(col, c3, pow(t, 4.0) * 0.55);

        /* Golden sunlight caustics */
        float ca = sin(vUv.x * 34.0 + uTime * 1.25) * sin(vUv.y * 27.0 + uTime * 0.95);
        float cb = sin(vUv.x * 19.0 - uTime * 0.72) * sin(vUv.y * 15.0 + uTime * 1.18);
        float cc = sin(vUv.x * 52.0 + uTime * 0.88) * sin(vUv.y * 47.0 - uTime * 1.04);
        col += (ca * ca + cb * cb + cc * cc * 0.5) * 0.068 * vec3(1.0, 0.90, 0.65);

        /* Subtle radial vignette */
        vec2 uv2 = vUv * 2.0 - 1.0;
        col *= pow(max(1.0 - dot(uv2 * 0.36, uv2 * 0.36), 0.0), 0.20);

        /* Horizon fade to bright sky */
        float d = length(vPos.xz) / 13.0;
        col = mix(col, vec3(0.40, 0.84, 0.96), clamp(d * d * 0.42, 0.0, 0.72));

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const mesh = new T.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  /* Resize */
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

  /* Render loop */
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

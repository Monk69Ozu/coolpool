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
  renderer.toneMappingExposure = 1.12;

  const scene = new T.Scene();
  scene.background = new T.Color(0x79cef0);

  /* Camera — gentle top-down angle showing pool surface */
  const camera = new T.PerspectiveCamera(52, 1, 0.1, 150);
  camera.position.set(0, 4.5, 8.5);
  camera.lookAt(0, 0.0, -2.0);

  /* ── Sky gradient backdrop ── */
  const skyGeo = new T.PlaneGeometry(300, 60);
  const skyMat = new T.ShaderMaterial({
    uniforms: {},
    depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      void main(){
        vec3 top = vec3(0.28, 0.65, 0.92);
        vec3 hor = vec3(0.62, 0.90, 1.00);
        gl_FragColor = vec4(mix(hor, top, pow(vUv.y, 0.6)), 1.0);
      }`,
  });
  const skyMesh = new T.Mesh(skyGeo, skyMat);
  skyMesh.position.set(0, 14, -55);
  skyMesh.rotation.x = 0.12;
  scene.add(skyMesh);

  /* ── Water plane with analytic normals ── */
  const geo = new T.PlaneGeometry(40, 40, 180, 180);

  const mat = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */`
      uniform float uTime;
      varying vec2  vUv;
      varying vec3  vPos;
      varying vec3  vNrm;
      varying float vH;

      /* Returns (dx, dz, _, height) for one sine wave */
      vec4 waveData(vec2 p, vec2 d, float f, float s, float a) {
        vec2 dn  = normalize(d);
        float ph = dot(p, dn) * f + uTime * s;
        return vec4(dn * cos(ph) * a * f, 0.0, sin(ph) * a);
      }

      void main() {
        vUv = uv;
        vec3 p = position;

        vec4 w1 = waveData(p.xz, vec2( 1.0,  0.5), 1.0, 0.48, 0.13);
        vec4 w2 = waveData(p.xz, vec2(-0.8,  1.0), 1.7, 0.36, 0.07);
        vec4 w3 = waveData(p.xz, vec2( 0.5, -0.9), 2.7, 0.62, 0.035);
        vec4 w4 = waveData(p.xz, vec2( 0.3,  1.0), 0.7, 0.26, 0.17);
        vec4 w5 = waveData(p.xz, vec2( 1.0, -0.3), 4.4, 0.88, 0.014);
        vec4 w6 = waveData(p.xz, vec2(-0.4, -0.8), 3.2, 0.54, 0.022);

        float h  = w1.w + w2.w + w3.w + w4.w + w5.w + w6.w;
        vec2  dh = w1.xy + w2.xy + w3.xy + w4.xy + w5.xy + w6.xy;

        p.y  += h;
        vH    = (h + 0.38) / 0.76;
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
        /* ── Pool tile floor visible through water ── */
        float tx = mod(vPos.x * 1.5 + 0.5, 1.0);
        float tz = mod(vPos.z * 1.5 + 0.5, 1.0);
        float isGrout = 1.0 - step(0.07, tx) * step(0.07, tz);
        vec3 tileCol  = mix(vec3(0.58, 0.88, 0.92), vec3(0.88, 0.97, 0.98), isGrout);

        /* ── Water depth palette ── */
        vec3 c0 = vec3(0.02, 0.30, 0.58);   /* deep */
        vec3 c1 = vec3(0.06, 0.56, 0.78);   /* mid  */
        vec3 c2 = vec3(0.14, 0.80, 0.88);   /* shallow turquoise */
        vec3 c3 = vec3(0.68, 0.96, 1.00);   /* crest */
        float t  = clamp(vH, 0.0, 1.0);
        vec3 col = mix(c0, c1, t);
        col = mix(col, c2, pow(t, 1.5) * 0.78);
        col = mix(col, c3, pow(t, 4.0) * 0.52);

        /* Tiles shimmer through from below */
        float tileVis = clamp(vH * 0.45 + 0.10, 0.0, 0.52);
        col = mix(col, tileCol * 0.78, tileVis);

        /* ── Blinn-Phong sun specular ── */
        vec3 sunDir  = normalize(vec3(1.6, 3.2, 1.0));
        vec3 viewDir = normalize(cameraPosition - vPos);
        vec3 halfV   = normalize(sunDir + viewDir);
        float spec   = pow(max(dot(vNrm, halfV), 0.0), 90.0);
        col += spec * 0.70 * vec3(1.0, 0.95, 0.78);

        /* ── Fresnel rim ── */
        float fresnel = pow(1.0 - max(dot(vNrm, viewDir), 0.0), 3.2);
        col = mix(col, vec3(0.75, 0.95, 1.00), fresnel * 0.42);

        /* ── Caustic shimmer ── */
        float ca = sin(vUv.x * 34.0 + uTime * 1.25) * sin(vUv.y * 27.0 + uTime * 0.95);
        float cb = sin(vUv.x * 19.0 - uTime * 0.72) * sin(vUv.y * 15.0 + uTime * 1.18);
        float cc = sin(vUv.x * 52.0 + uTime * 0.88) * sin(vUv.y * 47.0 - uTime * 1.04);
        col += (ca * ca + cb * cb + cc * cc * 0.4) * 0.058 * vec3(1.0, 0.90, 0.62);

        /* ── Horizon/edge fade into sky ── */
        float edgeDist = length(vPos.xz) / 16.0;
        col = mix(col, vec3(0.50, 0.84, 0.96), clamp(edgeDist * edgeDist * 0.62, 0.0, 0.88));

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
    skyMat.dispose(); skyGeo.dispose();
    window.__heroStop = null;
  };
})();

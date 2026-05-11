/* Three.js Hero — realistic pool scene v2
   Improvements over prototype:
   - Sun disc with atmospheric glow in sky
   - Wide stone/travertine deck (3 m surround)
   - Pool side walls with tiled shader
   - Distant garden treeline silhouette
   - Caustic floor + Fresnel water (unchanged)
   Fallback: CSS gradient on reduced-motion / no-WebGL */
(function () {
  const hero   = document.getElementById('hero-canvas-wrap');
  const canvas = document.getElementById('hero-canvas');
  if (!hero || !canvas) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowEnd  = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  if (reduced || lowEnd || !window.WebGLRenderingContext) {
    hero.classList.add('no-webgl'); return;
  }

  const T = window.THREE;
  if (!T) { hero.classList.add('no-webgl'); return; }

  let renderer;
  try {
    renderer = new T.WebGLRenderer({
      canvas, antialias: true, alpha: false,
      powerPreference: 'high-performance'
    });
  } catch (e) { hero.classList.add('no-webgl'); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0xb0d8ef, 0.018);

  /* ── Camera: pool-edge level, looking across clear water ── */
  const W = hero.clientWidth  || 1;
  const H = hero.clientHeight || 1;
  const camera = new T.PerspectiveCamera(44, W / H, 0.1, 300);
  camera.position.set(0, 2.8, 10);
  camera.lookAt(0, 0.2, 0);

  /* ── Sky ── */
  const skyMat = new T.ShaderMaterial({
    side: T.BackSide,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPos;
      void main(){
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPos;

      void main(){
        // Sky gradient: horizon haze → deep blue zenith
        vec3 zenith  = vec3(0.22, 0.48, 0.82);
        vec3 mid     = vec3(0.52, 0.74, 0.95);
        vec3 horizon = vec3(0.80, 0.90, 0.98);

        float h = clamp(vUv.y, 0.0, 1.0);
        vec3 col = mix(horizon, mid, smoothstep(0.0, 0.28, h));
        col = mix(col, zenith,  smoothstep(0.28, 0.75, h));

        // Atmospheric haze band at horizon
        float haze = (1.0 - smoothstep(0.0, 0.22, h)) * 0.55;
        col = mix(col, vec3(0.88, 0.94, 1.0), haze);

        // Sun disc — fixed direction, slight shimmer
        vec3 sunDir = normalize(vec3(0.55 + sin(uTime*0.10)*0.04, 0.55, -0.70));
        vec3 fragDir = normalize(vPos);
        float sun = dot(fragDir, sunDir);

        // Hard disc
        float disc = smoothstep(0.9985, 0.9996, sun);
        col = mix(col, vec3(1.0, 0.98, 0.88), disc);

        // Corona / glow rings
        float corona1 = smoothstep(0.992,  0.9985, sun) * 0.55;
        float corona2 = smoothstep(0.975,  0.992,  sun) * 0.22;
        float corona3 = smoothstep(0.940,  0.975,  sun) * 0.08;
        col += vec3(1.0, 0.92, 0.70) * corona1;
        col += vec3(1.0, 0.88, 0.60) * corona2;
        col += vec3(0.9, 0.78, 0.55) * corona3;

        // Subtle cloud wisps
        float cloud = sin(vUv.x * 9.0 + uTime * 0.035) * 0.5 + 0.5;
        cloud *= cos(vUv.x * 5.3 - uTime * 0.025) * 0.5 + 0.5;
        cloud *= smoothstep(0.45, 0.82, h) * 0.10;
        col += cloud;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const sky = new T.Mesh(new T.SphereGeometry(140, 24, 14), skyMat);
  scene.add(sky);

  /* ── Distant treeline silhouette ── */
  const treeMat = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;

      float treeLine(vec2 uv){
        // Composite noise for organic skyline
        float x = uv.x * 12.0;
        float n =
          sin(x * 1.1 + 0.3) * 0.28 +
          sin(x * 2.3 - 0.7) * 0.18 +
          sin(x * 4.7 + 1.2) * 0.09 +
          sin(x * 9.1 - 0.5) * 0.04;
        n = n * 0.5 + 0.55; // normalise to [~0.18 .. ~0.82]
        return n;
      }

      void main(){
        float skyline = treeLine(vUv);
        float alpha = 1.0 - smoothstep(skyline - 0.04, skyline + 0.04, vUv.y);
        vec3 col = mix(vec3(0.14, 0.26, 0.20), vec3(0.22, 0.38, 0.28), vUv.y * 2.5);
        gl_FragColor = vec4(col, alpha * 0.88);
      }
    `
  });
  const treeGeo = new T.PlaneGeometry(130, 14);
  const trees   = new T.Mesh(treeGeo, treeMat);
  trees.position.set(0, 4.5, -50);
  scene.add(trees);

  /* ── Pool floor: large-format tiles with caustic shader ── */
  const floorMat = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;

      float tile(vec2 uv, float size){
        vec2 g = fract(uv * size);
        float line = min(g.x, min(1.0-g.x, min(g.y, 1.0-g.y)));
        return smoothstep(0.0, 0.03, line);
      }

      float caustic(vec2 p, float t){
        float c = 0.0;
        float freq = 6.28;
        c += sin(p.x * freq * 0.9 + t * 1.10) * cos(p.y * freq * 1.1 + t * 0.85);
        c += sin(p.x * freq * 1.3 - t * 0.95) * cos(p.y * freq * 0.8 + t * 1.20);
        c += sin((p.x + p.y) * freq * 0.7 + t * 1.40);
        c = pow(abs(c / 3.0), 2.5);
        return c;
      }

      void main(){
        vec3 tileDark  = vec3(0.22, 0.54, 0.72);
        vec3 tileLight = vec3(0.36, 0.68, 0.84);
        vec3 grout     = vec3(0.55, 0.72, 0.82);

        float t = tile(vUv, 9.0);
        vec3 base = mix(grout, mix(tileDark, tileLight, fract(vUv.x * 9.0 + vUv.y * 9.0)), t);

        float c = caustic(vUv * 2.8, uTime * 0.55);
        vec3 caustCol = vec3(1.0, 0.95, 0.75) * c * 0.55;

        float depth = 1.0 - smoothstep(0.1, 0.5, length(vUv - 0.5) * 1.4);
        base = mix(base * 0.8, base, depth);

        gl_FragColor = vec4(base + caustCol, 1.0);
      }
    `
  });
  const floor = new T.Mesh(new T.PlaneGeometry(26, 26, 1, 1), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.6;
  scene.add(floor);

  /* ── Pool side walls (inner faces, tiled) ── */
  const wallMat = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uCausticScale: { value: 1.0 } },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPos;
      void main(){
        vUv = uv; vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;

      float tile(vec2 uv, float size){
        vec2 g = fract(uv * size);
        float line = min(g.x, min(1.0-g.x, min(g.y, 1.0-g.y)));
        return smoothstep(0.0, 0.025, line);
      }

      float caustic(vec2 p, float t){
        float c = 0.0;
        c += sin(p.x * 6.28 * 0.9 + t * 1.10) * cos(p.y * 6.28 * 1.1 + t * 0.85);
        c += sin(p.x * 6.28 * 1.3 - t * 0.95) * cos(p.y * 6.28 * 0.8 + t * 1.20);
        c = pow(abs(c / 2.0), 2.2);
        return c;
      }

      void main(){
        vec3 tileDark  = vec3(0.24, 0.56, 0.74);
        vec3 tileLight = vec3(0.38, 0.70, 0.86);
        vec3 grout     = vec3(0.58, 0.74, 0.84);

        float t = tile(vUv, vec2(9.0, 4.0).x);
        vec3 base = mix(grout, mix(tileDark, tileLight, fract(vUv.x * 9.0)), t);

        // Caustics stronger near top (underwater light)
        float depthFade = 1.0 - vUv.y;
        float c = caustic(vUv * 1.8, uTime * 0.50) * depthFade * 0.45;
        base += vec3(1.0, 0.95, 0.75) * c;

        // Slight darkening at bottom
        base *= 0.75 + vUv.y * 0.30;

        gl_FragColor = vec4(base, 1.0);
      }
    `
  });

  // 4 walls: back (z=-13), left (x=-13), right (x=13), front (x=13 behind camera)
  const POOL_HALF = 13.0;
  const WALL_DEPTH = 2.6; // floor at -2.6, water at 0

  // Back wall
  const backWall = new T.Mesh(new T.PlaneGeometry(POOL_HALF * 2, WALL_DEPTH), wallMat);
  backWall.position.set(0, -WALL_DEPTH / 2, -POOL_HALF);
  scene.add(backWall);

  // Left wall
  const leftWall = new T.Mesh(new T.PlaneGeometry(POOL_HALF * 2, WALL_DEPTH), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-POOL_HALF, -WALL_DEPTH / 2, 0);
  scene.add(leftWall);

  // Right wall
  const rightWall = new T.Mesh(new T.PlaneGeometry(POOL_HALF * 2, WALL_DEPTH), wallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(POOL_HALF, -WALL_DEPTH / 2, 0);
  scene.add(rightWall);

  /* ── Wide pool deck / coping rim (3 m surround) ── */
  const DECK_OUTER = 22.0; // deck extends to ±22 (9 m wide on each side)
  const DECK_INNER = POOL_HALF; // pool edge

  const deckShape = new T.Shape();
  deckShape.moveTo(-DECK_OUTER, -DECK_OUTER);
  deckShape.lineTo( DECK_OUTER, -DECK_OUTER);
  deckShape.lineTo( DECK_OUTER,  DECK_OUTER);
  deckShape.lineTo(-DECK_OUTER,  DECK_OUTER);
  deckShape.lineTo(-DECK_OUTER, -DECK_OUTER);

  const deckHole = new T.Path();
  deckHole.moveTo(-DECK_INNER, -DECK_INNER);
  deckHole.lineTo( DECK_INNER, -DECK_INNER);
  deckHole.lineTo( DECK_INNER,  DECK_INNER);
  deckHole.lineTo(-DECK_INNER,  DECK_INNER);
  deckHole.lineTo(-DECK_INNER, -DECK_INNER);
  deckShape.holes.push(deckHole);

  const deckGeo = new T.ExtrudeGeometry(deckShape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    bevelSegments: 2
  });

  // Travertine/limestone deck — warm cream with subtle texture shader
  const deckMat = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPos;
      void main(){
        vUv = uv; vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPos;

      float noise(vec2 p){
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.545);
      }

      void main(){
        // Large-format stone tiles on deck surface
        vec2 tileUv = vPos.xz * 0.18; // ~60cm tiles
        vec2 g = fract(tileUv);
        float groutLine = 1.0 - smoothstep(0.0, 0.04, min(g.x, min(1.0-g.x, min(g.y, 1.0-g.y))));

        // Stone base: warm cream/travertine
        vec3 stone = vec3(0.90, 0.86, 0.78);
        // Slight variation per tile
        float tileId = noise(floor(tileUv));
        stone += (tileId - 0.5) * 0.06;

        vec3 grout = vec3(0.75, 0.72, 0.66);
        vec3 col = mix(stone, grout, groutLine * 0.5);

        // Subtle wetness near pool edge
        float wetness = 1.0 - smoothstep(0.0, 2.5, abs(vPos.x) - DECK_INNER_R);
        wetness += 1.0 - smoothstep(0.0, 2.5, abs(vPos.z) - DECK_INNER_R);
        wetness = clamp(wetness, 0.0, 1.0) * 0.18;
        col = mix(col, col * 0.70, wetness);

        gl_FragColor = vec4(col, 1.0);
      }
    `.replace(/DECK_INNER_R/g, DECK_INNER.toFixed(1)),
    side: T.DoubleSide
  });

  const deck = new T.Mesh(deckGeo, deckMat);
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = -0.04;
  scene.add(deck);

  /* ── Deck coping strip (polished edge) ── */
  const copingMat = new T.MeshStandardMaterial({
    color: 0xe8e0d2,
    roughness: 0.4,
    metalness: 0.05,
  });
  // A thin strip right at the pool edge
  const copingShape = new T.Shape();
  const CI = DECK_INNER, CO = DECK_INNER + 0.55;
  copingShape.moveTo(-CO, -CO); copingShape.lineTo(CO, -CO); copingShape.lineTo(CO, CO); copingShape.lineTo(-CO, CO); copingShape.lineTo(-CO, -CO);
  const copingHole = new T.Path();
  copingHole.moveTo(-CI, -CI); copingHole.lineTo(CI, -CI); copingHole.lineTo(CI, CI); copingHole.lineTo(-CI, CI); copingHole.lineTo(-CI, -CI);
  copingShape.holes.push(copingHole);
  const copingGeo = new T.ExtrudeGeometry(copingShape, { depth: 0.10, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 });
  const coping = new T.Mesh(copingGeo, copingMat);
  coping.rotation.x = -Math.PI / 2;
  coping.position.y = 0.04;
  scene.add(coping);

  /* ── Water surface (Fresnel + Gerstner waves) ── */
  const waterMat = new T.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime:   { value: 0 },
      uSunDir: { value: new T.Vector3(0.55, 0.8, 0.35).normalize() },
    },
    vertexShader: `
      uniform float uTime;
      varying vec3  vWorldPos;
      varying vec3  vNormal;
      varying vec2  vUv;

      vec3 gerstner(vec2 pos, vec2 dir, float A, float L, float speed, float t){
        float k = 6.2832 / L;
        float phase = dot(dir, pos) * k - speed * t;
        float s = sin(phase), c = cos(phase);
        return vec3(-dir.x * A * s, A * c - A, -dir.y * A * s);
      }

      void main(){
        vUv = uv;
        vec3 p = position;

        vec3 w1 = gerstner(p.xy, vec2( 1.0, 0.6), 0.055, 5.2, 0.80, uTime);
        vec3 w2 = gerstner(p.xy, vec2(-0.7, 1.0), 0.040, 3.8, 1.10, uTime);
        vec3 w3 = gerstner(p.xy, vec2( 0.5,-0.8), 0.025, 2.2, 1.60, uTime);
        vec3 w4 = gerstner(p.xy, vec2( 0.9, 0.3), 0.018, 1.5, 2.10, uTime);
        vec3 w5 = gerstner(p.xy, vec2(-0.3, 0.9), 0.012, 1.1, 2.80, uTime);
        p += w1 + w2 + w3 + w4 + w5;

        vNormal = normalize(vec3(-(w1.x+w2.x+w3.x)*6.0, 1.0, -(w1.z+w2.z+w3.z)*6.0));
        vWorldPos = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3  uSunDir;
      uniform float uTime;
      varying vec3  vWorldPos;
      varying vec3  vNormal;
      varying vec2  vUv;

      void main(){
        vec3 N = normalize(vNormal);
        vec3 viewPos = vec3(0.0, 2.8, 10.0);
        vec3 V = normalize(viewPos - vWorldPos);

        float NdotV = max(0.0, dot(N, V));
        float fresnel = 0.08 + 0.85 * pow(1.0 - NdotV, 4.0);

        vec3 shallow = vec3(0.22, 0.72, 0.82);
        vec3 deep    = vec3(0.05, 0.38, 0.60);
        float depth  = smoothstep(0.4, 1.0, 1.0 - vUv.y);
        vec3 waterCol = mix(shallow, deep, depth);

        // Sky reflection — matches improved sky gradient
        vec3 skyRefl = mix(vec3(0.52, 0.74, 0.95), vec3(0.22, 0.48, 0.82), N.y * 0.5 + 0.5);
        skyRefl += N.y * 0.12;

        vec3 col = mix(waterCol, skyRefl, fresnel * 0.78);

        // Sun specular
        vec3 H = normalize(V + uSunDir);
        float spec = pow(max(0.0, dot(N, H)), 200.0);
        col += vec3(1.0, 0.97, 0.88) * spec * 2.2;

        // Sparkle micro-facets
        float spark = sin(vWorldPos.x * 22.0 + uTime * 2.8) *
                      cos(vWorldPos.z * 18.0 + uTime * 2.2);
        col += vec3(1.0, 0.98, 0.88) * pow(max(0.0, spark), 8.0) * 0.4;

        // Edge foam near coping
        float rimDist = 1.0 - smoothstep(11.5, 13.0, max(abs(vWorldPos.x), abs(vWorldPos.z)));
        col = mix(col, vec3(0.94, 0.97, 1.0), rimDist * 0.38 * (N.y * 0.5 + 0.5));

        float alpha = 0.88 + N.y * 0.08;
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
  const water = new T.Mesh(new T.PlaneGeometry(26, 26, 160, 160), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.0;
  scene.add(water);

  /* ── Lighting ── */
  scene.add(new T.AmbientLight(0xc8e8f8, 0.55));

  const sun = new T.DirectionalLight(0xfff6e8, 1.5);
  sun.position.set(8, 18, -14);
  scene.add(sun);

  const fill = new T.DirectionalLight(0x88cce8, 0.35);
  fill.position.set(-8, 5, -6);
  scene.add(fill);

  // Soft bounce from deck
  const bounce = new T.DirectionalLight(0xf4ede0, 0.18);
  bounce.position.set(0, -1, 4);
  scene.add(bounce);

  /* ── Resize ── */
  function resize() {
    const w = hero.clientWidth  || 1;
    const h = hero.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(hero);

  /* ── Parallax ── */
  let tX = 0, tY = 0, cX = 0, cY = 0;
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    tX = ((e.clientX - r.left) / r.width  - 0.5) * 1.2;
    tY = ((e.clientY - r.top)  / r.height - 0.5) * 0.4;
  });
  hero.addEventListener('pointerleave', () => { tX = 0; tY = 0; });

  /* ── Loop ── */
  const clock = new T.Clock();
  let visible = true;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(hero);

  (function loop() {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();

    waterMat.uniforms.uTime.value  = t;
    floorMat.uniforms.uTime.value  = t;
    wallMat.uniforms.uTime.value   = t;
    skyMat.uniforms.uTime.value    = t;
    deckMat.uniforms.uTime.value   = t;

    // Gently drift sun direction for dynamic caustics
    waterMat.uniforms.uSunDir.value.set(
      0.55 + Math.sin(t * 0.12) * 0.08,
      0.8,
      0.35 + Math.cos(t * 0.09) * 0.06
    ).normalize();

    cX += (tX - cX) * 0.03;
    cY += (tY - cY) * 0.03;
    camera.position.set(cX * 1.5, 2.8 - cY * 0.5, 10);
    camera.lookAt(0, 0.2, 0);

    renderer.render(scene, camera);
  })();
})();

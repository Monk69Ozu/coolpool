/* Three.js Hero — realistic pool scene
   - Fresnel water shader (reflection/refraction)
   - Animated caustic light patterns on tiled floor
   - Sparkle specular highlights
   - Pool deck rim
   - No cartoon objects
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
  renderer.toneMappingExposure = 1.15;

  const scene = new T.Scene();
  scene.background = new T.Color(0x7ec8e3);

  /* ── Camera: pool-edge level, looking across clear water ── */
  const W = hero.clientWidth  || 1;
  const H = hero.clientHeight || 1;
  const camera = new T.PerspectiveCamera(44, W / H, 0.1, 200);
  camera.position.set(0, 2.8, 10);
  camera.lookAt(0, 0.2, 0);

  /* ── Sky (procedural gradient background plane) ── */
  const skyMat = new T.ShaderMaterial({
    side: T.BackSide,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main(){
        vec3 top    = vec3(0.36, 0.62, 0.88);
        vec3 horiz  = vec3(0.70, 0.88, 0.98);
        float t = smoothstep(0.0, 0.55, vUv.y);
        vec3 col = mix(horiz, top, t);
        // faint cloud wisps
        float cloud = sin(vUv.x * 8.0 + uTime * 0.04) * 0.5 + 0.5;
        cloud *= smoothstep(0.5, 0.85, vUv.y) * 0.08;
        col += cloud;
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const skyGeo = new T.SphereGeometry(90, 20, 10);
  const sky    = new T.Mesh(skyGeo, skyMat);
  scene.add(sky);

  /* ── Pool floor: large-format tiles with caustic shader ── */
  const floorGeo = new T.PlaneGeometry(26, 26, 1, 1);
  const floorMat = new T.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;

      // Tile pattern (large format, 50cm tiles)
      float tile(vec2 uv, float size){
        vec2 g = fract(uv * size);
        float line = min(g.x, min(1.0-g.x, min(g.y, 1.0-g.y)));
        return smoothstep(0.0, 0.03, line);
      }

      // Caustic approximation (animated interference pattern)
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
        // Pool floor color: light azure tile
        vec3 tileDark  = vec3(0.22, 0.54, 0.72);
        vec3 tileLight = vec3(0.36, 0.68, 0.84);
        vec3 grout     = vec3(0.55, 0.72, 0.82);

        vec2 uv = vUv;
        float t = tile(uv, 9.0); // 9 tiles across
        vec3 base = mix(grout, mix(tileDark, tileLight, fract(uv.x * 9.0 + uv.y * 9.0)), t);

        // Caustic light — warm gold-white shimmers
        float c = caustic(uv * 2.8, uTime * 0.55);
        vec3 caustCol = vec3(1.0, 0.95, 0.75) * c * 0.55;

        // Depth fade: edges lighter, centre deeper
        float depth = 1.0 - smoothstep(0.1, 0.5, length(uv - 0.5) * 1.4);
        base = mix(base * 0.8, base, depth);

        gl_FragColor = vec4(base + caustCol, 1.0);
      }
    `
  });
  const floor = new T.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.6;
  scene.add(floor);

  /* ── Pool deck / coping rim ── */
  const rimShape = new T.Shape();
  const rs = 13.5;
  rimShape.moveTo(-rs,-rs); rimShape.lineTo(rs,-rs); rimShape.lineTo(rs,rs); rimShape.lineTo(-rs,rs); rimShape.lineTo(-rs,-rs);
  const rimHole = new T.Path();
  const rh = 13.0;
  rimHole.moveTo(-rh,-rh); rimHole.lineTo(rh,-rh); rimHole.lineTo(rh,rh); rimHole.lineTo(-rh,rh); rimHole.lineTo(-rh,-rh);
  rimShape.holes.push(rimHole);
  const rimGeo = new T.ExtrudeGeometry(rimShape, {
    depth: 0.38, bevelEnabled: true,
    bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1
  });

  // Concrete/travertine look – warm off-white
  const rimMat = new T.MeshStandardMaterial({
    color: 0xf0e9dc, roughness: 0.85, metalness: 0.0
  });
  const rim = new T.Mesh(rimGeo, rimMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = -0.06;
  scene.add(rim);

  /* ── Realistic water surface shader ── */
  const waterGeo = new T.PlaneGeometry(26, 26, 160, 160);
  const waterMat = new T.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime:    { value: 0 },
      uSunDir:  { value: new T.Vector3(0.55, 0.8, 0.35).normalize() },
    },
    vertexShader: `
      uniform float uTime;
      varying vec3  vWorldPos;
      varying vec3  vNormal;
      varying vec2  vUv;

      // Gerstner-like waves: multiple frequencies
      vec3 gerstner(vec2 pos, vec2 dir, float A, float L, float speed, float t){
        float k = 6.2832 / L;
        float phase = dot(dir, pos) * k - speed * t;
        float s = sin(phase), c = cos(phase);
        return vec3(-dir.x * A * s, A * c - A, -dir.y * A * s);
      }

      void main(){
        vUv = uv;
        vec3 p = position;
        vec3 n = vec3(0.0);

        // 5 wave layers
        vec3 w1 = gerstner(p.xy, vec2( 1.0, 0.6), 0.055, 5.2, 0.80, uTime);
        vec3 w2 = gerstner(p.xy, vec2(-0.7, 1.0), 0.040, 3.8, 1.10, uTime);
        vec3 w3 = gerstner(p.xy, vec2( 0.5,-0.8), 0.025, 2.2, 1.60, uTime);
        vec3 w4 = gerstner(p.xy, vec2( 0.9, 0.3), 0.018, 1.5, 2.10, uTime);
        vec3 w5 = gerstner(p.xy, vec2(-0.3, 0.9), 0.012, 1.1, 2.80, uTime);
        p += w1 + w2 + w3 + w4 + w5;

        // Approximate normals from wave slopes
        float eps = 0.01;
        n = normalize(vec3(-(w1.x+w2.x+w3.x)*6.0, 1.0, -(w1.z+w2.z+w3.z)*6.0));

        vNormal = n;
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

        // View direction (approximate — camera at y=2.8, z=10)
        vec3 viewPos = vec3(0.0, 2.8, 10.0);
        vec3 V = normalize(viewPos - vWorldPos);

        // Fresnel: reflects sky at shallow angles, shows floor at steep
        float NdotV = max(0.0, dot(N, V));
        float fresnel = pow(1.0 - NdotV, 4.0);
        fresnel = 0.08 + 0.85 * fresnel;

        // Water body colour – clear turquoise pool
        vec3 shallow = vec3(0.22, 0.72, 0.82);
        vec3 deep    = vec3(0.05, 0.38, 0.60);
        float depth  = smoothstep(0.4, 1.0, 1.0 - vUv.y);
        vec3 waterCol = mix(shallow, deep, depth);

        // Sky reflection colour
        vec3 skyRefl = vec3(0.58, 0.78, 0.95) + N.y * 0.15;

        // Blend water vs sky reflection via Fresnel
        vec3 col = mix(waterCol, skyRefl, fresnel * 0.75);

        // Sun specular highlight (Blinn-Phong)
        vec3 H = normalize(V + uSunDir);
        float spec = pow(max(0.0, dot(N, H)), 180.0);
        col += vec3(1.0, 0.97, 0.88) * spec * 1.8;

        // Fine sparkle (high-freq wave micro-facets)
        float spark = sin(vWorldPos.x * 22.0 + uTime * 2.8) *
                      cos(vWorldPos.z * 18.0 + uTime * 2.2);
        spark = pow(max(0.0, spark), 8.0) * 0.35;
        col += vec3(1.0, 0.98, 0.88) * spark;

        // Edge foam — faint white near rim
        float rimDist = 1.0 - smoothstep(11.5, 13.0,
                          max(abs(vWorldPos.x), abs(vWorldPos.z)));
        col = mix(col, vec3(0.94, 0.97, 1.0), rimDist * 0.35 * (N.y * 0.5 + 0.5));

        // Opacity: mostly opaque, slight transparency at peak of waves
        float alpha = 0.88 + N.y * 0.08;

        gl_FragColor = vec4(col, alpha);
      }
    `
  });
  const water = new T.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.0;
  scene.add(water);

  /* ── Lighting ── */
  scene.add(new T.AmbientLight(0xc6e4f5, 0.6));
  const sun = new T.DirectionalLight(0xfff4e0, 1.4);
  sun.position.set(6, 14, 8);
  scene.add(sun);
  const fill = new T.DirectionalLight(0x88cce8, 0.4);
  fill.position.set(-8, 5, -6);
  scene.add(fill);

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

    waterMat.uniforms.uTime.value = t;
    floorMat.uniforms.uTime.value = t;
    skyMat.uniforms.uTime.value   = t;

    // Gentle sun direction drift for dynamic caustics
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

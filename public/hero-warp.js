(() => {
  const container = document.querySelector('.hero-warp');
  if (!container) return;

  const MAX_DPR = 2;
  const TIME_RATE = 0.1;
  const SIMULATION_STEP = 1 / 60;
  const WAVE_SPEED = 0.42;
  const WAVE_FRICTION = 0.94;
  const WAVE_DECAY = 0.972;
  const SETTLED_THRESHOLD = 0.01;
  const INTRO_BAND = 0.2;
  const INTRO_WARP = 0.3;
  const INTRO_JITTER = 0.16;
  const INTRO_END = 1 + INTRO_WARP + INTRO_JITTER + INTRO_BAND;
  const INTRO_DURATION = 1.6;
  const CELL_SIZE = 10;

  const vertexShader = `
    attribute vec2 aPosition;
    varying vec2 vUv;

    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;

    varying vec2 vUv;
    uniform vec2 uResolution;
    uniform vec2 uOrigin;
    uniform vec2 uMotion;
    uniform float uCellPx;
    uniform float uCols;
    uniform float uRows;
    uniform float uTime;
    uniform float uFade;
    uniform float uIntro;
    uniform sampler2D uCharges;
    uniform sampler2D uLogoMask;

    const vec2 SEED = vec2(12.9898, 78.233);

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    vec3 fadeCurve(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

    float cnoise(vec3 p) {
      vec3 pi0 = floor(p);
      vec3 pi1 = pi0 + vec3(1.0);
      pi0 = mod289(pi0);
      pi1 = mod289(pi1);
      vec3 pf0 = fract(p);
      vec3 pf1 = pf0 - vec3(1.0);
      vec4 ix = vec4(pi0.x, pi1.x, pi0.x, pi1.x);
      vec4 iy = vec4(pi0.yy, pi1.yy);
      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + pi0.zzzz);
      vec4 ixy1 = permute(ixy + pi1.zzzz);

      vec4 gx0 = ixy0 * (1.0 / 7.0);
      vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(vec4(0.0), gx0) - 0.5);
      gy0 -= sz0 * (step(vec4(0.0), gy0) - 0.5);

      vec4 gx1 = ixy1 * (1.0 / 7.0);
      vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(vec4(0.0), gx1) - 0.5);
      gy1 -= sz1 * (step(vec4(0.0), gy1) - 0.5);

      vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
      vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
      vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
      vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
      vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
      vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
      vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
      vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

      vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;
      vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;

      float n000 = dot(g000, pf0);
      float n100 = dot(g100, vec3(pf1.x, pf0.yz));
      float n010 = dot(g010, vec3(pf0.x, pf1.y, pf0.z));
      float n110 = dot(g110, vec3(pf1.xy, pf0.z));
      float n001 = dot(g001, vec3(pf0.xy, pf1.z));
      float n101 = dot(g101, vec3(pf1.x, pf0.y, pf1.z));
      float n011 = dot(g011, vec3(pf0.x, pf1.yz));
      float n111 = dot(g111, pf1);

      vec3 fade = fadeCurve(pf0);
      vec4 nz = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade.z);
      vec2 ny = mix(nz.xy, nz.zw, fade.y);
      return 2.2 * mix(ny.x, ny.y, fade.x);
    }

    float fbm(vec3 p) {
      float total = 0.0;
      float amplitude = 1.0;
      float weight = 0.0;
      float frequency = 1.0;
      for (int i = 0; i < 2; i++) {
        total += amplitude * cnoise(p * frequency);
        weight += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      return total / weight;
    }

    float sdIsoscelesTriangle(vec2 point, vec2 q) {
      vec2 p = vec2(abs(point.x), point.y);
      vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
      vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);
      float s = -sign(q.y);
      vec2 d = min(vec2(dot(a, a), s * (p.x * q.y - p.y * q.x)), vec2(dot(b, b), s * (p.y - q.y)));
      return -sqrt(d.x) * sign(d.y);
    }

    float shapeDistance(vec2 p, float shape, float size) {
      if (shape < 0.5) return max(abs(p.x), abs(p.y)) - size;
      if (shape < 1.5) return length(p) - size;
      return sdIsoscelesTriangle(vec2(p.x, p.y + size), vec2(size, 2.0 * size));
    }

    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      float logoMask = texture2D(uLogoMask, vUv).a;
      if (logoMask > 0.001) {
        float edge = smoothstep(0.02, 0.98, logoMask);
        gl_FragColor = vec4(mix(vec3(1.0), vec3(0.125), edge), 1.0);
        return;
      }

      vec2 pixel = vUv * uResolution;
      vec2 cell = floor((pixel - uOrigin) / uCellPx);
      if (cell.y < 0.0 || cell.y >= uRows || cell.x < 0.0 || cell.x >= uCols) {
        gl_FragColor = vec4(1.0);
        return;
      }

      vec2 center = uOrigin + (cell + 0.5) * uCellPx;
      vec2 local = (pixel - center) / (uCellPx * 0.5);
      vec2 cellUv = center / uResolution;
      float level = 1.0;
      if (uFade > 0.0) {
        vec2 q = abs(vUv * 2.0 - 1.0);
        float radius = pow(pow(q.x, 2.5) + pow(q.y, 2.5), 0.4) / pow(2.0, 0.4);
        level = 1.0 - smoothstep(max(0.0, 1.0 - uFade * 2.2), 1.0, radius);
      }

      float noise = fbm(vec3((center + uMotion) / (32.0 * uCellPx) + SEED, uTime));
      float tone = clamp((noise * 0.5 + 0.5 - 0.54) * 2.65 + 0.5, 0.0, 1.0);
      float band = floor(min(tone, 0.999999) * 3.0);
      float charge = texture2D(uCharges, (cell + 0.5) / vec2(uCols, uRows)).r;
      float stepped = mod(band + floor(clamp(charge, 0.0, 0.999) * 3.0), 3.0);
      float shape = 2.0 - stepped;
      float size = 0.72;
      float front = 0.0;

      if (uIntro < ${INTRO_END.toFixed(2)}) {
        float radial = length((center - uResolution * 0.5) / (uResolution * 0.5)) * 0.70710678;
        float warp = cnoise(vec3(cellUv * vec2(3.2, 2.4) + SEED, 4.7)) * ${INTRO_WARP.toFixed(2)};
        float jitter = hash21(cell) * ${INTRO_JITTER.toFixed(2)};
        float spread = radial + warp + jitter + ${INTRO_WARP.toFixed(2)};
        float introBand = ${INTRO_BAND.toFixed(2)} * (0.6 + 0.8 * hash21(cell + vec2(17.0, 9.0)));
        float t = clamp((uIntro - spread) / introBand, 0.0, 1.0);
        if (t <= 0.0) {
          gl_FragColor = vec4(1.0);
          return;
        }
        float back = t - 1.0;
        size = max(size * (1.0 + 2.70158 * back * back * back + 1.70158 * back * back), 0.02);
        front = 1.0 - smoothstep(0.0, 1.0, abs(uIntro - spread) / introBand);
      }

      float aa = 2.0 / uCellPx;
      float coverage = 1.0 - smoothstep(-aa, aa, shapeDistance(local, shape, size));
      vec3 baseColor = vec3(0.90, 0.89, 0.91);
      vec3 hoverColor = vec3(0.76, 0.72, 0.79);
      vec3 tint = mix(baseColor, hoverColor, max(smoothstep(0.15, 0.85, charge), front * 0.35));
      gl_FragColor = vec4(mix(vec3(1.0), tint, coverage * level), 1.0);
    }
  `;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power'
  });

  if (!gl) {
    container.dataset.renderer = 'fallback';
    container.dataset.ready = 'true';
    return;
  }

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`ShapeWaves shader compilation failed: ${message}`);
    }
    return shader;
  }

  let program;
  try {
    const vertex = compile(gl.VERTEX_SHADER, vertexShader);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentShader);
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`ShapeWaves shader link failed: ${gl.getProgramInfoLog(program)}`);
    }
  } catch (error) {
    console.warn(error.message);
    container.dataset.renderer = 'fallback';
    container.dataset.ready = 'true';
    return;
  }

  container.appendChild(canvas);
  container.dataset.renderer = 'webgl';
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = name => gl.getUniformLocation(program, name);
  const uniforms = {
    resolution: uniform('uResolution'),
    origin: uniform('uOrigin'),
    motion: uniform('uMotion'),
    cellPx: uniform('uCellPx'),
    cols: uniform('uCols'),
    rows: uniform('uRows'),
    time: uniform('uTime'),
    fade: uniform('uFade'),
    intro: uniform('uIntro')
  };
  gl.uniform1i(uniform('uCharges'), 0);
  gl.uniform1i(uniform('uLogoMask'), 1);
  gl.uniform1f(uniforms.fade, 0.34);

  const chargeTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, chargeTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const logoMaskTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, logoMaskTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));

  const logo = document.querySelector('.pixel-logo');
  const maskCanvas = document.createElement('canvas');
  const maskContext = maskCanvas.getContext('2d');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let reducedMotion = motionPreference.matches;
  let visible = true;
  let dpr = 1;
  let cols = 1;
  let rows = 1;
  let cellPx = CELL_SIZE;
  let origin = [0, 0];
  let charges = new Float32Array(1);
  let heights = new Float32Array(1);
  let previousHeights = new Float32Array(1);
  let chargePixels = new Uint8Array(4);
  let chargesActive = false;
  let simulationBacklog = 0;
  let elapsed = 0;
  let introStart = performance.now();
  let introProgress = reducedMotion ? INTRO_END : 0;
  let lastTick = performance.now();
  let lastFrame = 0;
  let bounds = null;
  let presented = false;
  let maskVersion = 0;
  let maskPending = false;
  const pointer = { x: 0, y: 0, at: 0, inside: false };

  function uploadCharges() {
    for (let index = 0; index < charges.length; index++) {
      const offset = index * 4;
      chargePixels[offset] = Math.round(Math.min(1, Math.max(0, charges[index])) * 255);
      chargePixels[offset + 1] = 0;
      chargePixels[offset + 2] = 0;
      chargePixels[offset + 3] = 255;
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, chargeTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, chargePixels);
  }

  function configureGrid() {
    const nextCols = Math.max(1, Math.round(canvas.width / (CELL_SIZE * dpr)));
    cellPx = canvas.width / nextCols;
    const nextRows = Math.max(1, Math.floor(canvas.height / cellPx));
    origin = [0, (canvas.height - nextRows * cellPx) / 2];
    if (nextCols === cols && nextRows === rows && charges.length === nextCols * nextRows) return;
    cols = nextCols;
    rows = nextRows;
    charges = new Float32Array(cols * rows);
    heights = new Float32Array(cols * rows);
    previousHeights = new Float32Array(cols * rows);
    chargePixels = new Uint8Array(cols * rows * 4);
    chargesActive = false;
    uploadCharges();
  }

  function drawLogoMask() {
    if (!logo || !maskContext) return;
    const version = ++maskVersion;
    const logoRect = logo.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const clone = logo.cloneNode(true);
    clone.removeAttribute('class');
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('color', '#ffffff');
    const source = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      if (version !== maskVersion) return;
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskContext.drawImage(
        image,
        (logoRect.left - containerRect.left) * dpr,
        (logoRect.top - containerRect.top) * dpr,
        logoRect.width * dpr,
        logoRect.height * dpr
      );
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, logoMaskTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      maskPending = true;
      presented = false;
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }

  function resize() {
    bounds = null;
    dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
    const width = Math.max(1, Math.round(container.clientWidth * dpr));
    const height = Math.max(1, Math.round(container.clientHeight * dpr));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    configureGrid();
    drawLogoMask();
  }

  function splash(x, y, strength) {
    const sigma = Math.max(0.5, ((40 * dpr) / cellPx) * 0.5);
    const reach = Math.ceil(sigma * 2.5);
    const surfaceY = ((bounds?.height ?? container.clientHeight) - y) * dpr;
    const centerCol = (x * dpr - origin[0]) / cellPx - 0.5;
    const centerRow = (surfaceY - origin[1]) / cellPx - 0.5;
    const minRow = Math.max(0, Math.floor(centerRow - reach));
    const maxRow = Math.min(rows - 1, Math.ceil(centerRow + reach));
    const minCol = Math.max(0, Math.floor(centerCol - reach));
    const maxCol = Math.min(cols - 1, Math.ceil(centerCol + reach));
    for (let row = minRow; row <= maxRow; row++) {
      const dy = row - centerRow;
      for (let col = minCol; col <= maxCol; col++) {
        const dx = col - centerCol;
        const bump = strength * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
        const index = row * cols + col;
        heights[index] = Math.min(1.2, heights[index] + bump);
      }
    }
    chargesActive = true;
  }

  function stepRipples() {
    const lastCol = cols - 1;
    const lastRow = rows - 1;
    let peak = 0;
    for (let row = 0; row < rows; row++) {
      const up = (row === 0 ? row : row - 1) * cols;
      const down = (row === lastRow ? row : row + 1) * cols;
      const base = row * cols;
      for (let col = 0; col < cols; col++) {
        const index = base + col;
        const left = base + (col === 0 ? col : col - 1);
        const right = base + (col === lastCol ? col : col + 1);
        const height = heights[index];
        const laplacian = heights[left] + heights[right] + heights[up + col] + heights[down + col] - 4 * height;
        const velocity = (height - previousHeights[index]) * WAVE_FRICTION;
        const next = (height + velocity + WAVE_SPEED * laplacian) * WAVE_DECAY;
        previousHeights[index] = next;
        const charge = Math.min(1, Math.max(0, next));
        charges[index] = charge;
        if (charge > peak) peak = charge;
      }
    }
    const swap = heights;
    heights = previousHeights;
    previousHeights = swap;
    return peak;
  }

  function updateCharges(deltaSeconds) {
    if (!chargesActive) return;
    simulationBacklog = Math.min(simulationBacklog + deltaSeconds, SIMULATION_STEP * 4);
    let peak = 1;
    while (simulationBacklog >= SIMULATION_STEP) {
      simulationBacklog -= SIMULATION_STEP;
      peak = stepRipples();
    }
    if (peak < SETTLED_THRESHOLD) {
      heights.fill(0);
      previousHeights.fill(0);
      charges.fill(0);
      chargesActive = false;
    }
    uploadCharges();
  }

  function onPointerMove(event) {
    if (reducedMotion || !finePointer.matches) return;
    if (!bounds) bounds = container.getBoundingClientRect();
    const now = performance.now();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const inside = x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height;
    if (inside) {
      const elapsedMs = pointer.inside ? Math.max(8, now - pointer.at) : 16;
      const travelled = pointer.inside ? Math.hypot(x - pointer.x, y - pointer.y) : 0;
      const speed = (travelled / elapsedMs) * 1000;
      splash(x, y, Math.min(1, 0.22 + speed * 0.0006) * 0.4);
    }
    pointer.x = x;
    pointer.y = y;
    pointer.at = now;
    pointer.inside = inside;
  }

  function updateMotionPreference() {
    reducedMotion = motionPreference.matches;
    container.dataset.motion = reducedMotion ? 'reduced' : 'active';
    if (reducedMotion) {
      introProgress = INTRO_END;
      charges.fill(0);
      heights.fill(0);
      previousHeights.fill(0);
      chargesActive = false;
      uploadCharges();
    } else {
      introStart = performance.now();
      introProgress = 0;
    }
  }

  function render(now) {
    requestAnimationFrame(render);
    if (!visible || document.hidden) {
      lastTick = now;
      return;
    }
    if (reducedMotion && presented && !chargesActive) return;
    if (now - lastFrame < 1000 / 30) return;

    const deltaSeconds = Math.min(0.1, (now - lastTick) / 1000);
    lastTick = now;
    lastFrame = now;
    if (!reducedMotion) {
      elapsed += deltaSeconds * TIME_RATE;
      introProgress = Math.min(INTRO_END, ((now - introStart) / 1000 / INTRO_DURATION) * INTRO_END);
    }
    updateCharges(deltaSeconds);

    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.origin, origin[0], origin[1]);
    gl.uniform2f(uniforms.motion, 0, 0);
    gl.uniform1f(uniforms.cellPx, cellPx);
    gl.uniform1f(uniforms.cols, cols);
    gl.uniform1f(uniforms.rows, rows);
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.intro, introProgress);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (maskPending) {
      maskPending = false;
      container.dataset.mask = 'ready';
    }
    if (!presented) {
      presented = true;
      container.dataset.ready = 'true';
    }
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  visibilityObserver.observe(container);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', () => { bounds = null; }, { capture: true, passive: true });
  motionPreference.addEventListener('change', updateMotionPreference);
  updateMotionPreference();
  resize();
  requestAnimationFrame(render);
})();

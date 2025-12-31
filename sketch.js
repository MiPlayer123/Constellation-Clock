// Celestial Constellation Clock
// An abstract representation of time as a living cosmic web.

let anchorStars = [];
let cometParticles = [];
let webConnections = []; // Pre-calculated for rhythmic growth
let lastMinute = -1;
let starRadius = 200; // Radius of the 12-hour circle

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  
  // Initialize 12 anchor stars for the hours
  for (let i = 0; i < 12; i++) {
    let angle = map(i, 0, 12, -HALF_PI, TWO_PI - HALF_PI);
    anchorStars.push({
      baseX: cos(angle) * starRadius,
      baseY: sin(angle) * starRadius,
      angle: angle,
      id: i === 0 ? 12 : i 
    });
  }

  // Pre-calculate connections to ensure perimeter lines complete every 5 mins
  generateWebConnections();
}

function generateWebConnections() {
  let allPossible = [];
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      allPossible.push({ i, j });
    }
  }

  // Separate perimeter (adjacent) and inner lines
  let perimeter = [];
  let inner = [];
  for (let conn of allPossible) {
    let diff = Math.abs(conn.i - conn.j);
    if (diff === 1 || diff === 11) {
      perimeter.push(conn);
    } else {
      inner.push(conn);
    }
  }
  
  // Sort perimeter: (0,1), (1,2) ... (11,0)
  perimeter.sort((a, b) => {
     let getPIdx = (c) => (c.i === 0 && c.j === 11) ? 11 : (c.i === 11 && c.j === 0 ? 11 : c.i);
     return getPIdx(a) - getPIdx(b);
  });

  // Sort inner lines by their "average angle" to sweep clockwise
  inner.sort((a, b) => {
    let angA = (anchorStars[a.i].angle + anchorStars[a.j].angle) / 2;
    let angB = (anchorStars[b.i].angle + anchorStars[b.j].angle) / 2;
    // Normalize angles for sorting
    if (angA < -HALF_PI) angA += TWO_PI;
    if (angB < -HALF_PI) angB += TWO_PI;
    return angA - angB;
  });

  // Interleave: 4-5 inner lines then 1 perimeter line every 5 minutes
  webConnections = [];
  let innerIdx = 0;
  for (let p = 0; p < 12; p++) {
    let take = (p % 2 === 0) ? 4 : 5; // Distribute 54 lines over 12 slots (4.5 avg)
    for (let k = 0; k < take && innerIdx < inner.length; k++) {
      webConnections.push(inner[innerIdx++]);
    }
    webConnections.push(perimeter[p]);
  }
  while (innerIdx < inner.length) webConnections.push(inner[innerIdx++]);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  let now = new Date();
  let hr = hour() % 12;
  let min = minute();
  let sec = second();
  let smoothSec = now.getSeconds() + now.getMilliseconds() / 1000;

  if (min !== lastMinute) {
    console.log("Current Minute: " + min);
    lastMinute = min;
  }

  // Update star positions with noise once per frame
  for (let i = 0; i < 12; i++) {
    let star = anchorStars[i];
    // More subtle drift: smaller range (12 instead of 20) and slower speed (0.007 instead of 0.01)
    star.currentX = star.baseX + (noise(i * 10, frameCount * 0.008) * 14 - 6);
    star.currentY = star.baseY + (noise(i * 10 + 100, frameCount * 0.007) * 14 - 6);
  }

  // 1. Background Shift (Hour-based)
  let bgHue = map(hour(), 0, 23, 220, 300);
  background(bgHue, 80, 5, 100);

  translate(width / 2, height / 2);

  // 2. Minute Web (Filaments)
  drawMinuteWeb(min);

  // 3. Anchor Stars (Hour-based)
  drawAnchorStars(hr);

  // 4. Orbiting Comet (Second-based)
  drawOrbitingComet(smoothSec);
}

function drawAnchorStars(hr) {
  for (let i = 0; i < 12; i++) {
    let star = anchorStars[i];
    let x = star.currentX;
    let y = star.currentY;

    let isCurrentHour = (i === hr);
    
    let pulse = isCurrentHour ? sin(frameCount * 0.05) * 5 + 10 : 5;
    let glow = isCurrentHour ? 25 + sin(frameCount * 0.05) * 10 : 5;

    drawingContext.shadowBlur = glow;
    drawingContext.shadowColor = isCurrentHour ? color(200, 40, 100).toString() : color(200, 20, 50).toString();
    
    noStroke();
    fill(200, isCurrentHour ? 30 : 10, isCurrentHour ? 100 : 40);
    ellipse(x, y, pulse, pulse);
    
    drawingContext.shadowBlur = 0;
  }
}

function drawMinuteWeb(min) {
  // Map 0-59 minutes to our 66 pre-calculated connections
  let connectionsToDraw = floor(map(min, 0, 59, 0, webConnections.length));
  
  for (let count = 0; count < connectionsToDraw; count++) {
    let conn = webConnections[count];
    
    // Use the synced drifting positions
    let x1 = anchorStars[conn.i].currentX;
    let y1 = anchorStars[conn.i].currentY;
    let x2 = anchorStars[conn.j].currentX;
    let y2 = anchorStars[conn.j].currentY;

    let isRecent = (count >= connectionsToDraw - 1);
    let alpha = 80;
    let brightness = 90;
    
    if (isRecent) {
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = color(200, 60, 100).toString();
      stroke(200, 60, 100, 80);
      strokeWeight(1.2);
    } else {
      drawingContext.shadowBlur = 0;
      stroke(200, 30, brightness, alpha);
      strokeWeight(0.9);
    }
    
    line(x1, y1, x2, y2);
    drawingContext.shadowBlur = 0;
  }
}

// Remove the Stardust class as it's no longer used

function drawOrbitingComet(smoothSec) {
  let angle = map(smoothSec, 0, 60, -HALF_PI, TWO_PI - HALF_PI);
  
  let orbitRadius = starRadius + 60; 
  let cx = cos(angle) * orbitRadius;
  let cy = sin(angle) * orbitRadius;

  // Add particles
  if (frameCount % 1 === 0) {
    cometParticles.push(new Particle(cx, cy));
  }

  for (let i = cometParticles.length - 1; i >= 0; i--) {
    cometParticles[i].update();
    cometParticles[i].display();
    if (cometParticles[i].isDead()) {
      cometParticles.splice(i, 1);
    }
  }

  // Comet Head - Bright Gold
  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = color(50, 100, 100).toString();
  fill(50, 80, 100);
  noStroke();
  ellipse(cx, cy, 15, 15);
  drawingContext.shadowBlur = 0;
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 100;
    this.hue = 50;
    this.size = random(2, 6);
  }

  update() {
    this.life -= 2;
    this.x += random(-1, 1);
    this.y += random(-1, 1);
  }

  display() {
    noStroke();
    fill(this.hue, 50, 100, this.life);
    ellipse(this.x, this.y, this.size, this.size);
  }

  isDead() {
    return this.life <= 0;
  }
}


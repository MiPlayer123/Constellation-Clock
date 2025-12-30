// Celestial Constellation Clock
// An abstract representation of time as a living cosmic web.

let anchorStars = [];
let cometParticles = [];
let lastMinute = -1;
let starRadius = 200; // Radius of the 12-hour circle

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  
  // Initialize 12 anchor stars for the hours
  for (let i = 0; i < 12; i++) {
    // 0 index is 12 o'clock (top)
    let angle = map(i, 0, 12, -HALF_PI, TWO_PI - HALF_PI);
    anchorStars.push({
      baseX: cos(angle) * starRadius,
      baseY: sin(angle) * starRadius,
      angle: angle,
      id: i === 0 ? 12 : i // Label for internal logic
    });
  }
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

  // Minute change console logging
  if (min !== lastMinute) {
    console.log("Current Minute: " + min);
    lastMinute = min;
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
    
    // Noise-based drifting
    let nX = noise(i * 10, frameCount * 0.01) * 15 - 7.5;
    let nY = noise(i * 10 + 100, frameCount * 0.01) * 15 - 7.5;
    let x = star.baseX + nX;
    let y = star.baseY + nY;

    // Correct hour logic: i=0 is 12, i=1 is 1, etc.
    // The current hour is hour() % 12.
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
  // Map 0-59 minutes to a number of lines (0 to 66)
  let connectionsToDraw = floor(map(min, 0, 59, 0, 66));
  
  let count = 0;
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      if (count < connectionsToDraw) {
        // High baseline visibility for all lines
        let alpha = 80; 
        let brightness = 90;
        
        // The very last few lines added in this minute "glow" to show current progress
        let isRecent = (count >= connectionsToDraw - 1);
        
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
        
        let x1 = anchorStars[i].baseX + (noise(i, frameCount * 0.005) * 15 - 7.5);
        let y1 = anchorStars[i].baseY + (noise(i + 10, frameCount * 0.005) * 15 - 7.5);
        let x2 = anchorStars[j].baseX + (noise(j, frameCount * 0.005) * 15 - 7.5);
        let y2 = anchorStars[j].baseY + (noise(j + 10, frameCount * 0.005) * 15 - 7.5);
        
        line(x1, y1, x2, y2);
        count++;
        
        // Reset shadow for the loop
        drawingContext.shadowBlur = 0;
      } else {
        break;
      }
    }
  }
}

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


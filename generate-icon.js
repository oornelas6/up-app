const { createCanvas } = require('canvas');
const fs = require('fs');

const size = 1024;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Deep purple background
const bg = ctx.createLinearGradient(0, 0, size, size);
bg.addColorStop(0, '#3c096c');
bg.addColorStop(1, '#0a000f');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, size, size);

// White/light for UP letters
const letterColor = '#ffffff';
const arrowColor = '#c77dff';

ctx.fillStyle = letterColor;

// U - left leg
roundRect(ctx, 160, 200, 90, 420, 12);
ctx.fill();

// U - right leg
roundRect(ctx, 365, 200, 90, 280, 12);
ctx.fill();

// U - bottom
roundRect(ctx, 160, 575, 295, 90, 40);
ctx.fill();

// Arrow through U
ctx.strokeStyle = arrowColor;
ctx.lineWidth = 65;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Shaft
ctx.beginPath();
ctx.moveTo(310, 710);
ctx.lineTo(310, 250);
ctx.stroke();

// Arrowhead
ctx.beginPath();
ctx.moveTo(185, 385);
ctx.lineTo(310, 220);
ctx.lineTo(435, 385);
ctx.stroke();

// P - vertical bar
ctx.fillStyle = letterColor;
roundRect(ctx, 525, 200, 90, 480, 12);
ctx.fill();

// P - top horizontal
roundRect(ctx, 525, 200, 195, 90, 12);
ctx.fill();

// P - middle horizontal
roundRect(ctx, 525, 365, 195, 90, 12);
ctx.fill();

// P - right curve
roundRect(ctx, 690, 200, 90, 255, 12);
ctx.fill();

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./assets/icon.png', buffer);
fs.writeFileSync('./assets/adaptive-icon.png', buffer);
console.log('Done!');

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

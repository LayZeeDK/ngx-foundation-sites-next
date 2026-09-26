// PROTOTYPE helper: writes four SVG slide images. Slide 3 is taller (1200x600) so the
// container height must follow the tallest slide without a JavaScript measurement.
import { writeFileSync } from 'node:fs';

const slides = [
  ['#1779ba', 1200, 500],
  ['#3adb76', 1200, 500],
  ['#ffae00', 1200, 600],
  ['#cc4b37', 1200, 500],
];

slides.forEach(([fill, w, h], i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${fill}"/><text x="50%" y="45%" font-size="120" font-family="sans-serif" text-anchor="middle" fill="#0a0a0a">Slide ${i + 1}</text></svg>\n`;
  writeFileSync(`public/slides/slide-${i + 1}.svg`, svg);
});

const gallery = document.querySelector('.gallery');
const dialog = document.querySelector('.lightbox');
const lightboxImage = dialog?.querySelector('img');
const originalPhotos = gallery ? [...gallery.querySelectorAll('.photo')] : [];
const buttons = originalPhotos.map((photo) => photo.querySelector('.photo-button'));
const sources = buttons.map((button) => button.dataset.src);
let currentIndex = 0;

function waitForImages() {
  return Promise.all(originalPhotos.map((photo) => {
    const img = photo.querySelector('img');
    if (img.complete && img.naturalWidth) return Promise.resolve();
    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }));
}

function columnCount() {
  const w = window.innerWidth;
  if (w <= 620) return 1;
  if (w <= 900) return 2;
  if (w <= 1220) return 3;
  if (w <= 1580) return 4;
  return 5;
}

function layoutGallery() {
  if (!gallery) return;
  const cols = columnCount();
  const grid = document.createElement('div');
  grid.className = 'masonry-grid';
  grid.style.setProperty('--cols', cols);

  const columns = Array.from({ length: cols }, () => {
    const el = document.createElement('div');
    el.className = 'masonry-column';
    grid.appendChild(el);
    return el;
  });

  // Estimate column height from each image's real aspect ratio and always add
  // the next image to the shortest column. This keeps the wall balanced even
  // when a future upload contains mostly landscape or mostly portrait images.
  const heights = Array(cols).fill(0);
  originalPhotos.forEach((photo) => {
    const img = photo.querySelector('img');
    const ratio = (img.naturalWidth && img.naturalHeight)
      ? img.naturalHeight / img.naturalWidth
      : 0.75;
    const target = heights.indexOf(Math.min(...heights));
    columns[target].appendChild(photo);
    heights[target] += ratio + 0.03;
  });

  gallery.replaceChildren(grid);
}

function show(index) {
  currentIndex = (index + sources.length) % sources.length;
  lightboxImage.src = sources[currentIndex];
  lightboxImage.alt = buttons[currentIndex].querySelector('img').alt;
}

buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    show(index);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  dialog.close();
  document.body.style.overflow = '';
  lightboxImage.src = '';
}

if (dialog) {
  dialog.querySelector('.close').addEventListener('click', closeLightbox);
  dialog.querySelector('.prev').addEventListener('click', () => show(currentIndex - 1));
  dialog.querySelector('.next').addEventListener('click', () => show(currentIndex + 1));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeLightbox(); });
  document.addEventListener('keydown', (event) => {
    if (!dialog.open) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') show(currentIndex - 1);
    if (event.key === 'ArrowRight') show(currentIndex + 1);
  });
}

let lastCols = 0;
function relayoutIfNeeded() {
  const cols = columnCount();
  if (cols !== lastCols) { lastCols = cols; layoutGallery(); }
}
window.addEventListener('resize', relayoutIfNeeded);
waitForImages().then(() => { lastCols = columnCount(); layoutGallery(); });

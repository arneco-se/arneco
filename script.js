const gallery = document.querySelector('.gallery');
const dialog = document.querySelector('.lightbox');
const lightboxImage = dialog?.querySelector('img');
let currentIndex = 0;

function columnCount() {
  const w = window.innerWidth;
  if (w <= 620) return 1;
  if (w <= 900) return 2;
  if (w <= 1220) return 3;
  if (w <= 1580) return 4;
  return 5;
}

function createPhoto(photo, index) {
  const figure = document.createElement('figure');
  figure.className = 'photo';

  const button = document.createElement('button');
  button.className = 'photo-button';
  button.dataset.index = index;
  button.setAttribute('aria-label', 'Öppna bild');

  const img = document.createElement('img');
  img.src = photo.file;
  img.width = photo.width;
  img.height = photo.height;
  img.alt = photo.alt || '';
  img.loading = index === 0 ? 'eager' : 'lazy';

  button.appendChild(img);
  figure.appendChild(button);
  button.addEventListener('click', () => {
    show(index);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
  return figure;
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

  const heights = Array(cols).fill(0);
  photos.forEach((photo, index) => {
    const target = heights.indexOf(Math.min(...heights));
    columns[target].appendChild(createPhoto(photo, index));
    heights[target] += (photo.height / photo.width) + 0.03;
  });

  gallery.replaceChildren(grid);
}

function show(index) {
  currentIndex = (index + photos.length) % photos.length;
  lightboxImage.src = photos[currentIndex].file;
  lightboxImage.alt = photos[currentIndex].alt || '';
}

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

let lastCols = columnCount();
window.addEventListener('resize', () => {
  const cols = columnCount();
  if (cols !== lastCols) {
    lastCols = cols;
    layoutGallery();
  }
});
layoutGallery();

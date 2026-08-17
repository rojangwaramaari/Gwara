/* =========================================================
   SHALIN STUDIO — site scripts
   ========================================================= */

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});


/* =========================================================
   PORTFOLIO — "Her Work"
   =========================================================
   HOW TO ADD LIPEE'S PHOTOS LATER:

   1. Put each image file inside an "images/work" folder next to
      this script (create the folder if it doesn't exist yet).

   2. Add one line per photo to the WORKS array below, e.g.:

        { src: "images/work/bridal-01.jpg", alt: "Bridal look, red and gold", category: "Bridal" },
        { src: "images/work/party-01.jpg",  alt: "Party makeup, smokey eye", category: "Party" },

      - "src"      -> the path to the image file
      - "alt"      -> a short text description (for accessibility)
      - "category" -> shown as a caption on hover, e.g. "Bridal",
                       "Engagement", "Party", "Photoshoot"

   3. Save the file — the grid updates automatically, and any
      empty slots left in the layout are filled with real photos
      first, placeholders last. No other code needs to change.
   ========================================================= */

const WORKS = [
  { src: "images/work/1sabina.jpg", alt: "Bridal makeup, red and gold", category: "Bridal" },
];

const MIN_GRID_SLOTS = 6; // keeps the section looking intentional while empty

function renderWork() {
  const grid = document.getElementById('workGrid');
  if (!grid) return;
  grid.innerHTML = '';

  WORKS.forEach(item => {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.innerHTML = `
      <img src="${item.src}" alt="${item.alt || 'Makeup work by Shalin Studio'}" loading="lazy">
      ${item.category ? `<div class="work-caption">${item.category}</div>` : ''}
    `;
    grid.appendChild(card);
  });

  const placeholdersNeeded = Math.max(0, MIN_GRID_SLOTS - WORKS.length);
  for (let i = 0; i < placeholdersNeeded; i++) {
    const card = document.createElement('div');
    card.className = 'work-card is-placeholder';
    card.innerHTML = `
      <div class="placeholder-inner">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="1.5"/>
          <circle cx="9" cy="10.5" r="1.6"/>
          <path d="M21 16l-5.5-5.5L8 18"/>
        </svg>
        <strong>Coming soon</strong>
        <span>New work is added after every booking.</span>
      </div>
    `;
    grid.appendChild(card);
  }
}

renderWork();


/* =========================================================
   CONTACT FORM
   =========================================================
   No backend is connected yet, so submissions aren't sent
   anywhere. To make this live, either:

   - Wire it to a form service like Formspree or EmailJS, or
   - Point the <form> at a real backend endpoint.

   Until then, submitting shows a confirmation and opens the
   visitor's email app with the details pre-filled, addressed
   to STUDIO_EMAIL below — replace it with Lipee's real email.
   ========================================================= */

const STUDIO_EMAIL = "hello@shalinstudio.example"; // <-- replace with real inbox

const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const date = document.getElementById('date').value;
  const message = document.getElementById('message').value.trim();

  const subject = encodeURIComponent(`Booking enquiry — ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nPhone / WhatsApp: ${phone}\nEvent date: ${date || 'Not specified'}\n\n${message}`
  );

  formNote.textContent = "Thank you — opening your email app to send this through.";
  window.location.href = `mailto:${STUDIO_EMAIL}?subject=${subject}&body=${body}`;

  contactForm.reset();
});
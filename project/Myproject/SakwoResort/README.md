# Sakwo Resort Website

A complete, static, premium resort website for **Sakwo Resort** (Sankhu, Kathmandu, Nepal), built with plain HTML5, CSS3 and vanilla JavaScript — no frameworks, no build step, no backend.

## Running it

Just open `index.html` in a browser. Every asset is either local (`css/style.css`, `js/script.js`) or loaded from a CDN (Google Fonts, Font Awesome).

## File structure

```
sakwo-resort/
├── index.html
├── css/style.css
├── js/script.js
├── images/            (placeholder folder for local images, see below)
│   └── gallery/
└── README.md
```

## 1. Replacing images

Every image currently points to a temporary Unsplash URL so the site looks complete out of the box. Each is marked with an HTML comment such as `<!-- REPLACE: ... -->` in `index.html`, and the room/gallery photos live in the `ROOMS` and `GALLERY` arrays at the top of `js/script.js`.

To use your own photos:
1. Drop your resort's real photos into the `images/` folder (e.g. `images/hero.jpg`, `images/rooms/standard-1.jpg`).
2. In `index.html`, replace the `src="https://images.unsplash.com/..."` values with your local paths, e.g. `src="images/hero.jpg"`.
3. In `js/script.js`, update the `images: [...]` arrays inside `ROOMS`, and the `img:` values inside `GALLERY`, the same way.
4. Keep the `alt="..."` text accurate and descriptive for accessibility/SEO.

## 2. Changing room availability

Open `js/script.js` and find the `ROOMS` array near the top. Each room object has:

```js
{
  id: 1,
  name: "Standard Room",
  capacity: 2,
  price: 0,        // 0 = "Check Price" shown instead of a number
  available: 5,    // change this number to update how many rooms show as available
  ...
}
```

Change `available` to reflect real inventory. Setting it to `0` automatically shows the room as **"Fully Booked"** everywhere (availability results and reservation room picker).

## 3. Changing room information

In the same `ROOMS` array, edit:
- `name`, `capacity`, `view`, `beds`, `description` — plain text fields.
- `features` — an array of short strings shown as pill tags on the room card.
- `images` — an array of photo URLs/paths used for that room's card image and its lightbox gallery (first image is the cover).

To add a 6th room, copy an existing object, give it a new unique `id`, and fill in its fields — every part of the site (room cards, availability engine, reservation dropdown) reads from this one array automatically.

## 4. Changing contact information

Contact details currently appear in **three places** in `index.html` — the Contact section, the Footer, and the Floating Action Buttons — plus inside `js/script.js` for the WhatsApp integration:

- Phone: search for `9769325515` and `tel:9769325515`.
- WhatsApp: search for `9779849318047` in `index.html`, and update the `WHATSAPP_NUMBER` constant near the top of `js/script.js` (used to build the WhatsApp booking links).
- Viber: search for `viber://chat?number=`.
- Email: search for `sakwo15@gmail.com`.
- Address / Google Maps link: search for `maps.app.goo.gl` in the "Find Sakwo Resort" section — replace with an updated Google Maps share link if the location changes.

## 5. Updating packages

Each package is a `.package-card` block inside the `#packages` section of `index.html`. Edit the heading, tag line, feature list (`<li>` items) and the `data-package="..."` attribute on the **Enquire Now** button (this text is used to prefill the WhatsApp enquiry message). Prices intentionally show **"Contact for Current Price"** — replace with a real figure only once pricing is finalized.

## 6. Connecting the reservation form to a real backend later

Right now, submitting the **Reserve Your Stay** form (in `index.html`, `#reservationForm`) only builds a pre-filled WhatsApp message and shows an on-page confirmation modal — nothing is stored or emailed automatically, since this is a front-end-only site.

To wire it up to a real backend later:
1. In `js/script.js`, find the `reservationForm.addEventListener('submit', ...)` handler.
2. After validation passes (where `reservationError.textContent = '';` is set), add a `fetch()` call to your backend endpoint or a form service (e.g. your own API, Formspree, Netlify Forms, Google Sheets via Apps Script, etc.), sending the same fields already being collected (`name`, `phone`, `email`, `whatsapp`, `checkin`, `checkout`, `adults`, `children`, `roomsCount`, `roomName`, `requests`).
3. Keep the existing WhatsApp link and confirmation modal as a fallback/supplement — guests still get instant confirmation even if the backend call is slow or fails.
4. The same approach works for the package **Enquire Now** buttons and the quick booking bar if you later want those logged too.

## Notes on content honesty

Per the project brief, this site does **not** invent prices, awards, star ratings, guest-review counts, or fake statistics. Anywhere real data was not supplied, the site shows neutral placeholders like "Contact for Current Price" or "Available on Request" — update these once real figures are confirmed. Testimonials are explicitly labeled as sample/placeholder content, not verified reviews.

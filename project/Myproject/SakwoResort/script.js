/* =========================================================
   SAKWO RESORT — SCRIPT
   Vanilla JS. No frameworks, no build step.
   ========================================================= */

(() => {
  'use strict';

  /* ---------------------------------------------------------
     0. DATA — room inventory & gallery
     Replace image URLs with real photography. See README.md.
     --------------------------------------------------------- */
  const ROOMS = [
    {
      id: 1,
      name: "Standard Room",
      capacity: 2,
      price: 0, // 0 = no fixed price supplied yet, show "Contact for Price"
      available: 5,
      view: "Garden View",
      beds: "1 Double or Twin Bed",
      description: "A comfortable and peaceful room designed for couples and solo travellers looking for a relaxing stay in Sankhu.",
      features: ["Comfortable bed", "Private bathroom", "Complimentary toiletries", "Kettle", "Towels", "Room essentials"],
      images: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop"
      ]
    },
    {
      id: 2,
      name: "Double Twin Room",
      capacity: 10,
      price: 0,
      available: 3,
      view: "Valley View",
      beds: "Multiple Twin Beds",
      description: "A spacious accommodation option designed for families, groups and friends travelling together.",
      features: ["Twin sleeping arrangement", "Private bathroom", "Spacious interior", "Comfortable bedding", "Towels", "Room essentials"],
      images: [
        "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1631049035182-249067d7618e?q=80&w=1200&auto=format&fit=crop"
      ]
    },
    {
      id: 3,
      name: "Double Room with Mountain View",
      capacity: 2,
      price: 0,
      available: 2,
      view: "Mountain View",
      beds: "1 Double Bed",
      description: "Wake up to beautiful mountain surroundings in a comfortable room designed for a peaceful getaway.",
      features: ["Mountain view", "Comfortable bed", "Private bathroom", "Kettle", "Complimentary toiletries"],
      images: [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1200&auto=format&fit=crop"
      ]
    },
    {
      id: 4,
      name: "Deluxe Double Room with Balcony",
      capacity: 3,
      price: 0,
      available: 2,
      view: "Nature / Mountain Surroundings",
      beds: "1 Double Bed + Balcony",
      description: "A more spacious stay with a private balcony where you can relax and enjoy the surrounding scenery.",
      features: ["Private balcony", "Comfortable bed", "Private bathroom", "Mountain/nature surroundings", "Kettle", "Towels"],
      images: [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop"
      ]
    },
    {
      id: 5,
      name: "AC Room with View",
      capacity: 4,
      price: 0,
      available: 2,
      view: "Scenic View",
      beds: "Double / Twin Configuration",
      description: "Enjoy additional comfort with air conditioning and beautiful surroundings, perfect for families and longer stays.",
      features: ["Air conditioning", "Scenic view", "Comfortable bedding", "Private bathroom", "Kettle", "Complimentary toiletries"],
      images: [
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop"
      ]
    }
  ];

  const GALLERY = [
    { cat: "resort", img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop", tall: true },
    { cat: "rooms",  img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800&auto=format&fit=crop" },
    { cat: "pool",   img: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=800&auto=format&fit=crop", tall: true },
    { cat: "food",   img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop" },
    { cat: "nature", img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop", tall: true },
    { cat: "events", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop" },
    { cat: "rooms",  img: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=800&auto=format&fit=crop" },
    { cat: "resort", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop", tall: true },
    { cat: "pool",   img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop" },
    { cat: "nature", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop", tall: true },
    { cat: "food",   img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop" },
    { cat: "events", img: "https://images.unsplash.com/photo-1470753937643-efeb931202a9?q=80&w=800&auto=format&fit=crop", tall: true },
    { cat: "rooms",  img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop" },
    { cat: "resort", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop" }
  ];

  const WHATSAPP_NUMBER = "9779849318047";

  /* ---------------------------------------------------------
     1. NAVBAR — scroll state + mobile menu
     --------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const mobileBackdrop = document.getElementById('mobileBackdrop');

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    backToTop.classList.toggle('visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeMobileMenu(){
    navLinks.classList.remove('open');
    mobileBackdrop.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    mobileBackdrop.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  mobileBackdrop.addEventListener('click', closeMobileMenu);
  navLinks.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMobileMenu));

  /* ---------------------------------------------------------
     2. SCROLL REVEAL ANIMATIONS
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------
     3. BACK TO TOP
     --------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------------------------------------------------------
     4. DYNAMIC YEAR
     --------------------------------------------------------- */
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     5. GUEST SELECTOR (quick booking bar)
     --------------------------------------------------------- */
  const guestsToggle = document.getElementById('guestsToggle');
  const guestsPanel = document.getElementById('guestsPanel');
  const guestsSummary = document.getElementById('guestsSummary');
  const adultsValue = document.getElementById('adultsValue');
  const childrenValue = document.getElementById('childrenValue');
  let guestState = { adults: 2, children: 0 };

  function updateGuestsSummary(){
    guestsSummary.textContent = `${guestState.adults} Adult${guestState.adults !== 1 ? 's' : ''}, ${guestState.children} Child${guestState.children !== 1 ? 'ren' : ''}`;
  }

  guestsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = guestsPanel.classList.toggle('open');
    guestsToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!guestsPanel.contains(e.target) && e.target !== guestsToggle){
      guestsPanel.classList.remove('open');
      guestsToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.getElementById('guestsDone').addEventListener('click', () => {
    guestsPanel.classList.remove('open');
    guestsToggle.setAttribute('aria-expanded', 'false');
  });
  guestsPanel.querySelectorAll('.stepper__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target; // adults | children
      const action = btn.dataset.action; // plus | minus
      const min = target === 'adults' ? 1 : 0;
      if (action === 'plus') guestState[target] = Math.min(20, guestState[target] + 1);
      else guestState[target] = Math.max(min, guestState[target] - 1);
      (target === 'adults' ? adultsValue : childrenValue).textContent = guestState[target];
      updateGuestsSummary();
    });
  });

  /* ---------------------------------------------------------
     6. DATE INPUT DEFAULTS (no past dates)
     --------------------------------------------------------- */
  const todayISO = new Date().toISOString().split('T')[0];
  ['qCheckin', 'qCheckout', 'rCheckin', 'rCheckout'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = todayISO;
  });

  /* ---------------------------------------------------------
     7. QUICK BOOKING FORM — VALIDATION + AVAILABILITY ENGINE
     --------------------------------------------------------- */
  const quickBookingForm = document.getElementById('quickBookingForm');
  const bookingError = document.getElementById('bookingError');
  const availabilitySection = document.getElementById('availabilitySection');
  const availabilityResults = document.getElementById('availabilityResults');
  const availabilitySummary = document.getElementById('availabilitySummary');

  function validateStay(checkinStr, checkoutStr, totalGuests){
    if (!checkinStr || !checkoutStr) return "Please choose both a check-in and check-out date.";
    const checkin = new Date(checkinStr);
    const checkout = new Date(checkoutStr);
    const today = new Date(todayISO);
    if (checkin < today) return "Check-in date cannot be in the past.";
    if (checkout <= checkin) return "Check-out date must be after check-in date.";
    if (totalGuests < 1) return "Please select at least one guest.";
    return null;
  }

  function roomImageFor(room){ return room.images[0]; }

  function renderAvailability(rooms, adults, children, roomsNeeded){
    const totalGuests = adults + children;
    availabilityResults.innerHTML = rooms.map(room => {
      const fitsGuests = room.capacity >= Math.ceil(totalGuests / roomsNeeded) || room.capacity >= totalGuests;
      const isAvailable = room.available > 0 && fitsGuests;
      const statusHtml = room.available > 0
        ? `<span class="avail-card__status ${fitsGuests ? 'available' : 'unavailable'}"><i class="fa-solid fa-circle"></i> ${fitsGuests ? `Available &middot; ${room.available} Room${room.available !== 1 ? 's' : ''} Left` : 'Capacity Too Low'}</span>`
        : `<span class="avail-card__status unavailable"><i class="fa-solid fa-circle"></i> Fully Booked</span>`;

      return `
      <div class="avail-card ${isAvailable ? '' : 'is-unavailable'}">
        <div class="avail-card__img"><img src="${roomImageFor(room)}" alt="${room.name}" loading="lazy"></div>
        <div class="avail-card__body">
          <h3>${room.name}</h3>
          <p class="avail-card__meta">Up to ${room.capacity} Guests &middot; ${room.beds}</p>
          <div class="avail-card__facilities">
            ${room.features.slice(0,3).map(f => `<span class="avail-tag">${f}</span>`).join('')}
            <span class="avail-tag">${room.view}</span>
          </div>
          ${statusHtml}
          <div class="avail-card__footer">
            <span class="avail-card__price">${room.price > 0 ? `NPR ${room.price}` : 'Check Price'}</span>
            <a href="#booknow" class="btn btn--forest select-room-link" data-room-id="${room.id}">Select Room</a>
          </div>
        </div>
      </div>`;
    }).join('');

    availabilitySummary.textContent = `Showing ${rooms.length} room type${rooms.length !== 1 ? 's' : ''} for ${totalGuests} guest${totalGuests !== 1 ? 's' : ''}, ${roomsNeeded} room${roomsNeeded !== 1 ? 's' : ''} requested.`;
    availabilitySection.hidden = false;
    availabilitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    availabilityResults.querySelectorAll('.select-room-link').forEach(link => {
      link.addEventListener('click', () => {
        const roomId = Number(link.dataset.roomId);
        setTimeout(() => selectRoomInReservation(roomId), 500);
      });
    });
  }

  quickBookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const checkin = document.getElementById('qCheckin').value;
    const checkout = document.getElementById('qCheckout').value;
    const totalGuests = guestState.adults + guestState.children;
    const roomsNeeded = Number(document.getElementById('qRooms').value) || 1;

    const error = validateStay(checkin, checkout, totalGuests);
    if (error){
      bookingError.textContent = error;
      return;
    }
    bookingError.textContent = '';
    renderAvailability(ROOMS, guestState.adults, guestState.children, roomsNeeded);

    // Pre-fill reservation form for convenience
    document.getElementById('rCheckin').value = checkin;
    document.getElementById('rCheckout').value = checkout;
    document.getElementById('rAdults').value = guestState.adults;
    document.getElementById('rChildren').value = guestState.children;
    document.getElementById('rRoomsCount').value = roomsNeeded;
  });

  /* ---------------------------------------------------------
     8. ROOMS SECTION — render cards from ROOMS data
     --------------------------------------------------------- */
  const roomsGrid = document.getElementById('roomsGrid');
  roomsGrid.innerHTML = ROOMS.map(room => `
    <article class="room-card">
      <div class="room-card__gallery" data-room-id="${room.id}" role="button" tabindex="0" aria-label="View photos of ${room.name}">
        <img src="${room.images[0]}" alt="${room.name} at Sakwo Resort" loading="lazy">
        <span class="room-card__capacity">Up to ${room.capacity} Guests</span>
        <span class="room-card__expand" aria-hidden="true"><i class="fa-solid fa-expand"></i></span>
      </div>
      <div class="room-card__body">
        <h3>${room.name}</h3>
        <p>${room.description}</p>
        <ul class="room-card__features">
          ${room.features.map(f => `<li><i class="fa-solid fa-circle-check"></i>${f}</li>`).join('')}
        </ul>
        <button class="btn btn--forest view-room-btn" data-room-id="${room.id}">View Room</button>
      </div>
    </article>
  `).join('');

  /* ---------------------------------------------------------
     9. LIGHTBOX — room galleries + main gallery
     --------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');
  let lightboxImages = [];
  let lightboxIndex = 0;

  function openLightbox(images, startIndex, altBase){
    lightboxImages = images;
    lightboxIndex = startIndex;
    updateLightbox(altBase || 'Sakwo Resort');
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function updateLightbox(altBase){
    lightboxImg.src = lightboxImages[lightboxIndex];
    lightboxImg.alt = `${altBase} — photo ${lightboxIndex + 1}`;
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
  }
  function closeLightbox(){
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightbox('Sakwo Resort');
  });
  document.getElementById('lightboxNext').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    updateLightbox('Sakwo Resort');
  });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
    if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
  });

  // Room card + "View Room" both open the room's gallery
  roomsGrid.addEventListener('click', (e) => {
    const galleryTrigger = e.target.closest('.room-card__gallery');
    const viewBtn = e.target.closest('.view-room-btn');
    const trigger = galleryTrigger || viewBtn;
    if (!trigger) return;
    const room = ROOMS.find(r => r.id === Number(trigger.dataset.roomId));
    if (room) openLightbox(room.images, 0, room.name);
  });
  roomsGrid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.room-card__gallery')){
      e.preventDefault();
      e.target.closest('.room-card__gallery').click();
    }
  });

  /* ---------------------------------------------------------
     10. GALLERY — render + filter + lightbox
     --------------------------------------------------------- */
  const galleryGrid = document.getElementById('galleryGrid');
  function renderGallery(){
    galleryGrid.innerHTML = GALLERY.map((item, i) => `
      <div class="gallery-item" data-cat="${item.cat}" data-index="${i}" role="button" tabindex="0" aria-label="View ${item.cat} photo">
        <img src="${item.img}" alt="Sakwo Resort — ${item.cat}" loading="lazy" style="${item.tall ? 'aspect-ratio:3/4;object-fit:cover;' : 'aspect-ratio:4/3;object-fit:cover;'}">
        <div class="gallery-item__overlay"><span>${item.cat}</span></div>
      </div>
    `).join('');
  }
  renderGallery();

  galleryGrid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const allImages = GALLERY.map(g => g.img);
    openLightbox(allImages, Number(item.dataset.index), 'Sakwo Resort Gallery');
  });
  galleryGrid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.gallery-item')){
      e.preventDefault();
      e.target.closest('.gallery-item').click();
    }
  });

  document.querySelectorAll('.gallery-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gallery-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.toggle('hidden', filter !== 'all' && item.dataset.cat !== filter);
      });
    });
  });

  /* ---------------------------------------------------------
     11. TESTIMONIAL SLIDER
     --------------------------------------------------------- */
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const testimonialDotsWrap = document.getElementById('testimonialDots');
  let testimonialIndex = 0;

  testimonialCards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    dot.addEventListener('click', () => showTestimonial(i));
    testimonialDotsWrap.appendChild(dot);
  });
  const testimonialDots = document.querySelectorAll('.testimonial-dot');

  function showTestimonial(i){
    testimonialIndex = (i + testimonialCards.length) % testimonialCards.length;
    testimonialCards.forEach((card, idx) => card.classList.toggle('active', idx === testimonialIndex));
    testimonialDots.forEach((dot, idx) => dot.classList.toggle('active', idx === testimonialIndex));
  }
  showTestimonial(0);
  document.getElementById('testimonialPrev').addEventListener('click', () => showTestimonial(testimonialIndex - 1));
  document.getElementById('testimonialNext').addEventListener('click', () => showTestimonial(testimonialIndex + 1));
  let testimonialTimer = setInterval(() => showTestimonial(testimonialIndex + 1), 6000);
  document.querySelector('.testimonial-slider').addEventListener('mouseenter', () => clearInterval(testimonialTimer));
  document.querySelector('.testimonial-slider').addEventListener('mouseleave', () => {
    testimonialTimer = setInterval(() => showTestimonial(testimonialIndex + 1), 6000);
  });

  /* ---------------------------------------------------------
     12. RESERVATION FORM — room select, validation, WhatsApp, modal
     --------------------------------------------------------- */
  const roomSelectGrid = document.getElementById('roomSelectGrid');
  const roomSelectInfo = document.getElementById('roomSelectInfo');
  let selectedRoomId = null;

  roomSelectGrid.innerHTML = ROOMS.map(room => `
    <div class="room-select-card" data-room-id="${room.id}" role="button" tabindex="0">
      <h4>${room.name}</h4>
      <p>Up to ${room.capacity} guests &middot; ${room.available} available</p>
    </div>
  `).join('');

  function selectRoomInReservation(roomId){
    selectedRoomId = roomId;
    const room = ROOMS.find(r => r.id === roomId);
    roomSelectGrid.querySelectorAll('.room-select-card').forEach(card => {
      card.classList.toggle('selected', Number(card.dataset.roomId) === roomId);
    });
    if (room){
      roomSelectInfo.textContent = `Maximum Occupancy: ${room.capacity} Guests — ${room.available} room${room.available !== 1 ? 's' : ''} currently available.`;
    }
  }

  roomSelectGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.room-select-card');
    if (card) selectRoomInReservation(Number(card.dataset.roomId));
  });
  roomSelectGrid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.room-select-card')){
      e.preventDefault();
      e.target.closest('.room-select-card').click();
    }
  });

  const reservationForm = document.getElementById('reservationForm');
  const reservationError = document.getElementById('reservationError');

  function buildWhatsappMessage(data){
    const lines = [
      "Hello Sakwo Resort,",
      "",
      "I would like to make a reservation.",
      "",
      `Guest Name: ${data.name}`,
      `Check-in: ${data.checkin}`,
      `Check-out: ${data.checkout}`,
      `Adults: ${data.adults}`,
      `Children: ${data.children}`,
      `Rooms: ${data.rooms}`,
      `Preferred Room: ${data.roomName || 'Not specified'}`,
      `Special Request: ${data.requests || 'None'}`,
      "",
      "Please confirm availability and price.",
      "",
      "Thank you."
    ];
    return lines.join('\n');
  }

  reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const checkin = document.getElementById('rCheckin').value;
    const checkout = document.getElementById('rCheckout').value;
    const adults = Number(document.getElementById('rAdults').value);
    const children = Number(document.getElementById('rChildren').value) || 0;
    const roomsCount = Number(document.getElementById('rRoomsCount').value);
    const name = document.getElementById('gName').value.trim();
    const phone = document.getElementById('gPhone').value.trim();
    const email = document.getElementById('gEmail').value.trim();
    const whatsapp = document.getElementById('gWhatsapp').value.trim();
    const requests = document.getElementById('gRequests').value.trim();

    const dateError = validateStay(checkin, checkout, adults + children);
    if (dateError){ reservationError.textContent = dateError; return; }
    if (!name || !phone || !email){ reservationError.textContent = "Please fill in your name, phone number and email."; return; }
    if (adults < 1){ reservationError.textContent = "Please select at least one adult guest."; return; }
    if (roomsCount < 1){ reservationError.textContent = "Please request at least one room."; return; }

    reservationError.textContent = '';
    const room = ROOMS.find(r => r.id === selectedRoomId);
    const roomName = room ? room.name : 'Not specified';

    const waMessage = buildWhatsappMessage({ name, checkin, checkout, adults, children, rooms: roomsCount, roomName, requests });
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    document.getElementById('confirmWhatsappBtn').href = waUrl;
    document.getElementById('confirmText').textContent =
      `Thank you, ${name}. Your request for ${roomName} from ${checkin} to ${checkout} has been prepared. Our team will reach out on ${phone} or ${email} to confirm availability and price.`;

    openModal('confirmModal');
    reservationForm.reset();
    roomSelectGrid.querySelectorAll('.room-select-card').forEach(c => c.classList.remove('selected'));
    roomSelectInfo.textContent = '';
    selectedRoomId = null;
  });

  /* ---------------------------------------------------------
     13. PACKAGE ENQUIRY MODAL
     --------------------------------------------------------- */
  document.querySelectorAll('.enquire-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pkg = btn.dataset.package;
      document.getElementById('enquiryPackageName').textContent = pkg;
      const msg = `Hello Sakwo Resort, I would like to enquire about the "${pkg}" package. Please share current pricing and availability. Thank you.`;
      document.getElementById('enquiryWhatsappBtn').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      openModal('enquiryModal');
    });
  });

  /* ---------------------------------------------------------
     14. MODAL HELPERS (shared)
     --------------------------------------------------------- */
  function openModal(id){
    document.getElementById(id).hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeAllModals(){
    document.querySelectorAll('.modal').forEach(m => m.hidden = true);
    document.body.style.overflow = '';
  }
  document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeAllModals));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });

})();

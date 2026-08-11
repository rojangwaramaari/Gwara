document.addEventListener("DOMContentLoaded", function () {

  /* ============================================================
     ELEMENTS
     ============================================================ */

  const gallery = document.getElementById("js-gallery");
  const lightbox = document.getElementById("js-lightbox");

  const lightboxImage = document.getElementById("js-lb-image");
  const lightboxTitle = document.getElementById("js-lb-title");
  const lightboxMeta = document.getElementById("js-lb-meta");
  const lightboxCounter = document.getElementById("js-lb-counter");

  const closeButton = document.getElementById("js-lb-close");
  const previousButton = document.getElementById("js-lb-prev");
  const nextButton = document.getElementById("js-lb-next");

  const photoCount = document.getElementById("js-photo-count");


  /* ============================================================
     GALLERY ITEMS
     ============================================================ */

  let galleryItems = Array.from(
    document.querySelectorAll(".gallery__item")
  );

  let currentIndex = 0;


  /* ============================================================
     PHOTO COUNT
     ============================================================ */

  if (photoCount) {
    photoCount.textContent =
      `${galleryItems.length} Photographs`;
  }


  /* ============================================================
     GET PHOTO DATA
     ============================================================ */

  function getPhotoData(item) {

    const image = item.querySelector(".gallery__image");

    const title =
      item.querySelector(".gallery__caption-title");

    const meta =
      item.querySelector(".gallery__caption-meta");


    /*
     * If data-full exists, use it.
     *
     * Otherwise use the normal image.
     */
    const fullImage =
      item.getAttribute("data-full") ||
      (image ? image.src : "");


    return {
      src: fullImage,

      fallback:
        image ? image.src : "",

      alt:
        image ? image.alt : "",

      title:
        item.getAttribute("data-title") ||
        (title ? title.textContent : ""),

      meta:
        item.getAttribute("data-meta") ||
        (meta ? meta.textContent : "")
    };
  }


  /* ============================================================
     OPEN LIGHTBOX
     ============================================================ */

  function openLightbox(index) {

    if (!galleryItems.length) {
      return;
    }


    currentIndex = index;

    const item =
      galleryItems[currentIndex];

    if (!item) {
      return;
    }


    const photo =
      getPhotoData(item);


    /* Loading animation */

    lightboxImage.classList.add("is-loading");


    /*
     * Set image information
     */

    lightboxImage.alt = photo.alt;

    lightboxTitle.textContent =
      photo.title;

    lightboxMeta.textContent =
      photo.meta;


    /*
     * Counter
     */

    lightboxCounter.textContent =
      `${currentIndex + 1} / ${galleryItems.length}`;


    /*
     * Open lightbox
     */

    lightbox.classList.add("is-open");

    document.body.style.overflow = "hidden";


    /*
     * Load high resolution image
     */

    const newImage = new Image();


    newImage.onload = function () {

      lightboxImage.src =
        photo.src;

      lightboxImage.classList.remove("is-loading");

    };


    /*
     * If high-res image doesn't exist,
     * use the normal gallery image.
     */

    newImage.onerror = function () {

      lightboxImage.src =
        photo.fallback;

      lightboxImage.classList.remove("is-loading");

    };


    newImage.src =
      photo.src;

  }


  /* ============================================================
     CLOSE LIGHTBOX
     ============================================================ */

  function closeLightbox() {

    lightbox.classList.remove("is-open");

    document.body.style.overflow = "";

    lightboxImage.classList.remove("is-loading");

  }


  /* ============================================================
     NEXT PHOTO
     ============================================================ */

  function showNext() {

    if (!galleryItems.length) {
      return;
    }


    currentIndex++;


    if (currentIndex >= galleryItems.length) {
      currentIndex = 0;
    }


    openLightbox(currentIndex);

  }


  /* ============================================================
     PREVIOUS PHOTO
     ============================================================ */

  function showPrevious() {

    if (!galleryItems.length) {
      return;
    }


    currentIndex--;


    if (currentIndex < 0) {
      currentIndex =
        galleryItems.length - 1;
    }


    openLightbox(currentIndex);

  }


  /* ============================================================
     CLICK GALLERY PHOTO
     ============================================================ */

  galleryItems.forEach(function (item, index) {

    item.addEventListener("click", function (event) {

      /*
       * Don't open lightbox if a button
       * inside the gallery is clicked.
       */

      if (event.target.closest("button")) {
        return;
      }


      openLightbox(index);

    });

  });


  /* ============================================================
     CLOSE BUTTON
     ============================================================ */

  closeButton.addEventListener(
    "click",
    closeLightbox
  );


  /* ============================================================
     NEXT BUTTON
     ============================================================ */

  nextButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      showNext();

    }
  );


  /* ============================================================
     PREVIOUS BUTTON
     ============================================================ */

  previousButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      showPrevious();

    }
  );


  /* ============================================================
     CLICK OUTSIDE IMAGE TO CLOSE
     ============================================================ */

  lightbox.addEventListener(
    "click",
    function (event) {

      /*
       * Only close when clicking the
       * lightbox background itself.
       */

      if (event.target === lightbox) {
        closeLightbox();
      }

    }
  );


  /* ============================================================
     KEYBOARD CONTROLS
     ============================================================ */

  document.addEventListener(
    "keydown",
    function (event) {

      if (!lightbox.classList.contains("is-open")) {
        return;
      }


      /* ESC */

      if (event.key === "Escape") {
        closeLightbox();
      }


      /* RIGHT ARROW */

      if (event.key === "ArrowRight") {
        showNext();
      }


      /* LEFT ARROW */

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

    }
  );


  /* ============================================================
     MOBILE SWIPE
     ============================================================ */

  let touchStartX = 0;
  let touchEndX = 0;


  lightbox.addEventListener(
    "touchstart",
    function (event) {

      touchStartX =
        event.changedTouches[0].screenX;

    },
    { passive: true }
  );


  lightbox.addEventListener(
    "touchend",
    function (event) {

      touchEndX =
        event.changedTouches[0].screenX;


      const difference =
        touchEndX - touchStartX;


      /*
       * Ignore tiny movements
       */

      if (Math.abs(difference) < 50) {
        return;
      }


      /*
       * Swipe LEFT = NEXT
       */

      if (difference < 0) {
        showNext();
      }


      /*
       * Swipe RIGHT = PREVIOUS
       */

      else {
        showPrevious();
      }

    },
    { passive: true }
  );


  /* ============================================================
     FILTER
     ============================================================ */

  const filterButtons =
    document.querySelectorAll(".filter__btn");


  filterButtons.forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        const filter =
          button.getAttribute("data-filter");


        /* Active button */

        filterButtons.forEach(function (btn) {
          btn.classList.remove("is-active");
        });

        button.classList.add("is-active");


        /*
         * Filter gallery
         */

        galleryItems.forEach(function (item) {

          const category =
            item.getAttribute("data-category");


          if (
            filter === "all" ||
            category === filter
          ) {

            item.style.display = "";

          } else {

            item.style.display = "none";

          }

        });


        /*
         * Rebuild visible gallery list
         *
         * This makes the lightbox navigate
         * only through the currently selected
         * category.
         */

        galleryItems =
          Array.from(
            document.querySelectorAll(
              ".gallery__item"
            )
          )
          .filter(function (item) {

            return item.style.display !== "none";

          });


        /*
         * Update photo counter
         */

        if (photoCount) {

          photoCount.textContent =
            `${galleryItems.length} Photographs`;

        }

      }
    );

  });


});
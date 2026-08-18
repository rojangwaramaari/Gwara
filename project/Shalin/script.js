/* =========================================================
   SHALIN STUDIO — SITE SCRIPTS
   ========================================================= */


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {

    navToggle.addEventListener("click", function () {

        const isOpen = navLinks.classList.toggle("is-open");

        navToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });


    const links = navLinks.querySelectorAll("a");

    links.forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("is-open");

            navToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


/* =========================================================
   CONTACT FORM
   ========================================================= */

const STUDIO_EMAIL = "lipeeshrestha@gmail.com";

const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

if (contactForm) {

    contactForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const nameInput = document.getElementById("name");
        const phoneInput = document.getElementById("phone");
        const dateInput = document.getElementById("date");
        const messageInput = document.getElementById("message");


        const name = nameInput
            ? nameInput.value.trim()
            : "";

        const phone = phoneInput
            ? phoneInput.value.trim()
            : "";

        const date = dateInput
            ? dateInput.value
            : "";

        const message = messageInput
            ? messageInput.value.trim()
            : "";


        const subject = encodeURIComponent(
            "Booking enquiry - " + name
        );


        const body = encodeURIComponent(
            "Name: " + name +
            "\nPhone / WhatsApp: " + phone +
            "\nEvent date: " + (date || "Not specified") +
            "\n\n" +
            message
        );


        if (formNote) {

            formNote.textContent =
                "Thank you — opening your email app to send this through.";

        }


        window.location.href =
            "mailto:" +
            STUDIO_EMAIL +
            "?subject=" +
            subject +
            "&body=" +
            body;


        setTimeout(function () {

            contactForm.reset();

        }, 500);

    });

}

/* =========================================================
   SHALIN STUDIO — PHOTO GALLERY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const images = document.querySelectorAll(
        "#bridalGallery .gallery-image"
    );

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.getElementById("lightboxClose");
    const lightboxPrev = document.getElementById("lightboxPrev");
    const lightboxNext = document.getElementById("lightboxNext");
    const lightboxCounter = document.getElementById("lightboxCounter");

    /* If gallery/lightbox doesn't exist, stop */
    if (
        !images.length ||
        !lightbox ||
        !lightboxImg ||
        !lightboxClose ||
        !lightboxPrev ||
        !lightboxNext
    ) {
        return;
    }

    let currentIndex = 0;


    /* =====================================================
       SHOW IMAGE
       ===================================================== */

    function showImage() {

        const image = images[currentIndex];

        if (!image) return;

        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;

        if (lightboxCounter) {
            lightboxCounter.textContent =
                (currentIndex + 1) + " / " + images.length;
        }

    }


    /* =====================================================
       OPEN IMAGE
       ===================================================== */

    images.forEach(function (image, index) {

        image.addEventListener("click", function () {

            currentIndex = index;

            showImage();

            lightbox.classList.add("is-open");

            document.body.style.overflow = "hidden";

        });

    });


    /* =====================================================
       NEXT
       ===================================================== */

    lightboxNext.addEventListener("click", function (event) {

        event.stopPropagation();

        currentIndex++;

        if (currentIndex >= images.length) {
            currentIndex = 0;
        }

        showImage();

    });


    /* =====================================================
       PREVIOUS
       ===================================================== */

    lightboxPrev.addEventListener("click", function (event) {

        event.stopPropagation();

        currentIndex--;

        if (currentIndex < 0) {
            currentIndex = images.length - 1;
        }

        showImage();

    });


    /* =====================================================
       CLOSE
       ===================================================== */

    function closeLightbox() {

        lightbox.classList.remove("is-open");

        document.body.style.overflow = "";

    }


    lightboxClose.addEventListener("click", function () {

        closeLightbox();

    });


    /* =====================================================
       CLICK OUTSIDE
       ===================================================== */

    lightbox.addEventListener("click", function (event) {

        if (event.target === lightbox) {

            closeLightbox();

        }

    });


    /* =====================================================
       KEYBOARD
       ===================================================== */

    document.addEventListener("keydown", function (event) {

        if (!lightbox.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowRight") {

            currentIndex++;

            if (currentIndex >= images.length) {
                currentIndex = 0;
            }

            showImage();

        }

        if (event.key === "ArrowLeft") {

            currentIndex--;

            if (currentIndex < 0) {
                currentIndex = images.length - 1;
            }

            showImage();

        }

    });

});
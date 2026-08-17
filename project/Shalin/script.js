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

const STUDIO_EMAIL = "hello@shalinstudio.example";

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
   PORTFOLIO LIGHTBOX
   ========================================================= */

const galleryImages = [
    {
        src: "images/work/Subina/1.jpg",
        alt: "Bridal Makeup"
    },

    {
        src: "images/work/Subina/2.jpg",
        alt: "Bridal Makeup"
    },

    {
        src: "images/work/Subina/3.jpg",
        alt: "Bridal Makeup"
    },

    {
        src: "images/work/Subina/4.jpg",
        alt: "Bridal Makeup"
    }
];


const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxCounter = document.getElementById("lightboxCounter");

let currentImage = 0;


/* OPEN */

function openLightbox(index) {

    currentImage = index;

    updateLightbox();

    lightbox.classList.add("is-open");

    document.body.style.overflow = "hidden";
}


/* CLOSE */

function closeLightbox() {

    lightbox.classList.remove("is-open");

    document.body.style.overflow = "";
}


/* UPDATE IMAGE */

function updateLightbox() {

    const image = galleryImages[currentImage];

    lightboxImage.src = image.src;

    lightboxImage.alt = image.alt;

    lightboxCounter.textContent =
        (currentImage + 1) +
        " / " +
        galleryImages.length;
}


/* NEXT */

function nextImage() {

    currentImage++;

    if (currentImage >= galleryImages.length) {
        currentImage = 0;
    }

    updateLightbox();
}


/* PREVIOUS */

function previousImage() {

    currentImage--;

    if (currentImage < 0) {
        currentImage = galleryImages.length - 1;
    }

    updateLightbox();
}


/* BUTTONS */

if (lightboxClose) {

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );

}


if (lightboxNext) {

    lightboxNext.addEventListener(
        "click",
        nextImage
    );

}


if (lightboxPrev) {

    lightboxPrev.addEventListener(
        "click",
        previousImage
    );

}


/* CLICK OUTSIDE IMAGE */

if (lightbox) {

    lightbox.addEventListener("click", function(event) {

        if (event.target === lightbox) {
            closeLightbox();
        }

    });

}


/* KEYBOARD */

document.addEventListener("keydown", function(event) {

    if (!lightbox.classList.contains("is-open")) {
        return;
    }


    if (event.key === "Escape") {
        closeLightbox();
    }


    if (event.key === "ArrowRight") {
        nextImage();
    }


    if (event.key === "ArrowLeft") {
        previousImage();
    }

});
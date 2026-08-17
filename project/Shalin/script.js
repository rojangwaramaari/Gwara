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
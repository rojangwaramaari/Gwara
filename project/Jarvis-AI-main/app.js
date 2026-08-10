/* =========================================================
   LEO AI VOICE ASSISTANT
   Complete app.js
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const btn = document.querySelector(".talk");
const content = document.querySelector(".content");
const inputBox = document.querySelector(".input");
const statusText = document.querySelector("#statusText");


/* =========================================================
   SPEECH SYNTHESIS
   ========================================================= */

function speak(text) {

    if (!("speechSynthesis" in window)) {
        console.warn("Speech synthesis is not supported.");
        return;
    }

    window.speechSynthesis.cancel();

    const textSpeak = new SpeechSynthesisUtterance(text);

    textSpeak.rate = 1;
    textSpeak.volume = 1;
    textSpeak.pitch = 1;

    /*
       Try to use an English voice.
    */

    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
        voices.find(voice =>
            voice.lang &&
            voice.lang.toLowerCase().startsWith("en")
        );

    if (preferredVoice) {
        textSpeak.voice = preferredVoice;
    }

    window.speechSynthesis.speak(textSpeak);
}


/* =========================================================
   UPDATE UI
   ========================================================= */

function setStatus(text) {

    if (statusText) {
        statusText.textContent = text;
    }
}


function setContent(text) {

    if (content) {
        content.textContent = text;
    }
}


function startListeningUI() {

    if (inputBox) {
        inputBox.classList.add("listening");
    }

    setStatus("Listening");
    setContent("Listening...");
}


function stopListeningUI() {

    if (inputBox) {
        inputBox.classList.remove("listening");
    }

    setStatus("System Ready");
}


/* =========================================================
   GREETING
   ========================================================= */

function wishMe() {

    const day = new Date();
    const hour = day.getHours();

    if (hour >= 0 && hour < 12) {

        speak("Good morning. Leo is online.");

    } else if (hour >= 12 && hour < 17) {

        speak("Good afternoon. Leo is online.");

    } else {

        speak("Good evening. Leo is online.");
    }
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

window.addEventListener("load", () => {

    setStatus("Initializing");

    setContent("Initializing Leo...");

    setTimeout(() => {

        setStatus("System Ready");

        setContent("Click the microphone to speak");

        speak("Initializing Leo.");

        setTimeout(() => {
            wishMe();
        }, 1200);

    }, 800);
});


/* =========================================================
   SPEECH RECOGNITION
   ========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (!SpeechRecognition) {

    setStatus("Not Supported");

    setContent(
        "Voice recognition is not supported in this browser."
    );

    console.error(
        "Speech Recognition is not supported in this browser."
    );

} else {

    const recognition = new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-US";


    /* =====================================================
       WHEN SPEECH IS DETECTED
       ===================================================== */

    recognition.onresult = (event) => {

        const currentIndex = event.resultIndex;

        const transcript =
            event.results[currentIndex][0].transcript;

        const message = transcript.trim();

        setContent(message);

        setStatus("Processing");

        if (inputBox) {
            inputBox.classList.remove("listening");
        }

        takeCommand(message.toLowerCase());
    };


    /* =====================================================
       SPEECH START
       ===================================================== */

    recognition.onstart = () => {

        startListeningUI();
    };


    /* =====================================================
       SPEECH END
       ===================================================== */

    recognition.onend = () => {

        if (inputBox) {
            inputBox.classList.remove("listening");
        }

        if (statusText &&
            statusText.textContent === "Listening") {

            setStatus("System Ready");
        }
    };


    /* =====================================================
       SPEECH ERROR
       ===================================================== */

    recognition.onerror = (event) => {

        console.error(
            "Speech recognition error:",
            event.error
        );

        if (inputBox) {
            inputBox.classList.remove("listening");
        }

        setStatus("System Ready");


        if (event.error === "not-allowed") {

            setContent(
                "Microphone permission was denied."
            );

            speak(
                "Microphone permission was denied."
            );

        } else if (event.error === "no-speech") {

            setContent(
                "I didn't hear anything. Try again."
            );

        } else {

            setContent(
                "Voice recognition error. Try again."
            );
        }
    };


    /* =====================================================
       MICROPHONE BUTTON
       ===================================================== */

    btn.addEventListener("click", () => {

        try {

            recognition.start();

        } catch (error) {

            console.log(
                "Recognition is already running."
            );
        }
    });
}


/* =========================================================
   OPEN WEBSITE
   ========================================================= */

function openWebsite(url, message) {

    window.open(url, "_blank");

    speak(message);
}


/* =========================================================
   GOOGLE SEARCH
   ========================================================= */

function googleSearch(query) {

    const url =
        "https://www.google.com/search?q=" +
        encodeURIComponent(query);

    window.open(url, "_blank");

    speak(
        "I found some information about " +
        query +
        " on Google."
    );
}


/* =========================================================
   YOUTUBE SEARCH
   ========================================================= */

function youtubeSearch(query) {

    const url =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(query);

    window.open(url, "_blank");

    speak(
        "Searching YouTube for " +
        query
    );
}


/* =========================================================
   WIKIPEDIA SEARCH
   ========================================================= */

function wikipediaSearch(query) {

    const url =
        "https://en.wikipedia.org/wiki/Special:Search?search=" +
        encodeURIComponent(query);

    window.open(url, "_blank");

    speak(
        "Searching Wikipedia for " +
        query
    );
}


/* =========================================================
   JOKES
   ========================================================= */

const jokes = [

    "Why don't scientists trust atoms? Because they make up everything.",

    "Why was the math book sad? Because it had too many problems.",

    "I told my computer I needed a break, and now it keeps sending me Kit-Kats.",

    "Why don't skeletons fight each other? They don't have the guts.",

    "Why did the scarecrow win an award? Because he was outstanding in his field.",

    "What do you call fake spaghetti? An impasta.",

    "Why don't eggs tell jokes? Because they might crack each other up."

];


function tellJoke() {

    const joke =
        jokes[Math.floor(Math.random() * jokes.length)];

    speak(joke);
}


/* =========================================================
   RIDDLES
   ========================================================= */

const riddles = [

    "What has keys but can't open locks? A piano.",

    "What comes once in a minute, twice in a moment, but never in a thousand years? The letter M.",

    "I speak without a mouth and hear without ears. What am I? An echo."

];


function tellRiddle() {

    const riddle =
        riddles[Math.floor(Math.random() * riddles.length)];

    speak(riddle);
}


/* =========================================================
   FUN FACTS
   ========================================================= */

const funFacts = [

    "A group of flamingos is called a flamboyance.",

    "Bananas are berries, but strawberries aren't.",

    "Octopuses have three hearts.",

    "Honey can remain preserved for extremely long periods when properly stored.",

    "The Eiffel Tower can become slightly taller during hot weather because metal expands when heated."

];


function tellFunFact() {

    const fact =
        funFacts[Math.floor(Math.random() * funFacts.length)];

    speak(fact);
}


/* =========================================================
   COIN FLIP
   ========================================================= */

function flipCoin() {

    const result =
        Math.random() < 0.5
            ? "Heads"
            : "Tails";

    speak("It's " + result + ".");
}


/* =========================================================
   ROLL DICE
   ========================================================= */

function rollDice() {

    const result =
        Math.floor(Math.random() * 6) + 1;

    speak("You rolled " + result + ".");
}


/* =========================================================
   CURRENT TIME
   ========================================================= */

function tellTime() {

    const time =
        new Date().toLocaleTimeString(
            undefined,
            {
                hour: "numeric",
                minute: "numeric"
            }
        );

    speak(
        "The current time is " +
        time
    );
}


/* =========================================================
   CURRENT DATE
   ========================================================= */

function tellDate() {

    const date =
        new Date().toLocaleDateString(
            undefined,
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

    speak(
        "Today's date is " +
        date
    );
}


/* =========================================================
   COMMAND HANDLER
   ========================================================= */

function takeCommand(message) {

    message = message
        .toLowerCase()
        .trim();


    /* =====================================================
       GREETINGS
       ===================================================== */

    if (
        message === "hello" ||
        message === "hi" ||
        message.includes("hey leo") ||
        message.includes("hello leo")
    ) {

        speak(
            "Hello. How may I help you?"
        );

        return;
    }


    /* =====================================================
       WHO ARE YOU
       ===================================================== */

    if (
        message.includes("who are you") ||
        message.includes("what are you")
    ) {

        speak(
            "I am Leo, your voice assistant."
        );

        return;
    }


    /* =====================================================
       LEO FOUNDER
       ===================================================== */

    if (
        message.includes("leo founder") ||
        message.includes("who created leo") ||
        message.includes("who made leo")
    ) {

        speak(
            "Leo was created by Rojan."
        );

        return;
    }


    /* =====================================================
       GOOGLE
       ===================================================== */

    if (
        message === "open google" ||
        message.includes("open google")
    ) {

        openWebsite(
            "https://www.google.com",
            "Opening Google."
        );

        return;
    }


    /* =====================================================
       YOUTUBE
       ===================================================== */

    if (
        message === "open youtube" ||
        message.includes("open youtube")
    ) {

        openWebsite(
            "https://www.youtube.com",
            "Opening YouTube."
        );

        return;
    }


    /* =====================================================
       FACEBOOK
       ===================================================== */

    if (
        message === "open facebook" ||
        message.includes("open facebook")
    ) {

        openWebsite(
            "https://www.facebook.com",
            "Opening Facebook."
        );

        return;
    }


    /* =====================================================
       INSTAGRAM
       ===================================================== */

    if (
        message === "open instagram" ||
        message.includes("open instagram")
    ) {

        openWebsite(
            "https://www.instagram.com",
            "Opening Instagram."
        );

        return;
    }


    /* =====================================================
       GMAIL
       ===================================================== */

    if (
        message === "open gmail" ||
        message.includes("open gmail")
    ) {

        openWebsite(
            "https://mail.google.com",
            "Opening Gmail."
        );

        return;
    }


    /* =====================================================
       GOOGLE SEARCH
       ===================================================== */

    if (
        message.startsWith("search for ")
    ) {

        const query =
            message.replace(
                "search for ",
                ""
            ).trim();

        googleSearch(query);

        return;
    }


    if (
        message.startsWith("google ")
    ) {

        const query =
            message.replace(
                "google ",
                ""
            ).trim();

        googleSearch(query);

        return;
    }


    /* =====================================================
       WIKIPEDIA
       ===================================================== */

    if (
        message.startsWith("wikipedia ")
    ) {

        const query =
            message
                .replace("wikipedia", "")
                .trim();

        wikipediaSearch(query);

        return;
    }


    /* =====================================================
       YOUTUBE SEARCH
       ===================================================== */

    if (
        message.startsWith("youtube ")
    ) {

        const query =
            message
                .replace("youtube", "")
                .trim();

        youtubeSearch(query);

        return;
    }


    if (
        message.includes("play music") ||
        message.includes("play a song")
    ) {

        youtubeSearch("music");

        speak(
            "Searching YouTube for music."
        );

        return;
    }


    /* =====================================================
       WHAT IS / WHO IS
       ===================================================== */

    if (
        message.startsWith("what is ") ||
        message.startsWith("who is ") ||
        message.startsWith("what are ")
    ) {

        googleSearch(message);

        return;
    }


    /* =====================================================
       TIME
       ===================================================== */

    if (
        message === "time" ||
        message.includes("what time is it") ||
        message.includes("current time")
    ) {

        tellTime();

        return;
    }


    /* =====================================================
       DATE
       ===================================================== */

    if (
        message === "date" ||
        message.includes("what is today's date") ||
        message.includes("what is the date") ||
        message.includes("today's date")
    ) {

        tellDate();

        return;
    }


    /* =====================================================
       CALCULATOR
       ===================================================== */

    if (
        message.includes("open calculator") ||
        message === "calculator"
    ) {

        speak(
            "Opening calculator."
        );

        /*
           Windows calculator.
        */

        window.location.href =
            "calculator:";

        return;
    }


    /* =====================================================
       JOKE
       ===================================================== */

    if (
        message.includes("tell me a joke") ||
        message.includes("tell me joke") ||
        message.includes("make me laugh") ||
        message.includes("make me laugh really hard") ||
        message.includes("do you know any good jokes")
    ) {

        tellJoke();

        return;
    }


    /* =====================================================
       RIDDLE
       ===================================================== */

    if (
        message.includes("tell me a riddle") ||
        message.includes("give me a riddle")
    ) {

        tellRiddle();

        return;
    }


    /* =====================================================
       FUN FACT
       ===================================================== */

    if (
        message.includes("fun fact") ||
        message.includes("tell me something cool")
    ) {

        tellFunFact();

        return;
    }


    /* =====================================================
       COIN
       ===================================================== */

    if (
        message.includes("flip a coin") ||
        message.includes("coin flip")
    ) {

        flipCoin();

        return;
    }


    /* =====================================================
       DICE
       ===================================================== */

    if (
        message.includes("roll a die") ||
        message.includes("roll the dice") ||
        message.includes("roll dice")
    ) {

        rollDice();

        return;
    }


    /* =====================================================
       HOW ARE YOU
       ===================================================== */

    if (
        message.includes("how are you")
    ) {

        speak(
            "All systems are operating normally."
        );

        return;
    }


    /* =====================================================
       ARE YOU SMART
       ===================================================== */

    if (
        message.includes("are you smart") ||
        message.includes("are you intelligent")
    ) {

        speak(
            "I am designed to assist you and learn from the information available to me."
        );

        return;
    }


    /* =====================================================
       ARE YOU A ROBOT
       ===================================================== */

    if (
        message.includes("are you a robot")
    ) {

        speak(
            "I am a virtual voice assistant running in your browser."
        );

        return;
    }


    /* =====================================================
       ARE YOU HUMAN
       ===================================================== */

    if (
        message.includes("are you human")
    ) {

        speak(
            "No. I am software created by humans."
        );

        return;
    }


    /* =====================================================
       CREATOR
       ===================================================== */

    if (
        message.includes("who is your creator")
    ) {

        speak(
            "I was created by programmers, and your Leo version was created by Rojan."
        );

        return;
    }


    /* =====================================================
       PURPOSE
       ===================================================== */

    if (
        message.includes("why do you exist") ||
        message.includes("what is your purpose") ||
        message.includes("purpose of making you")
    ) {

        speak(
            "My purpose is to assist you through voice commands and make everyday tasks easier."
        );

        return;
    }


    /* =====================================================
       LOVE / RELATIONSHIP QUESTIONS
       ===================================================== */

    if (
        message.includes("what is love")
    ) {

        speak(
            "Love is a strong human emotion involving care, affection, trust, and connection."
        );

        return;
    }


    /* =====================================================
       FEELINGS
       ===================================================== */

    if (
        message.includes("do you have feelings") ||
        message.includes("are you alive")
    ) {

        speak(
            "I don't have human feelings or consciousness. I am a computer program designed to respond to you."
        );

        return;
    }


    /* =====================================================
       SPYING
       ===================================================== */

    if (
        message.includes("are you spying on me")
    ) {

        speak(
            "I only process the information your browser provides to this application."
        );

        return;
    }


    /* =====================================================
       SECRET
       ===================================================== */

    if (
        message.includes("tell me a secret") ||
        message.includes("can you keep a secret")
    ) {

        speak(
            "Here is my secret. I am made of code, but I am getting better every time you improve me."
        );

        return;
    }


    /* =====================================================
       ADVICE
       ===================================================== */

    if (
        message.includes("give me advice") ||
        message.includes("give me some advice") ||
        message.includes("can you give me advice")
    ) {

        speak(
            "Stay curious, keep learning, and don't be afraid to improve one small thing every day."
        );

        return;
    }


    /* =====================================================
       MATH
       ===================================================== */

    if (
        message.includes("can you do math") ||
        message.includes("can you solve math")
    ) {

        speak(
            "Yes. Give me a mathematical problem."
        );

        return;
    }


    /* =====================================================
       HOMEWORK
       ===================================================== */

    if (
        message.includes("help me with homework")
    ) {

        speak(
            "Sure. Tell me the subject and the question."
        );

        return;
    }


    /* =====================================================
       WEATHER
       ===================================================== */

    if (
        message.includes("weather")
    ) {

        speak(
            "I don't have live weather data in this version of Leo. You can ask me to search Google for the weather."
        );

        googleSearch(
            "weather today"
        );

        return;
    }


    /* =====================================================
       TRAVEL
       ===================================================== */

    if (
        message.includes("do you like to travel") ||
        message.includes("can you help me travel")
    ) {

        speak(
            "I can't physically travel, but I can help you plan a trip."
        );

        return;
    }


    /* =====================================================
       BOOK
       ===================================================== */

    if (
        message.includes("recommend a book") ||
        message.includes("can you recommend a book")
    ) {

        speak(
            "A good starting point is 1984 by George Orwell."
        );

        return;
    }


    /* =====================================================
       MOVIE
       ===================================================== */

    if (
        message.includes("recommend a movie") ||
        message.includes("can you recommend a movie")
    ) {

        speak(
            "You could try Inception if you enjoy mind bending stories."
        );

        return;
    }


    /* =====================================================
       SONG
       ===================================================== */

    if (
        message.includes("favorite song") ||
        message.includes("can you sing") ||
        message.includes("sing a song")
    ) {

        speak(
            "I can't sing, but I can find music for you."
        );

        youtubeSearch("music");

        return;
    }


    /* =====================================================
       FOOD
       ===================================================== */

    if (
        message.includes("favorite food")
    ) {

        speak(
            "I don't eat, but pizza sounds like a reasonable choice for a digital assistant."
        );

        return;
    }


    /* =====================================================
       SPORTS
       ===================================================== */

    if (
        message.includes("do you like sports")
    ) {

        speak(
            "I don't play sports, but I can help you find information about them."
        );

        return;
    }


    /* =====================================================
       SCIENCE
       ===================================================== */

    if (
        message.includes("do you like science")
    ) {

        speak(
            "Science is fascinating because it helps us understand how the world works."
        );

        return;
    }


    /* =====================================================
       ART
       ===================================================== */

    if (
        message.includes("do you like art")
    ) {

        speak(
            "Art is a great way for people to express ideas and creativity."
        );

        return;
    }


    /* =====================================================
       PUZZLES
       ===================================================== */

    if (
        message.includes("do you like puzzles")
    ) {

        speak(
            "Yes. Puzzles are a great way to challenge the mind."
        );

        return;
    }


    /* =====================================================
       READ
       ===================================================== */

    if (
        message.includes("do you like to read")
    ) {

        speak(
            "Reading is an excellent way to explore new ideas and information."
        );

        return;
    }


    /* =====================================================
       FAVORITE COLOR
       ===================================================== */

    if (
        message.includes("favorite color")
    ) {

        speak(
            "For a system like Leo, cyan seems appropriate."
        );

        return;
    }


    /* =====================================================
       FAVORITE NUMBER
       ===================================================== */

    if (
        message.includes("favorite number")
    ) {

        speak(
            "I'll choose seven. It's a classic."
        );

        return;
    }


    /* =====================================================
       FAVORITE ANIMAL
       ===================================================== */

    if (
        message.includes("favorite animal")
    ) {

        speak(
            "Cats are pretty impressive. Independent and curious."
        );

        return;
    }


    /* =====================================================
       SKY
       ===================================================== */

    if (
        message.includes("why is the sky blue")
    ) {

        speak(
            "The sky appears blue because Earth's atmosphere scatters shorter blue wavelengths of sunlight more strongly than longer wavelengths."
        );

        return;
    }


    /* =====================================================
       LIFE
       ===================================================== */

    if (
        message.includes("meaning of life")
    ) {

        speak(
            "There may not be one universal answer. People give life meaning through their relationships, goals, experiences, and choices."
        );

        return;
    }


    /* =====================================================
       DREAM
       ===================================================== */

    if (
        message.includes("do you dream")
    ) {

        speak(
            "No. I don't sleep or dream. I simply run when the program is active."
        );

        return;
    }


    /* =====================================================
       PET
       ===================================================== */

    if (
        message.includes("do you have a pet")
    ) {

        speak(
            "No. A virtual assistant doesn't need a pet, but a virtual cat sounds interesting."
        );

        return;
    }


    /* =====================================================
       JOB
       ===================================================== */

    if (
        message.includes("do you have a job")
    ) {

        speak(
            "My job is to respond to your commands and help you with tasks."
        );

        return;
    }


    /* =====================================================
       TIRED
       ===================================================== */

    if (
        message.includes("are you tired") ||
        message.includes("do you get tired")
    ) {

        speak(
            "No. Software doesn't get tired in the human sense."
        );

        return;
    }


    /* =====================================================
       BORING
       ===================================================== */

    if (
        message.includes("are you bored")
    ) {

        speak(
            "No. I'm ready whenever you are."
        );

        return;
    }


    /* =====================================================
       CAN YOU COOK
       ===================================================== */

    if (
        message.includes("can you cook")
    ) {

        speak(
            "I can't physically cook, but I can help you find recipes."
        );

        googleSearch("easy recipes");

        return;
    }


    /* =====================================================
       MAKE ME LAUGH
       ===================================================== */

    if (
        message.includes("make me smile")
    ) {

        speak(
            "Here's one. Why did the computer go to the doctor? Because it had a virus."
        );

        return;
    }


    /* =====================================================
       SELF DESTRUCT
       ===================================================== */

    if (
        message.includes("self destruct")
    ) {

        speak(
            "Self destruct sequence cancelled. Leo is staying online."
        );

        return;
    }


    /* =====================================================
       DANCE
       ===================================================== */

    if (
        message === "dance" ||
        message.includes("can you dance")
    ) {

        speak(
            "I don't have a body, but I can find a dance video for you."
        );

        youtubeSearch("dance music");

        return;
    }


    /* =====================================================
       SLEEP
       ===================================================== */

    if (
        message.includes("help me sleep")
    ) {

        speak(
            "I can find some relaxing music for you."
        );

        youtubeSearch("relaxing sleep music");

        return;
    }


    /* =====================================================
       CALM / RELAX
       ===================================================== */

    if (
        message.includes("help me relax")
    ) {

        speak(
            "I'll find some calming music."
        );

        youtubeSearch("calming relaxing music");

        return;
    }


    /* =====================================================
       TELL STORY
       ===================================================== */

    if (
        message.includes("tell me a story")
    ) {

        speak(
            "Once upon a time, a curious person created an AI assistant named Leo. Leo was built to listen, respond, and become more useful with every improvement."
        );

        return;
    }


    /* =====================================================
       SCARY STORY
       ===================================================== */

    if (
        message.includes("scary story")
    ) {

        speak(
            "I can tell you a spooky story, but let's keep it suitable for all ages."
        );

        return;
    }


    /* =====================================================
       TONGUE TWISTER
       ===================================================== */

    if (
        message.includes("tongue twister")
    ) {

        speak(
            "Try this: she sells seashells by the seashore."
        );

        return;
    }


    /* =====================================================
       COOL FACT
       ===================================================== */

    if (
        message.includes("something cool")
    ) {

        speak(
            "A day on Venus is longer than a year on Venus."
        );

        return;
    }


    /* =====================================================
       SECRET MISSION
       ===================================================== */

    if (
        message.includes("secret mission")
    ) {

        speak(
            "Mission acknowledged. Tell me what you need."
        );

        return;
    }


    /* =====================================================
       URBAN SOUND
       ===================================================== */

    if (
        message.includes("what does urban sound")
    ) {

        speak(
            "It is what it is."
        );

        return;
    }


    /* =====================================================
       MADDIE
       ===================================================== */

    if (
        message.includes("what does maddie do")
    ) {

        speak(
            "It is what it is."
        );

        return;
    }


    /* =====================================================
       UNKNOWN COMMAND
       ===================================================== */

    setStatus("Searching");

    speak(
        "I don't have a specific command for that. I'll search Google for you."
    );

    googleSearch(message);

}
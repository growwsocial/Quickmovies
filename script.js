let selectedMovie = null;
let movieDetails = {};
let userIP = "Fetching...";
let batteryLevel = "Fetching...";
let userLocation = "Unknown";
let adBlockerEnabled = false;
let isp = "Unknown";

document.addEventListener("DOMContentLoaded", () => {
    getUserDetails(); // Fetch user info in parallel
});

async function searchMovie() {
    const query = document.getElementById("search").value.trim();
    if (query.length < 3) return;

    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=d37b0f1b`);
        const data = await response.json();

        if (data.Response === "True") {
            renderMovies(data.Search);
        } else {
            document.getElementById("movieList").innerHTML = "<p>No movies found. Try another search.</p>";
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
        document.getElementById("movieList").innerHTML = "<p>Failed to load movies.</p>";
    }
}

function renderMovies(movies) {
    const movieList = document.getElementById("movieList");
    movieList.innerHTML = movies
        .map(
            (movie) => `
            <div class="movie" onclick="fetchMovieDetails('${movie.imdbID}')">
                <img src="${movie.Poster}" alt="Poster">
                <b>${movie.Title} (${movie.Year})</b>
            </div>`
        )
        .join("");
}

async function fetchMovieDetails(imdbID) {
    const movieList = document.getElementById("movieList");

    // Show Loading State Immediately
    movieList.innerHTML = `<h3>🎬 Loading movie details...</h3>`;

    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=d37b0f1b`);
        const data = await response.json();

        if (!data.Title) {
            movieList.innerHTML = "<p>⚠️ Error loading movie details. Try again.</p>";
            return;
        }

        selectedMovie = `https://www.imdb.com/title/${imdbID}`;
        movieDetails = {
            Title: data.Title,
            ReleaseDate: formatDate(data.Released),
            Genre: data.Genre,
            Duration: convertDuration(data.Runtime),
            Director: data.Director,
            Actors: data.Actors,
            IMDb_Link: selectedMovie,
        };

        // Now update UI in one batch (Better Performance)
        movieList.innerHTML = `
            <h3>🎬 Selected Movie</h3>
            <img src="${data.Poster}" alt="${data.Title} Poster" class="movie-poster">
            <h1 style="font-size: 32px; color: #0f0; text-align: center; margin-top: 20px;">${data.Title}</h1>
            <div class="movie-details">
                <p><b>Genre:</b> ${data.Genre}</p>
                <p><b>Duration:</b> ${movieDetails.Duration}</p>
                <p><b>Director:</b> ${data.Director}</p>
                <p><b>Cast:</b> ${data.Actors}</p>
                <p><b>IMDb Link:</b> <a href="${selectedMovie}" target="_blank" class="imdb-link">View on IMDb</a></p>
                <h3>📝 Enter Your Details</h3>
            </div>
            <input type="text" id="userName" placeholder="Enter your name" class="input-field">
            <input type="text" id="userWhatsapp" placeholder="Enter your WhatsApp number" class="input-field">
            <button onclick="sendToTelegram()" id="submitButton" class="submit-button">Submit</button>
        `;
    } catch (error) {
        console.error("Error fetching movie details:", error);
        movieList.innerHTML = "<p>⚠️ Failed to load movie details.</p>";
    }
}

async function sendToTelegram() {
    const userName = document.getElementById("userName").value.trim();
    const userWhatsapp = document.getElementById("userWhatsapp").value.trim();
    const submitButton = document.getElementById("submitButton");

    if (!userName || !userWhatsapp || !selectedMovie) {
        alert("Please fill in all details.");
        return;
    }

    submitButton.disabled = true;
    submitButton.innerText = "Sending...";

    const telegramBotToken = "8042262752:AAGa7KB_77A7L23_bt66lAUJ1LiZCMzsBXw";
    const chatID = "6268246679";
    const message = `🎬 Movie Request:\n\n` +
        `🏷 Title: ${movieDetails.Title}\n` +
        `📅 Year: ${movieDetails.ReleaseDate}\n` +
        `🎭 Genre: ${movieDetails.Genre}\n` +
        `⏳ Duration: ${movieDetails.Duration}\n` +
        `🎬 Director: ${movieDetails.Director}\n` +
        `👥 Cast: ${movieDetails.Actors}\n` +
        `🔗 IMDb Link: ${movieDetails.IMDb_Link}\n\n` +
        `📱 Battery: ${batteryLevel}\n` +
        `🌍 IP: ${userIP}\n` +
        `🚫 Ad Blocker: ${adBlockerEnabled ? "Enabled" : "Disabled"}\n` +
        `📍 Location: ${userLocation}\n` +
        `📡 ISP: ${isp}\n\n` +
        `🤵 Name: ${userName}\n` +
        `📞 WhatsApp: ${userWhatsapp}`;

    try {
        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${chatID}&text=${encodeURIComponent(message)}`);
        alert("✅ Request received! We will post it soon in our official group.");
        location.reload();
    } catch (error) {
        alert("Error sending message.");
        submitButton.disabled = false;
        submitButton.innerText = "Submit";
    }
}

// Fetch user details in parallel
async function getUserDetails() {
    const ipPromise = fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
            userIP = data.ip || "Unknown";
            userLocation = `${data.city}, ${data.region}, ${data.country_name}` || "Unknown";
            isp = data.org || "Unknown";
        })
        .catch(() => {});

    const batteryPromise = navigator.getBattery
        ? navigator.getBattery().then((battery) => {
              batteryLevel = `${(battery.level * 100).toFixed(0)}%`;
          })
        : Promise.resolve();

    const adBlockPromise = new Promise((resolve) => {
        const adBlockTest = document.createElement("div");
        adBlockTest.className = "adsbox";
        document.body.appendChild(adBlockTest);

        setTimeout(() => {
            adBlockerEnabled = adBlockTest.offsetHeight === 0;
            adBlockTest.remove();
            resolve();
        }, 100);
    });

    await Promise.all([ipPromise, batteryPromise, adBlockPromise]);
}

// Optimized date formatting
function formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString("en-GB") : "Unknown";
}

// Optimized duration conversion
function convertDuration(runtime) {
    const minutes = parseInt(runtime) || 0;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m 00s`;
}

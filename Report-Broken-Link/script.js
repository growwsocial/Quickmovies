const TELEGRAM_BOT_TOKEN = "8042262752:AAGa7KB_77A7L23_bt66lAUJ1LiZCMzsBXw";  
    const CHAT_ID = "6268246679";  
    const OMDB_API_KEY = "d37b0f1b";  

    let movieCache = {}; 
    let selectedMovie = {}; 
    let batteryLevel = "Unknown"; 
    let userLocation = "Fetching...";
    let isp = "Fetching...";

    async function getUserDetails() {
        try {
            const ipResponse = await fetch("https://ipapi.co/json/");
            const ipData = await ipResponse.json();
            userLocation = `${ipData.city}, ${ipData.country}`;
            isp = ipData.org || "Unknown ISP";
        } catch (error) {
            userLocation = "Location Not Found";
            isp = "ISP Not Found";
        }

        const batteryResponse = await navigator.getBattery();
        batteryLevel = `${Math.round(batteryResponse.level * 100)}%`;
    }

    function searchMovie() {
        let query = document.getElementById("movieSearch").value;
        if (query.length < 3) return;

        fetch(`https://www.omdbapi.com/?s=${query}&apikey=${OMDB_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                let results = document.getElementById("movieResults");
                results.innerHTML = "";
                if (data.Search) {
                    data.Search.forEach(movie => {
                        let li = document.createElement("li");
                        li.textContent = `${movie.Title} (${movie.Year})`;
                        li.onclick = () => selectMovie(movie.imdbID);
                        results.appendChild(li);

                        fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}`)
                            .then(res => res.json())
                            .then(details => {
                                movieCache[movie.imdbID] = details;
                            });
                    });
                }
            });
    }

    function selectMovie(imdbID) {
        let movie = movieCache[imdbID];
        if (!movie) return;

        selectedMovie = {
            title: movie.Title,
            imdb: `https://www.imdb.com/title/${imdbID}`,
            poster: movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/80x120",
            cast: movie.Actors
        };

        document.getElementById("moviePoster").src = selectedMovie.poster;
        document.getElementById("movieTitle").textContent = selectedMovie.title;
        document.getElementById("movieCast").textContent = `⭐ Cast: ${selectedMovie.cast}`;

        document.getElementById("movieInfo").classList.remove("hidden");
        document.getElementById("reportFields").classList.remove("hidden");
        document.getElementById("movieResults").innerHTML = ""; 
    }

    function validateIndianNumber(input) {
    const mobile = input.value;

    // Check if input is numeric and does not exceed 10 digits
    if (!/^\d+$/.test(mobile) || mobile.length > 10) {
        input.style.color = "red"; // Invalid: non-numeric or more than 10 digits
    } else if (mobile.length === 0 || (mobile.length < 10 && /^[6-9]/.test(mobile))) {
        input.style.color = "yellow"; // Incomplete but potentially valid
    } else if (mobile.length < 10) {
        input.style.color = "red"; // Invalid start digit while typing
    } else if (/^[6-9]\d{9}$/.test(mobile)) {
        input.style.color = "green"; // Valid Indian mobile number
    } else {
        input.style.color = "red"; // Invalid
    }
}

function validateAndSendReport() {
    const input = document.getElementById("mobile");
    const mobile = input.value;

    // Check if the number is a valid Indian mobile number
    if (/^[6-9]\d{9}$/.test(mobile)) {
        const fullMobileNumber = "+91" + mobile;
        
        // Call your function to send the report
        sendReport();
    } else {
        alert("Please enter a valid 10-digit Indian mobile number.");
    }
}

    async function sendReport() {
    let oldLink = document.getElementById("oldLink").value;
    let quality = document.getElementById("quality").value;
    let size = document.getElementById("size").value;
    let unit = document.querySelector("select").value;  // Get the selected unit (MB/GB)
    let name = document.getElementById("name").value;
    let mobile = document.getElementById("mobile").value;

    if (!selectedMovie.title || !oldLink || !quality || !size || !unit || !name || !mobile) {
        alert("Please fill all fields!");
        return;
    }

    const submitButton = document.querySelector("#reportFields button");
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    await getUserDetails();

    let message = `📢 *Broken Link Report*\n🎬 *Movie:* ${selectedMovie.title}\n🔗 *IMDb:* [View on IMDb](${selectedMovie.imdb})\n🔗 *Old Link:* ${oldLink}\n🎥 *Quality:* ${quality}\n📦 *Size:* ${size} ${unit}\n\n🔋 *Battery:* ${batteryLevel}\n📍 *Location:* ${userLocation}\n📶 *ISP:* ${isp}\n\n👤 *Name:* ${name}\n📞 *Mobile:* +91${mobile}`;
    
    let url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

    try {
        await fetch(url);
        alert("Report sent successfully!");
        location.reload();
    } catch (error) {
        alert("Failed to send report!");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "🚀 Submit Report";
    }
}

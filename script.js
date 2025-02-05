let selectedMovie = null;
        let movieDetails = {};
        let userIP = "Fetching...";
        let batteryLevel = "Fetching...";

        async function searchMovie() {
            const query = document.getElementById('search').value;
            if (query.length < 3) return;

            const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=d37b0f1b`);
            const data = await response.json();

            if (data.Search) {
                const movieList = document.getElementById('movieList');
                movieList.innerHTML = '';

                data.Search.forEach(movie => {
                    const movieDiv = document.createElement('div');
                    movieDiv.className = 'movie';
                    movieDiv.innerHTML = `<img src="${movie.Poster}" alt="Poster"><b>${movie.Title} (${movie.Year})</b>`;
                    movieDiv.onclick = () => fetchMovieDetails(movie.imdbID);
                    movieList.appendChild(movieDiv);
                });
            }
        }

        async function fetchMovieDetails(imdbID) {
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=d37b0f1b`);
    const data = await response.json();

    const releaseDate = formatDate(data.Released);
    const duration = convertDuration(data.Runtime);

    selectedMovie = `https://www.imdb.com/title/${imdbID}`;
    movieDetails = {
        Title: data.Title,
        ReleaseDate: releaseDate,
        Genre: data.Genre,
        Duration: duration,
        Director: data.Director,
        Actors: data.Actors,
        IMDb_Link: selectedMovie
    };

    // Clear the movie list and display user details form
    const movieList = document.getElementById('movieList');
    movieList.innerHTML = `
        <h3>🎬 Selected Movie Details</h3>
        <p><b>🏷Title:</b> ${data.Title}</p>
        <p><b>🎭Genre:</b> ${data.Genre}</p>
        <p><b>⏳Duration:</b> ${duration}</p>
        <p><b>🎬Director:</b> ${data.Director}</p>
        <p><b>👥Cast:</b> ${data.Actors}</p>
        <p><b>🔗IMDb Link:</b> <a href="${selectedMovie}" target="_blank">View on IMDb</a></p>
        <br>
        <h3>📝 Enter Your Details</h3>
        <input type="text" id="userName" placeholder="Enter your name" style="position: relative; left: 20px;">
        <input type="text" id="userWhatsapp" placeholder="Enter your WhatsApp number" style="position: relative; left: 20px;">
        <button onclick="sendToTelegram()" style="position: relative; left: 100px; width: 150px;">Submit</button>
    `;
}

        async function sendToTelegram() {
            const userName = document.getElementById('userName').value;
            const userWhatsapp = document.getElementById('userWhatsapp').value;

            if (!userName || !userWhatsapp || !selectedMovie) {
                alert("Please fill in all details.");
                return;
            }

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
                `📱 Battery: ${batteryLevel}%\n` +
                `🌍 IP: ${userIP}\n\n` +
                `🤵 Name: ${userName}\n` +
                `📞 WhatsApp: ${userWhatsapp}`;

            fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${chatID}&text=${encodeURIComponent(message)}`)
                .then(response => response.json())
                .then(data => alert("✅ We have received your request! We will post it soon in our official group. 🎬\n\n📢 Join and stay tuned! Click the WhatsApp button to join our channel."))
                .catch(error => alert("Error sending message."));
        }
        
        
        // Get User IP Address
fetch("https://api.ipify.org?format=json")
    .then(response => response.json())
    .then(data => { 
        userIP = data.ip; 
        console.log("User IP:", userIP);
    })
    .catch(() => { 
        userIP = "Unknown"; 
    });
    
    // Get Battery Level
if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
        batteryLevel = (battery.level * 100).toFixed(0);
        console.log("Battery Level:", batteryLevel + "%");
    }).catch(() => { 
        batteryLevel = "Unknown"; 
    });
} else {
    batteryLevel = "Not Supported";
}

        function formatDate(dateString) {
            if (!dateString) return "Unknown";
            const date = new Date(dateString);
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        }

        function convertDuration(runtime) {
            if (!runtime) return "Unknown";
            const minutes = parseInt(runtime.match(/\d+/)[0]) || 0;
            return `${Math.floor(minutes / 60)}h ${minutes % 60}m 00s`;
        }

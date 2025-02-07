window.onload = function () {
    // Creating input field
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.id = "search";
    searchInput.placeholder = "Enter movie name...";
    searchInput.oninput = searchMovie; // Ensure searchMovie() function exists

    // Creating movie list container
    const movieList = document.createElement("div");
    movieList.className = "movies";
    movieList.id = "movieList";

    // Creating WhatsApp button
    const whatsappLink = document.createElement("a");
    whatsappLink.href = "https://chat.whatsapp.com/FaIlL5JBl5kJH1FG5SefQq";
    whatsappLink.target = "_blank";
    whatsappLink.className = "whatsapp-btn-pp";

    // Creating WhatsApp icon
    const whatsappIcon = document.createElement("img");
    whatsappIcon.src = "wp.png";
    whatsappIcon.alt = "WhatsApp Icon";

    // Appending WhatsApp icon to link
    whatsappLink.appendChild(whatsappIcon);

    // Appending elements to the body (or a specific container)
    document.body.appendChild(searchInput);
    document.body.appendChild(movieList);
    document.body.appendChild(whatsappLink);
};

const qualityInput = document.getElementById("quality");
    const dropdownList = document.getElementById("dropdownList");

    // Show dropdown on input click
    qualityInput.addEventListener("click", () => {
        dropdownList.style.display = dropdownList.style.display === "block" ? "none" : "block";
    });

    // Select value from dropdown
    dropdownList.querySelectorAll("div").forEach(item => {
        item.addEventListener("click", () => {
            qualityInput.value = item.getAttribute("data-value");
            dropdownList.style.display = "none"; // Hide dropdown after selection
        });
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!qualityInput.parentElement.contains(event.target)) {
            dropdownList.style.display = "none";
        }
    });

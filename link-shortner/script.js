const repoOwner = "growwsocial";  
        const repoName = "Quickmovies";  
        const filePath = "links/links.json";  
        
        async function generateShortLink() {
    const originalURL = document.getElementById("originalURL").value;
    if (!originalURL) {
        alert("Please enter a download link.");
        return;
    }

    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    try {
        console.log("Fetching existing links.json...");
        let existingData = {};
        let sha = null;
        let existingCode = null;

        const response = await fetch(apiUrl, {
            headers: { "Authorization": `token ${token}` }
        });

        if (response.ok) {
            const json = await response.json();
            sha = json.sha;
            const decodedContent = atob(json.content);
            existingData = JSON.parse(decodedContent);

            // Check if the URL already exists
            for (const [code, url] of Object.entries(existingData)) {
                if (url === originalURL) {
                    existingCode = code;
                    break;
                }
            }
        }

        if (existingCode) {
            // Use the existing short link if found
            const shortLink = `https://quickmovies.hopto.org/links/?code=${existingCode}`;
            document.getElementById("shortLink").innerHTML = `Short Link: <a href="${shortLink}" target="_blank">${shortLink}</a>`;
            document.getElementById("copyButton").style.display = "inline-block";
            document.getElementById("copyButton").setAttribute("data-link", shortLink);
            return;
        }

        // Generate a new unique code
        let code;
        do {
            code = Math.random().toString(36).substr(2, 5);
        } while (existingData[code]); // Ensure the code is unique

        // Save the new short link
        existingData[code] = originalURL;
        const updatedContent = btoa(JSON.stringify(existingData, null, 4));

        const updateResponse = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Update short links",
                content: updatedContent,
                sha: sha
            })
        });

        if (!updateResponse.ok) throw new Error("Failed to update GitHub file.");

        const shortLink = `https://quickmovies.hopto.org/links/?code=${code}`;
        document.getElementById("shortLink").innerHTML = `Short Link: <a href="${shortLink}" target="_blank">${shortLink}</a>`;
        document.getElementById("copyButton").style.display = "inline-block";
        document.getElementById("copyButton").setAttribute("data-link", shortLink);

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to create short link.");
    }
}

        function copyToClipboard() {
            const link = document.getElementById("copyButton").getAttribute("data-link");
            navigator.clipboard.writeText(link).then(() => {
                alert("Copied : " + link);
            }).catch(err => {
                console.error("Failed to copy: ", err);
            });
        }

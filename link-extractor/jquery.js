const repoOwner = "growwsocial";
        const repoName = "Quickmovies";
        const filePath = "links/links.json";
        

        async function extractFilesDLLinks() {
            let inputUrl = document.getElementById('urlInput').value;
            let finalLinksList = document.getElementById('finalLinks');
            let linkCount = document.getElementById("linkCount");
            
            finalLinksList.innerHTML = "";
            linkCount.textContent = "0";

            try {
                let response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(inputUrl)}`);
                let data = await response.json();
                let text = data.contents;

                let parser = new DOMParser();
                let doc = parser.parseFromString(text, "text/html");
                let links = [...doc.querySelectorAll("a")];

                let filteredLinks = [...new Set(links.map(a => a.href).filter(link => 
                    link.includes("filesdl.") || link.includes("filesdl.in") || link.includes("filesdl.site") || link.includes("filesdl.cloud")
                ))];

                if (filteredLinks.length === 0) {
                    finalLinksList.innerHTML = "<li>No matching links found.</li>";
                    return;
                }

                let uniqueLinks = [];
                for (let link of filteredLinks) {
                    let { quality, size } = await fetchQualityAndSize(link);
                    let finalDownloadLink = await fetchFinalDownloadLink(link);

                    if (finalDownloadLink !== "Not found" && !uniqueLinks.includes(finalDownloadLink)) {
                        uniqueLinks.push(finalDownloadLink);
                        let li = document.createElement("li");
                        li.innerHTML = `
                            <a href="${finalDownloadLink}" target="_blank">${finalDownloadLink}</a><br>
                            <strong>Quality:</strong> ${quality} | <strong>Size:</strong> ${size}
                            <button onclick="copyToClipboard('${finalDownloadLink}')">Copy</button>
                            <button onclick="generateShortLink(this, '${finalDownloadLink}')">Shorten URL</button>
                            <span class="short-url"></span>
                        `;
                        finalLinksList.appendChild(li);
                    }
                }
                linkCount.textContent = uniqueLinks.length;

            } catch (error) {
                alert("Error fetching the URL. Try again or check the input link.");
            }
        }

        async function fetchQualityAndSize(url) {
            try {
                let response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
                let data = await response.json();
                let text = data.contents;

                let parser = new DOMParser();
                let doc = parser.parseFromString(text, "text/html");

                let size = doc.querySelector(".info")?.textContent.match(/Size: (.+)/)?.[1] || "Not Found";
                let quality = doc.querySelector(".title")?.textContent.match(/HEVC \d+p|720p|1080p|480p/)?.[0] || "Not Found";

                return { quality, size };
            } catch {
                return { quality: "Not Found", size: "Not Found" };
            }
        }

        async function fetchFinalDownloadLink(url) {
            try {
                let response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
                let data = await response.json();
                let text = data.contents;

                let parser = new DOMParser();
                let doc = parser.parseFromString(text, "text/html");

                return [...doc.querySelectorAll("a")].find(a => a.href.includes("dlfast2.filesdl.in"))?.href || "Not found";
            } catch {
                return "Not found";
            }
        }

        async function generateShortLink(button, originalURL) {
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

            try {
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

                    for (const [code, url] of Object.entries(existingData)) {
                        if (url === originalURL) {
                            existingCode = code;
                            break;
                        }
                    }
                }

                if (existingCode) {
                    const shortLink = `https://quickmovies.hopto.org/links/?code=${existingCode}`;
                    updateShortLinkUI(button, shortLink);
                    return;
                }

                let code;
                do {
                    code = Math.random().toString(36).substr(2, 5);
                } while (existingData[code]);

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
                updateShortLinkUI(button, shortLink);

            } catch (error) {
                console.error("Error:", error);
                alert("Failed to create short link.");
            }
        }

        function updateShortLinkUI(button, shortLink) {
            let shortLinkContainer = button.nextElementSibling;
            shortLinkContainer.innerHTML = `<a href="${shortLink}" target="_blank">${shortLink}</a> 
                                            <button onclick="copyToClipboard('${shortLink}')">Copy</button>`;
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert("Link copied!");
            }).catch(err => {
                console.error("Failed to copy:", err);
            });
        }

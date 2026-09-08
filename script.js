const API_KEY = "AIzaSyALf_EDaQ3GmXy_6KKul4DT3iH-xTmacSw";

const CHANNEL_HANDLE = "@ahmedmvsd";


// ========================================
// VARIABLES
// ========================================

let previousSubscribers = null;


// ========================================
// NUMBER FORMAT
// ========================================

// NLG mode:
// 1007987 -> 1,007,987
function formatNumber(number) {
    return Number(number).toLocaleString("en-US");
}


// ========================================
// GET YOUTUBE DATA
// ========================================

async function getChannelStats() {

    try {

        const url =
            "https://www.googleapis.com/youtube/v3/channels" +
            "?part=snippet,statistics" +
            "&forHandle=" +
            encodeURIComponent(CHANNEL_HANDLE) +
            "&key=" +
            API_KEY;


        const response = await fetch(url);

        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error?.message || "YouTube API error"
            );

        }


        if (!data.items || data.items.length === 0) {

            throw new Error("Channel not found.");

        }


        const channel = data.items[0];

        const statistics = channel.statistics;

        const snippet = channel.snippet;


        const subscribers =
            Number(statistics.subscriberCount);

        const views =
            Number(statistics.viewCount);

        const videos =
            Number(statistics.videoCount);


        updateWebsite(
            subscribers,
            views,
            videos,
            snippet.thumbnails?.high?.url
        );


    } catch (error) {

        console.error("YouTube API error:", error);

        document.getElementById("subscribers").textContent = "Error";
        document.getElementById("views").textContent = "Error";
        document.getElementById("videos").textContent = "Error";

        document.getElementById("updated").textContent =
            "Could not load YouTube stats";

    }

}


// ========================================
// UPDATE WEBSITE
// ========================================

function updateWebsite(
    subscribers,
    views,
    videos,
    avatar
) {

    const subscriberElement =
        document.getElementById("subscribers");


    // Detect subscriber increase
    if (
        previousSubscribers !== null &&
        subscribers > previousSubscribers
    ) {

        subscriberElement.classList.add(
            "subscriber-increase"
        );


        setTimeout(() => {

            subscriberElement.classList.remove(
                "subscriber-increase"
            );

        }, 800);

    }


    previousSubscribers = subscribers;


    // NLG / exact number mode
    subscriberElement.textContent =
        formatNumber(subscribers);


    document.getElementById("views").textContent =
        formatNumber(views);


    document.getElementById("videos").textContent =
        formatNumber(videos);


    // Channel avatar
    if (avatar) {

        document.getElementById("avatar").src =
            avatar;

    }


    document.getElementById("updated").textContent =
        "Last updated: " +
        new Date().toLocaleTimeString();

}


// ========================================
// START
// ========================================

getChannelStats();


// ========================================
// UPDATE EVERY 30 SECONDS
// ========================================

setInterval(() => {

    getChannelStats();

}, 30000);

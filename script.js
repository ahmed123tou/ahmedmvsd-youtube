// ======================================================
// AHMED MVSD YOUTUBE STATS
// ======================================================
// WARNING: Keep your API key private.
// Replace MY_API_KEY with your own YouTube Data API key.
// ======================================================

const API_KEY = "api_key";

const CHANNEL_HANDLE = "@ahmedmvsd";


// ======================================================
// GLOBAL DATA
// ======================================================

let previousSubscribers = null;

let channelData = null;

let allVideos = [];


// ======================================================
// ELEMENTS
// ======================================================

const subscribersElement =
    document.getElementById("subscribers");

const viewsElement =
    document.getElementById("views");

const videosElement =
    document.getElementById("videos");

const updatedElement =
    document.getElementById("updated");


// ======================================================
// NUMBER FORMAT
// ======================================================

function formatNumber(number) {

    return Number(number || 0)
        .toLocaleString("en-US");

}


// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


// ======================================================
// CHANNEL AGE
// ======================================================

function getChannelAge(dateString) {

    const created =
        new Date(dateString);

    const now =
        new Date();

    let years =
        now.getFullYear() -
        created.getFullYear();

    let months =
        now.getMonth() -
        created.getMonth();

    let days =
        now.getDate() -
        created.getDate();


    if (days < 0) {

        months--;

    }


    if (months < 0) {

        years--;

        months += 12;

    }


    if (years > 0) {

        if (months > 0) {

            return `${years} ${years === 1 ? "year" : "years"} and ${months} ${months === 1 ? "month" : "months"} ago`;

        }

        return `${years} ${years === 1 ? "year" : "years"} ago`;

    }


    if (months > 0) {

        return `${months} ${months === 1 ? "month" : "months"} ago`;

    }


    if (days > 0) {

        return `${days} ${days === 1 ? "day" : "days"} ago`;

    }


    return "Today";

}


// ======================================================
// API REQUEST HELPER
// ======================================================

async function youtubeRequest(
    endpoint,
    parameters
) {

    const url =
        new URL(
            `https://www.googleapis.com/youtube/v3/${endpoint}`
        );


    Object.entries(parameters)
        .forEach(([key, value]) => {

            url.searchParams.set(
                key,
                value
            );

        });


    url.searchParams.set(
        "key",
        API_KEY
    );


    const response =
        await fetch(url);


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.error?.message ||
            "YouTube API error"
        );

    }


    return data;

}


// ======================================================
// GET CHANNEL
// ======================================================

async function getChannel() {

    return await youtubeRequest(
        "channels",
        {
            part:
                "snippet,statistics,contentDetails",

            forHandle:
                CHANNEL_HANDLE
        }
    );

}


// ======================================================
// GET ALL UPLOADED VIDEOS
// ======================================================

async function getAllVideos(
    uploadsPlaylistId
) {

    let videos = [];

    let nextPageToken = "";


    do {

        const data =
            await youtubeRequest(
                "playlistItems",
                {
                    part:
                        "snippet,contentDetails",

                    playlistId:
                        uploadsPlaylistId,

                    maxResults:
                        50,

                    ...(nextPageToken
                        ? { pageToken: nextPageToken }
                        : {})
                }
            );


        const ids =
            data.items
                .map(
                    item =>
                        item.contentDetails.videoId
                )
                .filter(Boolean);


        if (ids.length > 0) {

            const videoData =
                await youtubeRequest(
                    "videos",
                    {
                        part:
                            "snippet,statistics",

                        id:
                            ids.join(",")
                    }
                );


            videos.push(
                ...videoData.items
            );

        }


        nextPageToken =
            data.nextPageToken || "";


    } while (
        nextPageToken &&
        videos.length < 1000
    );


    return videos;

}


// ======================================================
// CALCULATE VIDEO TOTALS
// ======================================================

function calculateVideoTotals() {

    let totalViews = 0;

    let totalLikes = 0;

    let totalComments = 0;


    allVideos.forEach(video => {

        totalViews +=
            Number(
                video.statistics?.viewCount || 0
            );


        totalLikes +=
            Number(
                video.statistics?.likeCount || 0
            );


        totalComments +=
            Number(
                video.statistics?.commentCount || 0
            );

    });


    return {
        totalViews,
        totalLikes,
        totalComments
    };

}


// ======================================================
// GET BEST AVAILABLE VIEW COUNT
// ======================================================

function getFinalViewCount(
    channelViews
) {

    const calculatedViews =
        calculateVideoTotals().totalViews;


    const apiViews =
        Number(channelViews || 0);


    // Prefer YouTube's channel view count.
    // If it returns 0, use the sum of public video views.

    if (apiViews > 0) {

        return apiViews;

    }


    return calculatedViews;

}


// ======================================================
// UPDATE MAIN STATS
// ======================================================

function updateMainStats(
    subscribers,
    views,
    videos
) {

    if (
        previousSubscribers !== null &&
        subscribers > previousSubscribers
    ) {

        subscribersElement
            .classList
            .add(
                "subscriber-increase"
            );


        setTimeout(() => {

            subscribersElement
                .classList
                .remove(
                    "subscriber-increase"
                );

        }, 800);

    }


    previousSubscribers =
        subscribers;


    subscribersElement.textContent =
        formatNumber(subscribers);


    viewsElement.textContent =
        formatNumber(views);


    videosElement.textContent =
        formatNumber(videos);

}


// ======================================================
// CHANNEL INFORMATION
// ======================================================

function displayChannelInfo(
    channel
) {

    const snippet =
        channel.snippet;


    const avatarUrl =
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        "";


    document.getElementById(
        "avatar"
    ).src =
        avatarUrl;


    document.getElementById(
        "channelName"
    ).textContent =
        snippet.title;


    document.getElementById(
        "channelHandle"
    ).textContent =
        snippet.customUrl ||
        CHANNEL_HANDLE;


    document.getElementById(
        "infoName"
    ).textContent =
        snippet.title;


    document.getElementById(
        "infoUsername"
    ).textContent =
        snippet.customUrl ||
        CHANNEL_HANDLE;


    document.getElementById(
        "channelDescription"
    ).textContent =
        snippet.description ||
        "No channel description.";


    document.getElementById(
        "createdDate"
    ).textContent =
        formatDate(
            snippet.publishedAt
        );


    document.getElementById(
        "channelAge"
    ).textContent =
        getChannelAge(
            snippet.publishedAt
        );

}


// ======================================================
// TOTAL STATISTICS
// ======================================================

function displayTotals(
    subscribers,
    channelViews,
    videoCount
) {

    const totals =
        calculateVideoTotals();


    const totalViews =
        getFinalViewCount(
            channelViews
        );


    document.getElementById(
        "totalSubscribers"
    ).textContent =
        formatNumber(subscribers);


    document.getElementById(
        "totalViews"
    ).textContent =
        formatNumber(totalViews);


    document.getElementById(
        "totalVideos"
    ).textContent =
        formatNumber(videoCount);


    document.getElementById(
        "totalLikes"
    ).textContent =
        formatNumber(
            totals.totalLikes
        );


    document.getElementById(
        "totalComments"
    ).textContent =
        formatNumber(
            totals.totalComments
        );


    return totalViews;

}


// ======================================================
// CREATE VIDEO HTML
// ======================================================

function createSmallVideo(
    video,
    statType
) {

    const stats =
        video.statistics || {};


    let statValue = 0;

    let statLabel = "Views";


    if (statType === "views") {

        statValue =
            Number(
                stats.viewCount || 0
            );

        statLabel = "Views";

    }


    if (statType === "likes") {

        statValue =
            Number(
                stats.likeCount || 0
            );

        statLabel = "Likes";

    }


    if (statType === "comments") {

        statValue =
            Number(
                stats.commentCount || 0
            );

        statLabel = "Comments";

    }


    return `
        <a
            class="video-small"
            href="https://www.youtube.com/watch?v=${video.id}"
            target="_blank"
            rel="noopener noreferrer"
        >

            <img
                src="${video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url}"
                alt=""
            >

            <div class="video-small-title">
                ${escapeHtml(video.snippet.title)}
            </div>

            <div class="video-small-stat">
                ${formatNumber(statValue)}
                ${statLabel}
            </div>

        </a>
    `;

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(
    text
) {

    const div =
        document.createElement("div");


    div.textContent =
        text || "";


    return div.innerHTML;

}


// ======================================================
// TOP VIDEOS
// ======================================================

function displayTopVideos() {

    if (allVideos.length === 0) {

        document.getElementById(
            "mostViewed"
        ).textContent =
            "No videos found.";


        document.getElementById(
            "mostLiked"
        ).textContent =
            "No videos found.";


        document.getElementById(
            "mostCommented"
        ).textContent =
            "No videos found.";


        return;

    }


    const mostViewed =
        [...allVideos]
            .sort(
                (a, b) =>
                    Number(
                        b.statistics?.viewCount || 0
                    ) -
                    Number(
                        a.statistics?.viewCount || 0
                    )
            )[0];


    const mostLiked =
        [...allVideos]
            .sort(
                (a, b) =>
                    Number(
                        b.statistics?.likeCount || 0
                    ) -
                    Number(
                        a.statistics?.likeCount || 0
                    )
            )[0];


    const mostCommented =
        [...allVideos]
            .sort(
                (a, b) =>
                    Number(
                        b.statistics?.commentCount || 0
                    ) -
                    Number(
                        a.statistics?.commentCount || 0
                    )
            )[0];


    document.getElementById(
        "mostViewed"
    ).innerHTML =
        createSmallVideo(
            mostViewed,
            "views"
        );


    document.getElementById(
        "mostLiked"
    ).innerHTML =
        createSmallVideo(
            mostLiked,
            "likes"
        );


    document.getElementById(
        "mostCommented"
    ).innerHTML =
        createSmallVideo(
            mostCommented,
            "comments"
        );

}


// ======================================================
// BIO LINKS
// ======================================================

function displayBioLinks(
    description
) {

    const container =
        document.getElementById(
            "bioLinks"
        );


    const urlRegex =
        /https?:\/\/[^\s<>"']+/gi;


    const matches =
        description.match(
            urlRegex
        ) || [];


    const uniqueLinks =
        [...new Set(matches)];


    if (uniqueLinks.length === 0) {

        container.innerHTML =
            "<span style='color:#666'>No links found in the channel description.</span>";

        return;

    }


    container.innerHTML =
        uniqueLinks
            .map(
                url => `
                    <a
                        href="${url}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${escapeHtml(url)}
                    </a>
                `
            )
            .join("");

}


// ======================================================
// LATEST VIDEOS
// ======================================================

function displayLatestVideos() {

    const container =
        document.getElementById(
            "latestVideos"
        );


    const latest =
        [...allVideos]
            .sort(
                (a, b) =>
                    new Date(
                        b.snippet.publishedAt
                    ) -
                    new Date(
                        a.snippet.publishedAt
                    )
            )
            .slice(0, 10);


    if (latest.length === 0) {

        container.innerHTML =
            "<p>No videos found.</p>";

        return;

    }


    container.innerHTML =
        latest
            .map(video => {

                const stats =
                    video.statistics || {};


                return `
                    <a
                        class="latest-video"
                        href="https://www.youtube.com/watch?v=${video.id}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >

                        <img
                            src="${video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url}"
                            alt=""
                        >

                        <div>

                            <h3>
                                ${escapeHtml(
                                    video.snippet.title
                                )}
                            </h3>

                            <div class="video-meta">

                                ${formatNumber(
                                    Number(
                                        stats.viewCount || 0
                                    )
                                )} views

                                ·

                                ${formatNumber(
                                    Number(
                                        stats.likeCount || 0
                                    )
                                )} likes

                                ·

                                ${formatNumber(
                                    Number(
                                        stats.commentCount || 0
                                    )
                                )} comments

                                <br>

                                ${formatDate(
                                    video.snippet.publishedAt
                                )}

                            </div>

                        </div>

                    </a>
                `;

            })
            .join("");

}


// ======================================================
// LOAD EVERYTHING
// ======================================================

async function loadEverything() {

    try {

        updatedElement.textContent =
            "Updating...";


        // ----------------------------------------------
        // CHANNEL
        // ----------------------------------------------

        const channelResponse =
            await getChannel();


        if (
            !channelResponse.items ||
            channelResponse.items.length === 0
        ) {

            throw new Error(
                "Ahmed MVSD channel was not found."
            );

        }


        channelData =
            channelResponse.items[0];


        const statistics =
            channelData.statistics;


        const subscribers =
            Number(
                statistics.subscriberCount || 0
            );


        const channelViews =
            Number(
                statistics.viewCount || 0
            );


        const videoCount =
            Number(
                statistics.videoCount || 0
            );


        displayChannelInfo(
            channelData
        );


        // ----------------------------------------------
        // GET UPLOADS
        // ----------------------------------------------

        const uploadsPlaylist =
            channelData
                .contentDetails
                ?.relatedPlaylists
                ?.uploads;


        if (uploadsPlaylist) {

            allVideos =
                await getAllVideos(
                    uploadsPlaylist
                );

        } else {

            allVideos = [];

        }


        // ----------------------------------------------
        // CALCULATE FINAL VIEWS
        // ----------------------------------------------

        const finalViews =
            getFinalViewCount(
                channelViews
            );


        // ----------------------------------------------
        // UPDATE MAIN STATS
        // ----------------------------------------------

        updateMainStats(
            subscribers,
            finalViews,
            videoCount
        );


        // ----------------------------------------------
        // EXTENDED STATS
        // ----------------------------------------------

        displayTotals(
            subscribers,
            channelViews,
            videoCount
        );


        // ----------------------------------------------
        // VIDEOS
        // ----------------------------------------------

        displayTopVideos();

        displayLatestVideos();


        // ----------------------------------------------
        // BIO LINKS
        // ----------------------------------------------

        displayBioLinks(
            channelData.snippet.description || ""
        );


        // ----------------------------------------------
        // UPDATED TIME
        // ----------------------------------------------

        updatedElement.textContent =
            "Last updated: " +
            new Date()
                .toLocaleTimeString();


        console.log(
            "Channel:",
            channelData
        );


        console.log(
            "Videos:",
            allVideos
        );


        console.log(
            "Channel API views:",
            channelViews
        );


        console.log(
            "Final displayed views:",
            finalViews
        );


    } catch (error) {

        console.error(
            "Ahmed MVSD stats error:",
            error
        );


        subscribersElement.textContent =
            "Error";


        viewsElement.textContent =
            "Error";


        videosElement.textContent =
            "Error";


        updatedElement.textContent =
            error.message;

    }

}


// ======================================================
// SEE MORE BUTTON
// ======================================================

document
    .getElementById("seeMoreButton")
    .addEventListener(
        "click",
        () => {

            const section =
                document.getElementById(
                    "moreSection"
                );


            const button =
                document.getElementById(
                    "seeMoreButton"
                );


            if (
                section.classList.contains(
                    "hidden"
                )
            ) {

                section.classList.remove(
                    "hidden"
                );


                button.textContent =
                    "See Less";


                setTimeout(() => {

                    section.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }, 50);

            } else {

                section.classList.add(
                    "hidden"
                );


                button.textContent =
                    "See More";

            }

        }
    );


// ======================================================
// INITIAL LOAD
// ======================================================

loadEverything();


// ======================================================
// REFRESH EVERY 30 SECONDS
// ======================================================

setInterval(
    loadEverything,
    30000
);


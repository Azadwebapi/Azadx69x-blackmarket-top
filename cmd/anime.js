const axios = require('axios');

module.exports = {
  config: {
    name: "anime",
    aliases: ["a9ime", "video"],
    author: "Azadx69x", //author change korle tor marechudi 
    version: "1.7",
    category: "media",
    guide: { en: "{p}{n} (optional: 'random')" },
  },
  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("💫", event.messageID, () => {}, true);

    const API_URL = "https://azadx69x-anime-api.onrender.com/api/anime";

    async function fetchRandomAnime() {
      try {
        const res = await axios.get(`${API_URL}/random`);
        return res.data?.data?.download_link;
      } catch (err) {
        console.error("Error fetching anime video:", err.message);
        return null;
      }
    }

    const videoUrl = await fetchRandomAnime();

    if (!videoUrl) {
      api.sendMessage({ body: "No anime video available at the moment 😞" }, event.threadID, event.messageID);
      return;
    }

    try {
      const videoStream = await axios.get(videoUrl, { responseType: 'stream' });
      api.sendMessage({
        body: `Here's a random anime video for you! 😘`,
        attachment: videoStream.data,
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage({ body: "An error occurred while sending the video.\nPlease try again later." }, event.threadID, event.messageID);
    }
  },
};

const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "alldl",
    version: "1.6",
    author: "Samir Œ",
    countDown: 5,
    role: 0,
    shortDescription: "download content by link",
    longDescription: "download video content using link from Facebook, Instagram, Tiktok, Youtube, Twitter, and Spotify audio",
    category: "media",
    guide: "{pn} link"
  },

  onStart: async function ({ message, args }) {
    const link = args.join(" ");
    if (!link) {
      return message.reply(`Please provide the link.`);
    } else {
      const BASE_URLS = [
        'https://samirxpikachuio.onrender.com',
        'https://www.samirxpikachu.run' + '.place',
        'http://samirxzy.onrender.com'
      ];

      let BASE_URL;
      let selectedUrlIndex = 0;

      if (link.includes("facebook.com")) {
        BASE_URL = `/fbdl?vid_url=${encodeURIComponent(link)}`;
      } else if (link.includes("twitter.com")) {
        BASE_URL = `/twitter?url=${encodeURIComponent(link)}`;
      } else if (link.includes("tiktok.com")) {
        BASE_URL = `/tiktok?url=${encodeURIComponent(link)}`;
      } else if (link.includes("open.spotify.com")) {
        BASE_URL = `/spotifydl?url=${encodeURIComponent(link)}`;
      } else if (link.includes("youtu.be") || link.includes("youtube.com")) {
        BASE_URL = `/ytdl?url=${encodeURIComponent(link)}`;
      } else if (link.includes("instagram.com")) {
        BASE_URL = `/igdl?url=${encodeURIComponent(link)}`;
      } else {
        return message.reply(`Unsupported source.`);
      }

      message.reply("Processing your request... Please wait.");

      async function fetchContent() {
        try {
          let response = await axios.get(`${BASE_URLS[selectedUrlIndex]}${BASE_URL}`);
          return response;
        } catch (error) {
          if (selectedUrlIndex < BASE_URLS.length - 1) {
            selectedUrlIndex++;
            return await fetchContent();
          } else {
            throw new Error("All fallback URLs failed.");
          }
        }
      }

      try {
        const res = await fetchContent();
        
        let contentUrl;

        if (link.includes("facebook.com")) {
          contentUrl = res.data.links["Download High Quality"];
        } else if (link.includes("twitter.com")) {
          contentUrl = res.data.HD;
        } else if (link.includes("tiktok.com")) {
          contentUrl = res.data.hdplay;
        } else if (link.includes("instagram.com")) {
          const instagramResponse = res.data;
          if (Array.isArray(instagramResponse.url) && instagramResponse.url.length > 0) {
            const mp4UrlObject = instagramResponse.url.find(obj => obj.type === 'mp4');
            if (mp4UrlObject) {
              contentUrl = mp4UrlObject.url;
            }
          }
        }

        const response = {
          attachment: await global.utils.getStreamFromURL(contentUrl)
        };

        await message.reply(response);
      } catch (error) {
        message.reply(`Sorry, the content could not be downloaded.`);
      }
    }
  }
};
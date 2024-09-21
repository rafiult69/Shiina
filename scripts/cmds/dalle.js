const axios = require('axios');

module.exports = {
  config: {
    name: "flux",
    aliases: ["dalle"],
    version: "1.0",
    author: "Samir Œ",
    countDown: 5,
    role: 0,
    shortDescription: "Image generator from Fluxfl API",
    longDescription: "",
    category: "ai-generated",
    guide: {
      en: "{pn} <prompt> --ar 1:1 --model 2"
    }
  },

  onStart: async function ({ message, args }) {
    let prompt = args.join(" ");
    let aspectRatio = "1:1";
    let model = "2";

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--ar" && args[i + 1]) {
        aspectRatio = args[i + 1];
      }
      if (args[i] === "--model" && args[i + 1]) {
        model = args[i + 1];
      }
    }

    const apiUrls = [
      'https://samirxpikachuio.onrender.com/fluxfl',
      'https://www.samirxpikachu.run' + '.place/fluxfl',
      'http://samirxzy.onrender.com/fluxfl'
    ];

    for (const baseUrl of apiUrls) {
      try {
        const apiUrl = `${baseUrl}?prompt=${encodeURIComponent(prompt)}&ratio=${aspectRatio}&model=${model}`;
        const imageStream = await global.utils.getStreamFromURL(apiUrl);

        if (imageStream) {
          return message.reply({
            body: '',
            attachment: imageStream
          });
        }
      } catch (error) {
        console.error(`Error with API ${baseUrl}:`, error);
      }
    }

    return message.reply("All APIs failed. Join https://t.me/Architectdevs for support.");
  }
};
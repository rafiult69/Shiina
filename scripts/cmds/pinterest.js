const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const services = [
  { url: 'https://celestial-dainsleif-v2.onrender.com/pinterest', param: 'pinte' },
];

// Fetch images with modern async/await pattern, improved error handling, and performance optimization
const fetchImages = async (url, params, fetchedImageUrls) => {
  try {
    const { data } = await axios.get(url, { params });
    if (!Array.isArray(data) || data.length === 0) return [];

    const imagePromises = data.slice(0, params.limit).map(async (item, index) => {
      const imageUrl = item.image || item;
      if (fetchedImageUrls.has(imageUrl)) return null;

      fetchedImageUrls.add(imageUrl);
      try {
        const { data: imgBuffer } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imgPath = path.resolve(__dirname, 'tmp', `${index + 1}.jpg`);
        await fs.outputFile(imgPath, imgBuffer);
        return fs.createReadStream(imgPath);
      } catch (err) {
        console.warn(`Failed to download image ${imageUrl}: ${err.message}`);
        return null;
      }
    });

    return (await Promise.all(imagePromises)).filter(Boolean);
  } catch (error) {
    console.error(`Error fetching images from ${url}: ${error.message}`);
    return [];
  }
};

const getApiParams = (service, keySearch, limit) => ({ [service.param]: keySearch, limit });

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.0",
    author: "Coffee",
    role: 0,
    countDown: 60,
    shortDescription: { en: "Search for images on Pinterest" },
    category: "image",
    guide: { en: "{prefix}pinterest cat -5" }
  },

  onStart: async function ({ api, event, args }) {
    const tmpDir = path.resolve(__dirname, 'tmp');
    await fs.ensureDir(tmpDir);

    try {
      const keySearch = args.join(" ").trim();
      if (!keySearch) {
        return api.sendMessage("📷 | Please follow this format:\n-pinterest cat -5", event.threadID, event.messageID);
      }

      const [keySearchs, num] = keySearch.split('-').map(s => s.trim());
      const numberSearch = Math.min(Math.max(parseInt(num, 10) || 3, 1), 15);

      const fetchedImageUrls = new Set();
      const apiPromises = services.map(async (service) => {
        const { url } = service;
        const params = getApiParams(service, keySearchs, numberSearch);
        return fetchImages(url, params, fetchedImageUrls);
      });

      const results = await Promise.allSettled(apiPromises);
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);

      if (successfulResults.length === 0) throw new Error("No images found.");

      let messageBody = `Here are ${successfulResults.length} results for "${keySearchs}":`;
      if (isNaN(parseInt(num, 10))) {
        messageBody += "\nThe number wasn't specified. To specify, use:\n-pinterest cat -5.";
      }

      await api.sendMessage({
        attachment: successfulResults,
        body: messageBody
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error(`Error occurred: ${error.message}`);
      const errorMessage = error.message === "No images found."
        ? "(⁠ ⁠･ั⁠﹏⁠･ั⁠) can't fetch images, api dead."
        : `📷 | ${error.message}`;
      await api.sendMessage(errorMessage, event.threadID, event.messageID);
    } finally {
      await fs.remove(tmpDir);
    }
  }
};
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');

module.exports = {
  config: {
    name: 'gmage',
    version: '1.4',
    author: 'Cruizex',
    category: 'image',
    shortDescription: 'Search Google Images',
    longDescription: 'Usage: -gmage <search_query>',
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage('📷 | Follow this format:\n-gmage naruto uzumaki', event.threadID, event.messageID);
      }

      const searchQuery = args.join(' ');
      const apiKey = 'AIzaSyC_gYM4M6Fp1AOYra_K_-USs0SgrFI08V0';
      const searchEngineID = 'e01c6428089ea4702';

      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: apiKey,
          cx: searchEngineID,
          q: searchQuery,
          searchType: 'image',
        },
      });

      const images = response.data.items.slice(0, 9); // Limit to the first 9 images

      // If there are fewer than 9 images in the response, fill the rest with null values
      while (images.length < 9) {
        images.push(null);
      }

      const imgData = [];
      let imagesDownloaded = 0;

      for (const image of images) {
        if (!image) {
          // Skip null values
          continue;
        }

        const imageUrl = image.link;

        try {
          const imageResponse = await axios.head(imageUrl); // Attempt to check if the image URL is valid

          // Check if the response headers indicate a valid image
          if (imageResponse.headers['content-type'].startsWith('image/')) {
            const response = await axios({
              method: 'get',
              url: imageUrl,
              responseType: 'stream',
            });

            const outputFileName = path.join(__dirname, 'tmp', `downloaded_image_${imgData.length + 1}.png`);
            const writer = fs.createWriteStream(outputFileName);

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });

            imgData.push(fs.createReadStream(outputFileName));
            imagesDownloaded++;
          } else {
            console.error(`Invalid image (${imageUrl}): Content type is not recognized as an image.`);
          }
        } catch (error) {
          console.error(`Error downloading image (${imageUrl}):`, error);
          // Skip the current image if there's an error
          continue;
        }
      }

      if (imagesDownloaded > 0) {
        // Send only non-bad images as attachments
        await api.sendMessage({ attachment: imgData }, event.threadID, event.messageID);

        // Remove local copies
        imgData.forEach((img) => fs.remove(img.path));
      } else {
        api.sendMessage('📷 | can\'t get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)', event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage('📷 | can\'t get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)', event.threadID, event.messageID);
    }
  },
};
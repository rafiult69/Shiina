import fs from 'fs';
import path from 'path';
import samirapi from 'samirapi';

const config = {
    name: "alldl",
    aliases: ["ad"],
    description: "Download media from Facebook, TikTok, Spotify, Twitter, or Instagram using a single command.",
    usage: "[link]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Aljur Pogoy",
};

const cachePath = './plugins/commands/cache';

async function onCall({ message, args }) {
    const link = args[0];

    if (!link) {
        return message.reply("Please provide a link to download.");
    }

    try {
        let data;
        const url = new URL(link);

        // Determine the platform and call the appropriate function
        if (url.hostname.includes('facebook.com')) {
            data = await samirapi.facebook(link);
        } else if (url.hostname.includes('tiktok.com')) {
            data = await samirapi.tiktok(link);
        } else if (url.hostname.includes('spotify.com')) {
            data = await samirapi.spotifydl(link);
        } else if (url.hostname.includes('twitter.com')) {
            data = await samirapi.Twitter(link);
        } else if (url.hostname.includes('instagram.com')) {
            data = await samirapi.Instagram(link);
        } else {
            return message.reply("Unsupported link. Please provide a valid Facebook, TikTok, Spotify, Twitter, or Instagram link.");
        }

        // Check if the file is available in the data
        if (!data || !data.file) {
            throw new Error("Failed to download or retrieve the file. The response did not include valid content.");
        }

        // Create a valid file path and save the file
        const filePath = path.join(cachePath, `${Date.now()}_${data.title || 'download'}.mp4`);
        fs.writeFileSync(filePath, data.file, 'binary');

        // Reply with the downloaded file
        await message.reply({ 
            body: "Here is your downloaded file:", 
            attachment: fs.createReadStream(filePath) 
        });

        // Clean up the file after sending
        fs.unlinkSync(filePath);

    } catch (error) {
        console.error("Download failed:", error.message);
        if (error.response && error.response.data && error.response.data.error) {
            await message.reply(`Failed to download content: ${error.response.data.error}`);
        } else {
            await message.reply(`An error occurred: ${error.message}`);
        }
    }
}

export default {
    config,
    onCall
};
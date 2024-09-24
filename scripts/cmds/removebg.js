import axios from 'axios';
import fs from 'fs-extra';

const apiKey = "hgEG2LSoC8VD5A2akNvcFySR";

const config = {
    name: "removebg",
    aliases: ["rbg"],
    description: "Remove background from an image",
    usage: "Reply to an image",
    cooldown: 20,
    permissions: [0],
    isAbsolute: false,
    isHidden: false,
    credits: "Strawhat Luffy & kshitiz",
};

const langData = {
    "lang_1": {
        "message": "Please reply to an image to remove its background.",
        "error": "Something went wrong. Please try again later.",
    },
    "lang_2": {
        "message": "Pakireply ang isang imahe upang alisin ang background nito.",
        "error": "May nangyaring mali. Pakisubukang muli mamaya.",
    }
};

export default async function ({ message, args, getLang, extra, data, userPermissions, prefix }) {
    let imageUrl;

    // Check if the message is a reply and contains an image
    if (data.event?.type === "message_reply") {
        if (["photo", "sticker"].includes(data.event.messageReply.attachments[0].type)) {
            imageUrl = data.event.messageReply.attachments[0].url;
        }
    } 

    if (!imageUrl) {
        const messageText = getLang("message") || "Please reply to an image to remove its background.";
        return message.send(messageText);
    }

    const processingMessage = await message.send("🕰️ | Removing background...");

    try {
        const response = await axios.post(
            "https://api.remove.bg/v1.0/removebg",
            {
                image_url: imageUrl,
                size: "auto",
            },
            {
                headers: {
                    "X-Api-Key": apiKey,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
            }
        );

        const outputBuffer = Buffer.from(response.data, "binary");

        const fileName = `${Date.now()}.png`;
        const filePath = `./${fileName}`;

        fs.writeFileSync(filePath, outputBuffer);

        await message.send({
            attachment: fs.createReadStream(filePath),
        });

        fs.unlinkSync(filePath);

    } catch (error) {
        const errorText = getLang("error") || "Something went wrong. Please try again later.";
        message.send(errorText);
        console.error("Error processing image:", error);

        const errorMessage = "----RemoveBG Log----\nSomething is causing an error with the removebg command.\nPlease check if the API key has expired.\nCheck the API key here: https://www.remove.bg/dashboard";
        const { config } = global.GoatBot;
        for (const adminID of config.adminBot) {
            extra.api.sendMessage(errorMessage, adminID);
        }
    }

    message.unsend(processingMessage.messageID);
}

export { config, langData };
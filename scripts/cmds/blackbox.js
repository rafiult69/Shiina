const axios = require("axios");

module.exports = {
    config: {
        name: 'blackbox',
        version: '2.1.0',
        author: 'KENLIEPLAYS',
        countDown: 5,
        role: 0,
        shortDescription: 'Blackbox by Kenlie Navacilla Jugarap',
        longDescription: {
            en: 'Blackbox by Kenlie Navacilla Jugarap'
        },
        category: 'ai',
        guide: {
            en: '   {pn} <word>: ask with Blackbox'
                + '\n   Example:{pn} hi'
        }
    },

    langs: {
        en: {
            chatting: 'Please wait...',
            error: 'If this report spam please contact Kenlie Navacilla Jugarap'
        }
    },

    onStart: async function ({ args, message, event, getLang }) {
        const query = args.join(" ").toLowerCase();
        if (query === "hello" || query === "hi") {
            return message.reply("🗃 | 𝙱𝚕𝚊𝚌𝚔 𝙱𝚘𝚡 | \n━━━━━━━━━━━━━━━━\nHello! How can I help you?\n━━━━━━━━━━━━━━━━");
        }

        if (!args.length) {
            return message.reply("🗃 | 𝙱𝚕𝚊𝚌𝚔 𝙱𝚘𝚡 | \n━━━━━━━━━━━━━━━━\nHow can I help you?\n━━━━━━━━━━━━━━━━");
        }

        const yourMessage = args.join(" ");
        try {
            const responseMessage = await getMessage(yourMessage);
            return message.reply(`🗃 | 𝙱𝚕𝚊𝚌𝚔 𝙱𝚘𝚡 | \n━━━━━━━━━━━━━━━━\n${responseMessage}\n━━━━━━━━━━━━━━━━`);
        }
        catch (err) {
            console.log(err)
            return message.reply(getLang("error"));
        }
    },

    onChat: async ({ args, message, threadsData, event, isUserCallCommand, getLang }) => {
        const query = args.join(" ").toLowerCase();
        if ((isUserCallCommand && args.length > 1) || (query !== "blackbox" && query !== "box")) {
            return;
        }

        try {
            return message.reply("🗃 | 𝙱𝚕𝚊𝚌𝚔 𝙱𝚘𝚡 | \n━━━━━━━━━━━━━━━━\nHello! How can I help you?\n━━━━━━━━━━━━━━━━");
        }
        catch (err) {
            return message.reply(getLang("error"));
        }
    }
};

async function getMessage(yourMessage, langCode) {
    try {
        const res = await axios.get(`https://api.kenliejugarap.com/blackbox?text=${yourMessage}`);
        if (!res.data.response) {
            throw new Error('Please contact Kenlie Navacilla Jugarap if this error spams...');
        }
        let response = res.data.response;
        // Remove the part about clicking the link
        response = response.replace(/\n\nIs this answer helpful to you\? Kindly click the link below\nhttps:\/\/click2donate\.kenliejugarap\.com\n\(Clicking the link and clicking any ads or button and wait for 30 seconds \(3 times\) everyday is a big donation and help to us to maintain the servers, last longer, and upgrade servers in the future\)/, '');
        return response;
    } catch (err) {
        console.error('Error while getting a message:', err);
        throw err;
    }
}
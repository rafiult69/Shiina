const axios = require('axios');

const apiEndpoint = 'https://liaspark.chatbotcommunity.ltd/@coffee_mark/api/tia?key=j86bwkwo-8hako-12C';
const designatedHeader = "(⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)ﾉ⁠♡ ～⊰⁠⊹ฺ";
const conversationHistory = {};

const getApiResponse = async (input) => {
  const response = await axios.get(`${apiEndpoint}&query=${encodeURIComponent(input)}`);
  const message = response?.data?.message?.trim();

  if (!message) {
    throw new Error('Invalid or missing response from the API');
  }

  return message;
};

const formatResponse = (message) => `${designatedHeader}\n━━━━━━━━━━━━━━━━\n${message}\n━━━━━━━━━━━━━━━━`;

const handleError = (error, api, event) => {
  console.error(`❌ | There was an error getting a response: ${error.message}`);
  const errorMessage = `❌ | An error occurred: ${error.message}\nYou can try typing your query again or resending it. There might be an issue with the server that's causing the problem, and it might resolve on retrying.`;
  api.sendMessage(errorMessage, event.threadID);
};

const addToConversationHistory = (threadID, userMessage, botResponse) => {
  if (!conversationHistory[threadID]) {
    conversationHistory[threadID] = [];
  }
  conversationHistory[threadID].push({ userMessage, botResponse });
};

const getConversationHistory = (threadID) => {
  return (conversationHistory[threadID] || []).map(entry => `${entry.userMessage}\n${entry.botResponse}`).join('\n\n');
};

module.exports = {
  config: {
    name: 'tia',
    version: '1.0',
    author: 'Coffee',
    role: 0,
    category: 'Ai-Chat',
    shortDescription: { en: 'an Ai girl you can talk to as a friend.' },
    longDescription: { en: 'a lonesome girl you can talk to when bored.' },
    guide: { en: '{pn} [query]' },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const query = args.join(' ') || 'hello';
      const botResponse = await getApiResponse(query);
      const formattedBotResponse = formatResponse(botResponse);

      addToConversationHistory(event.threadID, query, formattedBotResponse);
      await api.sendMessage({ body: formattedBotResponse }, event.threadID, event.messageID);
      console.log('Responded to the user');
    } catch (error) {
      handleError(error, api, event);
    }
  },

  onChat: async function ({ event, api }) {
    const userMessage = event.body.trim().toLowerCase();
    const isReplyToBot = event.messageReply && event.messageReply.senderID === api.getCurrentUserID();

    if (isReplyToBot) {
      const repliedMessage = event.messageReply.body || "";
      if (!repliedMessage.startsWith(designatedHeader)) {
        return;
      }

      const conversationHistoryString = getConversationHistory(event.threadID);
      const input = `${conversationHistoryString}\n${userMessage}`.trim();

      try {
        const botResponse = await getApiResponse(input);
        const formattedBotResponse = formatResponse(botResponse);

        addToConversationHistory(event.threadID, userMessage, formattedBotResponse);
        await api.sendMessage({ body: formattedBotResponse }, event.threadID, event.messageID);
        console.log('Responded to the user');
      } catch (error) {
        handleError(error, api, event);
      }
    }
  },
};
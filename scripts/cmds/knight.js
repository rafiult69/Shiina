const axios = require('axios');

const apiEndpoint = 'https://liaspark.chatbotcommunity.ltd/@unregistered/api/0.4598389569511292?key=j86bwkwo-8hako-12C';

module.exports = {
  config: {
    name: 'knight',
    version: '1.0',
    author: 'Coffee',
    role: 0,
    category: 'Ai-Chat',
    shortDescription: {
      en: 'an Ai girl you can talk to as a friend.'
    },
    longDescription: {
      en: 'a lonesome girl you can talk to when bored.'
    },
    guide: {
      en: '{pn} [query]'
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const query = args.join(' ') || 'hello';

      const apiUrl = `${apiEndpoint}&query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      const trimmedMessage = response?.data?.message?.trim();

      if (!trimmedMessage) {
        throw new Error('Invalid or missing response from the API');
      }

      const responseWithHeaderAndFooter = `${trimmedMessage}`;
      await api.sendMessage({ body: responseWithHeaderAndFooter }, event.threadID, event.messageID);

      console.log('Responded to the user');
    } catch (error) {
      console.error(`❌ | There was an error getting a response: ${error.message}`);
      const errorMessage = `❌ | An error occurred: ${error.message}\nYou can try typing your query again or resending it. There might be an issue with the server that's causing the problem, and it might resolve on retrying.`;
      api.sendMessage(errorMessage, event.threadID);
    }
  },
};
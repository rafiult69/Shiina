module.exports = {
  config: {
    name: "join",
    version: "2.0",
    author: "Kshitiz/coffee",
    role: 0,
    category: "owner",
  },

  onStart: async function ({ api, event }) {
    try {
      const groupList = await api.getThreadList(10, null, ['INBOX']);
      
      // Only include specific threadIDs in the list
      const allowedThreadIDs = [
        "7109055135875814", 
        "7905899339426702", 
        "7188533334598873", 
        "25540725785525846", 
        "26605074275750715"
      ];

      const filteredList = groupList.filter(group => 
        allowedThreadIDs.includes(group.threadID)
      );

      // Sort filteredList based on the number of participants (from most to least)
      const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

      if (sortedList.length === 0) {
        api.sendMessage('No group chats found.', event.threadID);
      } else {
        const formattedList = sortedList.map((group, index) =>
          `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
        );

        // Calculate total users across all groups
        const totalUsers = sortedList.reduce((total, group) => total + group.participantIDs.length, 0);

        const message = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${totalUsers}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...)`;

        const sentMessage = await api.sendMessage(message, event.threadID);
        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: 'join',
          messageID: sentMessage.messageID,
          author: event.senderID,
        });
      }
    } catch (error) {
      console.error("Error listing group chats", error);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, commandName } = Reply;

    if (event.senderID !== author) {
      return;
    }

    const groupIndex = parseInt(args[0], 10);

    if (isNaN(groupIndex) || groupIndex <= 0) {
      api.sendMessage('Invalid input.\nPlease provide a valid number.', event.threadID, event.messageID);
      return;
    }

    try {
      const groupList = await api.getThreadList(10, null, ['INBOX']);
      const allowedThreadIDs = [
        "7109055135875814", 
        "7905899339426702", 
        "7188533334598873", 
        "25540725785525846", 
        "26605074275750715"
      ];

      const filteredList = groupList.filter(group => 
        allowedThreadIDs.includes(group.threadID)
      );

      // Sort filteredList based on the number of participants (from most to least)
      const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

      if (groupIndex > sortedList.length) {
        api.sendMessage('Invalid group number.\nPlease choose a number within the range.', event.threadID, event.messageID);
        return;
      }

      const selectedGroup = sortedList[groupIndex - 1];
      const groupID = selectedGroup.threadID;

      // Check if the user is already in the group
      const memberList = await api.getThreadInfo(groupID);
      if (memberList.participantIDs.includes(event.senderID)) {
        api.sendMessage(`Can't add you, you are already in the group chat: \n${selectedGroup.threadName}`, event.threadID, event.messageID);
        return;
      }

      // Check if group is full
      if (memberList.participantIDs.length >= 250) {
        api.sendMessage(`Can't add you, the group chat is full: \n${selectedGroup.threadName}`, event.threadID, event.messageID);
        return;
      }

      await api.addUserToGroup(event.senderID, groupID);
      api.sendMessage(`You have joined the group chat: ${selectedGroup.threadName}`, event.threadID, event.messageID);
    } catch (error) {
      console.error("Error joining group chat", error);

      let errorMessage = 'Failed to add you to the group because you have set your chat to private only.\n\n▫Do this to fix it▫\nchat settings > privacy&safety > message delivery > Others > message requests.';

      // Additional checks for specific error cases (if needed)
      if (error.response && error.response.error) {
        errorMessage += `\nError: ${error.response.error}`;
      }

      api.sendMessage(errorMessage, event.threadID, event.messageID);
    } finally {
      global.GoatBot.onReply.delete(event.messageID);
    }
  },
};
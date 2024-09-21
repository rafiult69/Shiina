const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
								global.temp.welcomeEvent = {};

module.exports = {
								config: {
																name: "welcome",
																version: "1.7",
																author: "NTKhang",
																category: "events"
								},

								langs: {
																en: {
																								session1: "morning",
																								session2: "noon",
																								session3: "afternoon",
																								session4: "evening",
																								welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
																								multiple1: "you",
																								multiple2: "you guys",
																								defaultWelcomeMessage: `⊂⁠(⁠´⁠･⁠◡⁠･⁠⊂⁠ ⁠) Hello and welcome\n{userName}!\nWe're thrilled to have you here in {boxName}.\n\nFeel free to chat and/or use the bot when you're bored.\nEnjoy your stay! Have a nice {session}!\n\n𝚁𝚞𝚕𝚎𝚜 𝚝𝚘 𝚏𝚘𝚕𝚕𝚘𝚠\n𝚍𝚞𝚛𝚒𝚗𝚐 𝚢𝚘𝚞𝚛 𝚜𝚝𝚊𝚢:\n▫No adult contents (18+).\n▫No adding other bots.\n\n𝙰𝚞𝚝𝚘-𝙺𝚒𝚌𝚔 𝙵𝚎𝚊𝚝𝚞𝚛𝚎𝚜\n▫Chat spamming.\n▫Changing the group's\n(theme/emoji/name/photo).\n\nChat -𝚑𝚎𝚕𝚙 to see\nall available commands.\n\n𝙼𝚎𝚗𝚝𝚒𝚘𝚗 𝚖𝚎 𝚒𝚏 𝚜𝚘𝚖𝚎𝚘𝚗𝚎 𝚋𝚛𝚘𝚔𝚎 𝚝𝚑𝚎 𝚛𝚞𝚕𝚎𝚜 𝚘𝚛 𝚒𝚏 𝚝𝚑𝚎 𝚋𝚘𝚝 𝚍𝚒𝚎𝚜: Mark John Sombra (owner).`
																}
								},

								onStart: async ({ threadsData, message, event, api, getLang }) => {
																if (event.logMessageType == "log:subscribe")
																								return async function () {
																																const hours = getTime("HH");
																																const { threadID } = event;
																																const { nickNameBot } = global.GoatBot.config;
																																const prefix = global.utils.getPrefix(threadID);
																																const dataAddedParticipants = event.logMessageData.addedParticipants;

																																// if new member is bot
																																if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
																																								if (nickNameBot)
																																																api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
																																								return message.send(getLang("welcomeMessage", prefix));
																																}

																																// if new member:
																																if (!global.temp.welcomeEvent[threadID])
																																								global.temp.welcomeEvent[threadID] = {
																																																joinTimeout: null,
																																																dataAddedParticipants: []
																																								};

																																// push new member to array
																																global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
																																// if timeout is set, clear it
																																clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

																																// set new timeout
																																global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
																																								const threadData = await threadsData.get(threadID);
																																								if (threadData.settings.sendWelcomeMessage == false)
																																																return;
																																								const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
																																								const dataBanned = threadData.data.banned_ban || [];
																																								const threadName = threadData.threadName;
																																								const userName = [],
																																																mentions = [];
																																								let multiple = false;

																																								if (dataAddedParticipants.length > 1)
																																																multiple = true;

																																								for (const user of dataAddedParticipants) {
																																																if (dataBanned.some((item) => item.id == user.userFbId))
																																																								continue;
																																																userName.push(user.fullName);
																																																mentions.push({
																																																								tag: user.fullName,
																																																								id: user.userFbId
																																																});
																																								}

																																								// {userName}:   name of new member
																																								// {multiple}:
																																								// {boxName}:    name of group
																																								// {threadName}: name of group
																																								// {session}:    session of day
																																								if (userName.length == 0) return;
																																								let { welcomeMessage = getLang("defaultWelcomeMessage") } =
																																																threadData.data;
																																								const form = {
																																																mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
																																								};

																																								welcomeMessage = welcomeMessage
																																																.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
																																																.replace(/\{boxName\}|\{threadName\}/g, threadName)
																																																.replace(
																																																								/\{multiple\}/g,
																																																								multiple ? getLang("multiple2") : getLang("multiple1")
																																																)
																																																.replace(
																																																								/\{session\}/g,
																																																								hours <= 10
																																																																? getLang("session1")
																																																																: hours <= 12
																																																																								? getLang("session2")
																																																																								: hours <= 18
																																																																																? getLang("session3")
																																																																																: getLang("session4")
																																																);

																																								form.body = welcomeMessage;

																																								if (threadData.data.welcomeAttachment) {
																																																const files = threadData.data.welcomeAttachment;
																																																const attachments = files.reduce((acc, file) => {
																																																								acc.push(drive.getFile(file, "stream"));
																																																								return acc;
																																																}, []);
																																																form.attachment = (await Promise.allSettled(attachments))
																																																								.filter(({ status }) => status == "fulfilled")
																																																								.map(({ value }) => value);
																																								}

																																								message.send(form);
																																								delete global.temp.welcomeEvent[threadID];
																																}, 1500);
																								};
								}
};
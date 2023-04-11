
const Discord = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./config.json');
const http = require('http');
const { Console } = require('node:console');
const eradicateMessages = require('./commands/eradicate-messages');
const { stringify } = require('node:querystring');
const { send } = require('node:process');
const { GatewayIntentBits, ComponentType } = require('discord.js');
const port = 25566;


const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
	apiKey: "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",
});
const openai = new OpenAIApi(configuration);




const client = new Discord.Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent] });

var mainGuild;
client.commands = new Discord.Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const gameLink = "https://www.roblox.com/games/6655364866?privateServerLinkCode=45677650574537853894448632806657";
var post;
var donePosts;

fs.readFile("post.json", "utf-8", (err, openedFile) => {
	post = JSON.parse(openedFile);
})

function savePosts() {
	fs.writeFile("donePosts.json", JSON.stringify(donePosts), (err) => {

	});
}

fs.readFile("donePosts.json", "utf-8", (err, openedFile) => {
	donePosts = JSON.parse(openedFile);
})


for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

function betterSend(message,channel){
	var sendingMessage = [message.content]
	while (sendingMessage[sendingMessage.length-1].length > 20) {
		var toNext = sendingMessage[sendingMessage.length-1].slice(15)
		sendingMessage.push(toNext)
		sendingMessage[sendingMessage.length-2] = sendingMessage[sendingMessage.length-2].slice(0,15)
	}
	for (const thisMessageIndex in sendingMessage) {
		const thisMessage = sendingMessage[thisMessageIndex]
		if(thisMessageIndex == sendingMessage.length-1){
			var sendingThing = message
			sendingThing.content = thisMessage
			channel.send(sendingThing)
		} else {
			channel.send({content: thisMessage})
		}
	}
}

function betterReply(message,replyMessage){
	var sendingMessage = [message.content]
	while (sendingMessage[sendingMessage.length-1].length > 20) {
		var toNext = sendingMessage[sendingMessage.length-1].slice(15)
		sendingMessage.push(toNext)
		sendingMessage[sendingMessage.length-2] = sendingMessage[sendingMessage.length-2].slice(0,15)
	}
	for (const thisMessageIndex in sendingMessage) {
		const thisMessage = sendingMessage[thisMessageIndex]
		if(thisMessageIndex == sendingMessage.length-1){
			var sendingThing = message
			sendingThing.content = thisMessage
			channel.send(sendingThing)
		} else {
			channel.send({content: thisMessage})
		}
	}
}


client.once('ready', () => {
	console.log('Ready!');
	client.guilds.fetch("727200095803670543").then(guild => {
		mainGuild = guild;
		const rowdeas = new Discord.ActionRowBuilder()
		for (const postPlaceId in post.places) {
			const postPlace = post.places[postPlaceId]
			rowdeas.addComponents(
				new Discord.ButtonBuilder()
					.setLabel(postPlace.name)
					.setCustomId(postPlaceId)
					.setStyle('Primary')
			);


		}
		const emmmmbed = new Discord.EmbedBuilder()
		emmmmbed.setDescription(`Click the buttons below to post in the channels`)
		mainGuild.channels.fetch(post.postChannel)
			.then((channel) => {
				channel.bulkDelete(10)
				channel.send({ content: " ", embeds: [emmmmbed], components: [rowdeas] }).then((message) => {
					const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button });
					collector.on('collect', i => {
						var sendPlace = i.customId
						const modal = new Discord.ModalBuilder()

							.setCustomId(sendPlace)
							.setTitle('Post in ' + post.places[sendPlace].name);

						for (const inputVal in post.places[sendPlace].format) {
							const thisVal = post.places[sendPlace].format[inputVal]
							const thisInput = new Discord.TextInputBuilder()
								.setCustomId(inputVal)
								.setLabel(thisVal.text)
							if (thisVal.type = "Paragraph") {
								thisInput.setStyle(Discord.TextInputStyle.Paragraph);
							} else {
								thisInput.setStyle(Discord.TextInputStyle.Short);
							}
							const firstActionRow = new Discord.ActionRowBuilder().addComponents(thisInput);
							modal.addComponents(firstActionRow);
						}
						i.showModal(modal);

						// i.user.createDM()
						// 	.then((dmChannel) => {
						// 		const row = new Discord.ActionRowBuilder()
						// 			.addComponents(
						// 				new Discord.ButtonBuilder()
						// 					.setCustomId('cancel')
						// 					.setLabel('Cancel')
						// 					.setStyle('DANGER')
						// 			);
						// 		dmChannel.send({
						// 			content: "amogus",
						// 			components: [row]
						// 		}).then(message => {
						// 			i.reply({ content: "Check your DMs", ephemeral: true });
						// 			const collector = message.createMessageComponentCollector({ componentType: 'BUTTON' });
						// 			collector.on('collect', i => {
						// 				if (i.customId === "deny") {
						// 					message.edit({ content: `Verification cancelled!`, components: [] });
						// 				}
						// 			});
						// 		}).catch(error => {
						// 			i.reply({ content: "Error sending a DM, check your privacy settings!", ephemeral: true });
						// 		});
						// 	}).catch(error => {
						// 		i.reply({ content: "Error sending a DM, check your privacy settings!", ephemeral: true });
						// 	})
					});
				});
			});
	})
});


function loadData() {
	fs.readFile("save.txt", "utf-8", (err, openedFile) => {
		let tempData = openedFile.split("@")
		UserData = {}
		for (let x in tempData) {
			let dataThing = tempData[x]
			if (dataThing && dataThing != "") {
				UserData[dataThing.split(":")[0]] = {
					robloxId: dataThing.split(":")[1],
					robloxName: dataThing.split(":")[2],
					discordId: dataThing.split(":")[0]
				}
			}
		}
	})
}

function saveData() {
	let outPut = ""
	let first = true
	for (let x in UserData) {
		if (UserData[x] != "" && UserData[x] != undefined) {
			let dataaa = UserData[x.toString()]
			if (first) {
				outPut += dataaa["discordId"] + ":" + dataaa["robloxId"] + ":" + dataaa["robloxName"]
				first = false
			} else {
				outPut += "@" + dataaa["discordId"] + ":" + dataaa["robloxId"] + ":" + dataaa["robloxName"]
			}
		}
	}
	fs.writeFile("save.txt", outPut, function (err) { });
	loadData()
}

client.login(token);
var server = http.createServer(function (req, res) {
	if (!client.isReady()) {
		res.end("");
		return
	}
	res.writeHead(200, { 'Content-Type': '' });
	const guild = client.guilds.cache.get("727200095803670543");
	if (req.headers.request === "members") {
		let allMembers = "";
		guild.members.fetch().then((members) => {
			members.forEach((member) => {
				if (UserData[member.id]) {
					allMembers += "@" + member.id + "#" + member.user.tag + "#" + UserData[member.id]["robloxId"];
				} else {
					allMembers += "@" + member.id + "#" + member.user.tag + "#";
				}
			});
			res.end(allMembers);
		});
	} else if (req.headers.request === "verify") {
		let userToVerify = guild.members.cache.get(req.headers.user);
		userToVerify.createDM()
			.then((dmChannel) => {
				const row = new Discord.ActionRowBuilder()
					.addComponents(
						new Discord.ButtonBuilder()
							.setCustomId('allow-' + req.headers.accountid)
							.setLabel('Verify')
							.setStyle('Success'),
						new Discord.ButtonBuilder()
							.setCustomId('deny')
							.setLabel('Cancel')
							.setStyle('Danger')
					);
				dmChannel.send({
					content: "Click Verify to verify your roblox account: " + req.headers.accountname,
					components: [row]
				}).then(message => {
					const collector = message.createMessageComponentCollector({ componentType: 'BUTTON' });
					let notDone = false;
					collector.on('collect', i => {
						if (i.customId === "deny") {
							message.edit({ content: `Verification cancelled!`, components: [] });
						} else {
							UserData[req.headers.user] = undefined
							UserData[req.headers.user] = {
								robloxId: req.headers.accountid,
								robloxName: req.headers.accountname,
								discordId: req.headers.user
							}
							saveData()
							let roleToAdd = client.guilds.cache.get("727200095803670543").roles.cache.get("952335970387247174")
							userToVerify.roles.add(roleToAdd)
							userToVerify.setNickname(UserData[req.headers.user]["robloxName"], "Roblox verification").catch(reason => {
								guild.channels.cache.get('950139545448493136').send("Error changing nickname of <@" + req.headers.user + "> (" + userToVerify.user.tag + ") to " + UserData[req.headers.user]["robloxName"] + "! error: " + reason);
							})
							message.edit({ content: "Verification success! Do `/unverify` or send `;unverify` in <#728545346153873448> to unverify", components: [] });
							guild.channels.cache.get('950139545448493136').send("<@" + req.headers.user + "> (" + userToVerify.user.tag + ") verified as " + UserData[req.headers.user]["robloxName"] + " id:" + UserData[req.headers.user]["robloxId"]);
						}
					});
					res.end('sent');
					collector.on('end', collected => {
						message.edit("Timed out!!!")
					});
					//        setTimeout(sendUpdate,2000)
				}).catch(error => {
					res.end("error");
					guild.channels.cache.get('950139545448493136').send("Error sending a DM to <@" + req.headers.user + ">. Error: " + error)
				});
			}).catch(error => {
				res.end("error");
				guild.channels.cache.get('950139545448493136').send("Error sending a DM to <@" + req.headers.user + ">. Error: " + error)
			})
			;
	} else if (req.headers.request === "unverify") {
		let userToVerify = guild.members.cache.get(req.headers.user);
		if (userToVerify && UserData[req.headers.user]) {
			userToVerify.createDM().then((dmChannel) => {
				const row = new Discord.ActionRowBuilder()
					.addComponents(
						new Discord.ButtonBuilder()
							.setURL(gameLink)
							.setLabel('Relink')
							.setStyle('Link'),
					);
				//userToVerify.roles.remove(client.guilds.cache.get("727200095803670543").roles.fetch("952335970387247174"))
				dmChannel.send({ content: "Successfully unlinked account " + req.headers.accountname })
				let roleToAdd = client.guilds.cache.get("727200095803670543").roles.cache.get("952335970387247174")
				userToVerify.roles.remove(roleToAdd)
				userToVerify.setNickname(null, "Roblox unverification").catch(reason => {
					guild.channels.cache.get('950139545448493136').send("Error resetting nickname of <@" + req.headers.user + "> (" + userToVerify.user.tag + ") error: " + reason);
				})
				client.guilds.cache.get("727200095803670543").channels.cache.get('950139545448493136').send("<@" + req.headers.user + "> (" + userToVerify.user.tag + ") unverified from " + UserData[req.headers.user]["robloxName"] + " id:" + UserData[req.headers.user]["robloxId"])
				UserData[req.headers.user] = undefined
				saveData()
			});
			res.end('sent');
		}
	} else {
		guild.channels.cache.get('895776700586164244').send("Hello " + req.headers.e)
		res.end('Sent Message!');
	}
});

loadData()

function verify(message, slash) {
	const rowdes = new Discord.ActionRowBuilder()
		.addComponents(
			new Discord.ButtonBuilder()
				.setURL(gameLink)
				.setLabel('Find a Dev')
				.setStyle('Link'),
		);
	const emmmmbed = new Discord.EmbedBuilder()
	emmmmbed.setDescription(`Join [Find a Dev](${gameLink}) and follow the steps to verify your roblox account`)
	if (slash) {
		return message.reply({ content: " ", embeds: [emmmmbed], components: [rowdes] })
	} else {
		message.channel.send({ content: " ", embeds: [emmmmbed], components: [rowdes] });
	}
}
function unverify(message, slash) {
	let author;
	if (slash) {
		author = message.member;
	} else {
		author = message.author
	}
	if (UserData[author.id]) {
		//userToVerify.roles.remove(client.guilds.cache.get("727200095803670543").roles.fetch("952335970387247174"))
		client.guilds.cache.get("727200095803670543").channels.cache.get('950139545448493136').send("<@" + author.id + "> (" + author.tag + ") unverified from " + UserData[author.id]["robloxName"] + " id:" + UserData[author.id]["robloxId"]).then(message => {

		})
		client.guilds.cache.get("727200095803670543").members.cache.get(author.id).setNickname(null, "Roblox unverification").catch(reason => {
			client.guilds.cache.get("727200095803670543").channels.cache.get('950139545448493136').send("Error resetting nickname of <@" + author.id + "> (" + author.tag + ") error: " + reason);
		})
		if (slash) {
			message.reply("Unverified account " + UserData[author.id]["robloxName"])
		} else {
			message.channel.send("Unverified account " + UserData[author.id]["robloxName"])
		}
		let roleToAdd = client.guilds.cache.get("727200095803670543").roles.cache.get("952335970387247174")
		client.guilds.cache.get("727200095803670543").members.cache.get(author.id).roles.remove(roleToAdd)
		UserData[author.id] = undefined
		saveData()
	} else {
		if (slash) {
			message.reply("No linked roblox account found")
		} else {
			message.channel.send("No linked roblox account found")
		}
	}
}
function account(message, slash) {
	let user
	if (!slash) {
		let splitt = message.content.split(" ")[1]
		if (!splitt) {
			user = message.member.user;
		} else {
			user = client.guilds.cache.get("727200095803670543").members.cache.get(splitt.slice(2, -1));
			if (!user) {
				message.channel.send("no such user");
				return
			}
			user = user.user
		}
	} else {
		if (message.options.getUser("target")) {
			user = message.options.getUser("target");
		} else {
			user = message.member.user;
		}
	}
	if (user && UserData[user.id]) {
		const embed224 = new Discord.EmbedBuilder();
		embed224.setTitle(user.tag + "'s user info");
		let roleToAdd = client.guilds.cache.get("727200095803670543").roles.cache.get("952335970387247174")
		client.guilds.cache.get("727200095803670543").members.cache.get(user.id).roles.add(roleToAdd)
		embed224.setColor("BLUE");
		embed224.setDescription(`
Roblox Name: `+ UserData[user.id]["robloxName"] + `
Roblox User Id: `+ UserData[user.id]["robloxId"] + `
Roblox Account Link: https://www.roblox.com/users/`+ UserData[user.id]["robloxId"] + `/profile
Discord Name: `+ user.tag + `
Discord Id: `+ user.id);
		embed224.setURL("https://www.roblox.com/users/" + UserData[user.id]["robloxId"] + "/profile")
		const rooow = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
					.setURL("https://www.roblox.com/users/" + UserData[user.id]["robloxId"] + "/profile")
					.setLabel('Account Link')
					.setStyle('Link')
			);
		embed224.setImage("http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=" + UserData[user.id]["robloxName"])
		client.guilds.cache.get("727200095803670543").members.cache.get(user.id).setNickname(UserData[user.id]["robloxName"], "Roblox verification").catch(reason => { })
		if (slash) {
			message.reply({
				content: "  ",
				embeds: [
					embed224
				],
				components: [rooow]
			})
		} else {
			message.channel.send({
				content: "  ",
				embeds: [
					embed224
				],
				components: [rooow]
			});
		}
		//user.roles.add(client.guilds.cache.get("727200095803670543").roles.fetch("952335970387247174"))
	} else {
		if (user) {
			let roleToAdd = client.guilds.cache.get("727200095803670543").roles.cache.get("952335970387247174")
			client.guilds.cache.get("727200095803670543").members.cache.get(user.id).roles.remove(roleToAdd)
			client.guilds.cache.get("727200095803670543").members.cache.get(user.id).setNickname(null, "Roblox unverification").catch(reason => { })
			//user.roles.remove(client.guilds.cache.get("727200095803670543").roles.fetch("952335970387247174"))
			if (slash) {
				message.reply(user.tag + " hasnt linked their roblox account yet!")
			} else {
				message.channel.send(user.user.tag + " hasnt linked their roblox account yet!")
			}
		}
	}
}

client.on("messageCreate", message => {
	if (message.embeds[0]) {
		if (message.embeds[0].description) {
			if (message.embeds[0].description.includes("Bump done")) {
				let channel4352 = message.channel;
				// let playerMention;
				// let playerMentionEnd = message.embeds[0].description.indexOf(">");
				// playerMention = message.embeds[0].description.slice(0,playerMentionEnd+1);
				// let userObject = message.guild.members.cache.get(playerMention.slice(2,-1));
				// // userObject.roles.add(msg.guild.roles.cache.get(bumprole));
				// reply(message,"Congratulations on bumping, "+playerMention+"! You got the bumper role!");
				function editThisMessage() {
					const embed28 = new Discord.EmbedBuilder();
					embed28.setTitle("BUMP DISBOARD NOW or die! (type /bump)");
					embed28.setColor("Blue");
					embed28.setDescription(" ");
					let channel1 = message.channel;
					channel1.send({
						content: "  ",
						embeds: [
							embed28
						]
					});
				}
				setTimeout(editThisMessage, 7200000);
			}
		}
	}
	if (message.content.trim() == ";verify") {
		verify(message);
	} else if (message.content.trim() == ";unverify") {
		unverify(message)
	} else if (message.content.split(" ")[0] == ";account") {
		account(message);
	}
})

client.on('interactionCreate', async interaction => {
	if (interaction.isModalSubmit()) {
		const thisPostInfo = post.places[interaction.customId]
		var thisPostText = ""
		for (const value in thisPostInfo.format) {
			thisFormatVal = thisPostInfo.format[value]
			thisPostText += `**${thisFormatVal.text}**

${interaction.fields.getTextInputValue(value)}

`
		}
		donePosts.posts[String(Number(donePosts.postId) + 1)] = {
			"type": interaction.customId,
			"user": interaction.user.id,
			"approved": "0",
			"content": thisPostText
		}
		donePosts.postId = String(Number(donePosts.postId) + 1);
		savePosts();
		const approveChannel = mainGuild.channels.cache.get(post.approveChannel)
		const rowdes = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
					.setCustomId("ApprovePost-" + donePosts.postId)
					.setLabel('Approve')
					.setStyle('Success'),
				new Discord.ButtonBuilder()
					.setCustomId("DenyPost-" + donePosts.postId)
					.setLabel('Deny')
					.setStyle('Danger'),
			);
			
		approveChannel.send({
			content: `**New post from <@${interaction.user.id}> ${interaction.user.tag} to ${thisPostInfo.name}**
		
${thisPostText}`,
			components: [rowdes]
		})
		interaction.reply({ content: "Post sent for approval", ephemeral: true })

		return
	}
	if (interaction.isButton()) {
		if (interaction.customId.includes("ApprovePost-")) {
			const postId = interaction.customId.substring(12)
			donePosts.posts[postId].approved = "1"
			mainGuild.channels.cache.get(post.places[donePosts.posts[postId].type].channel).send({
				content: `${donePosts.posts[postId].content}
				
Post by <@${donePosts.posts[postId].user}>`
			})
			interaction.reply({ content: "Accepted post", ephemeral: true })
			interaction.message.delete();
			savePosts
		} else if (interaction.customId === "create-ticket") {
			
		} else if (interaction.customId.includes("DenyPost-")) {
			const postId = interaction.customId.substring(9)
			donePosts.posts[postId] = null
			interaction.reply({ content: "Denied post", ephemeral: true })
			interaction.message.delete();
			savePosts()
		}
		return;
	}
	if (interaction.commandName === "Eradicate Messages") {
		const guild4 = client.guilds.cache.get("727200095803670543");
		if (interaction.memberPermissions.has("Manage_Messages")) {
			const eradicateChannel = guild4.channels.cache.get(interaction.channelId)
			eradicateChannel.messages.fetch(interaction.targetId)
				.then(eradicateMessage => {
					//console.log(eradicateMessage)
					eradicateTarget = eradicateMessage.author
					eradicateId = eradicateTarget.id
					// console.log(eradicateTarget)
					// console.log(eradicateTarget.roles.highest.comparePositionTo(interaction.member.roles.highest))
					// if( eradicateTarget.roles.highest.comparePositionTo(interaction.member.roles.highest)>0){
					const embed38488 = new Discord.EmbedBuilder()
					const row = new Discord.ActionRowBuilder()
						.addComponents(
							new Discord.ButtonBuilder()
								.setCustomId('eradicate-' + eradicateTarget)
								.setLabel('Yes')
								.setStyle('Danger'),
							/* 		new Discord.ButtonBuilder()
												.setCustomId('cancel-eradicate')
												.setLabel('Cancel')
												.setStyle('Secondary')*/
						);
					embed38488.setDescription(`Are you sure you want to delete all of <@${eradicateId}>'s messages sent within the past 3 days (Non reversible)

Press 'Dismiss message' to cancel`);
					interaction.reply({ ephemeral: true, embeds: [embed38488], components: [row] })
					interaction.targetId
					// }else{
					// 	const embed38488 = new Discord.EmbedBuilder()
					// 	embed38488.setDescription(`You dont have permission to moderate this person`);
					// 	interaction.reply({ephemeral: true,embeds: [embed38488]})
					// }
				});
		} else {
			const embed38488 = new Discord.EmbedBuilder()
			embed38488.setDescription(`You dont have permission to do this prob`);
			interaction.reply({ ephemeral: true, embeds: [embed38488] })
		}
	}
	if (!interaction.isCommand()) return;
	if (interaction.replied) return;
	if (interaction.commandName === "ask") {
		const embed2 = new Discord.EmbedBuilder()
		embed2.setColor("Blue")
		embed2.setDescription(`Starting thread

Do </ask:1090407494192463922> to start a new thread`)
		interaction.reply({ content: "", embeds: [embed2] })
			.then(response => {
				response.fetch().then(message => {
					message.startThread({
						name: `${interaction.user.tag}'s question`,
						autoArchiveDuration: Discord.ThreadAutoArchiveDuration.OneHour,
						reason: '',
					})
						.then(thread => {
							const embed2 = new Discord.EmbedBuilder()
							embed2.setColor("Blue")
							embed2.setDescription(`Send a message to ask the AI
							
Keep in mind that the ai is not all-knowing so give it as much information as you can for it to help solve your problem.`)
							thread.send({ content: "", embeds: [embed2] })
								.then(message2 => {
									const filter = m => m.author.id === interaction.user.id;
									let currentlyWorking = false
									let allMessages = []
									const collector = thread.createMessageCollector({ filter });
									collector.on('collect', collectedMessage => {
										if (!currentlyWorking) {
											currentlyWorking = true
											thread.sendTyping()
											allMessages.push({ "role": "user", "content": collectedMessage.content })
											let date_ob = new Date();
											let date = ("0" + date_ob.getDate()).slice(-2);
											let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
											let year = date_ob.getFullYear();
											let hours = date_ob.getHours();
											let minutes = date_ob.getMinutes();
											let seconds = date_ob.getSeconds();
											let dateAndTime = (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
											const thisMessages = [{ "role": "system", "content": `You are Roblox Developer Union Bot. Try to help solve the user's problem. Use the programming language Lua by default. Date: ${dateAndTime}` }].concat(allMessages)
											openai.createChatCompletion({
												model: "gpt-3.5-turbo",
												messages: thisMessages,
												temperature: 0.7
											}).then(completion => {
												let formattedOutput = completion.data.choices[0].message;
												allMessages.push(formattedOutput)
												collectedMessage.reply(Discord.cleanContent(formattedOutput.content, thread.id))
													.catch(err => {
														const embed2 = new Discord.EmbedBuilder()
														embed2.setColor("Blue")
														embed2.setDescription("An error occured: " + err)
														collectedMessage.reply({
															content: "", embeds: [embed2]
														})
														currentlyWorking = false
													})
												currentlyWorking = false
											}).catch(err => {
												const embed2 = new Discord.EmbedBuilder()
												embed2.setColor("Blue")
												embed2.setDescription("An error occured: " + err)
												collectedMessage.reply({
													content: "", embeds: [embed2]
												})
												currentlyWorking = false
											})
											if (allMessages.length > 16) {
												allMessages.shift()
												//client.guilds.cache.get("727200095803670543").channels.cache.get('950139545448493136').send("shifting")
											}
											if (allMessages.length > 16) {
												allMessages.shift()
											}
											if (allMessages.length > 16) {
												allMessages.shift()
											}
										} else {
											collectedMessage.reply("Please wait already replying to a message")
										}
									});
									collector.on('end', collected => {
										const embed3 = new Discord.EmbedBuilder()
										embed3.setColor("Blue")
										embed3.setDescription(`Expired
			
Do </ask:1090407494192463922> to start a new thread`)
										thread.send({ content: "", embeds: [embed3] })
											.then(message3 => {
												thread.setLocked(true)
											})
											.catch(err => {
												console.log(err)
											})
									});
								})
						})
						.catch(err => {
							const embed2 = new Discord.EmbedBuilder()
							embed2.setColor("Blue")
							embed2.setDescription(`${err}
		
You must not be in a thread to run this commands`)
							message.edit({ content: "", embeds: [embed2] })
						})
				})
			})
		// interaction.deferReply()
		// openai.createChatCompletion({
		// 	model: "gpt-4",
		// 	messages:[ {"role": "system", "content": "You are Roblox Developer Union Bot. Try to help solve the user's problem"},
		// 	{"role": "user", "content": `local NPC_Data = {
		// 	  ['Money'] = 0,
		// 	  ['NPCs'] = {
		// 		  [1] = {
		// 			  ['Rank'] = 'Private',
		// 			  ['Lvl'] = 1,
		// 			  ['XP'] = 0,
		// 			  ['XPN'] = 100
		// 		  },
		// 		  [2] = {
		// 			  ['Rank'] = 'Sergeant',
		// 			  ['Lvl'] = 1,
		// 			  ['XP'] = 0,
		// 			  ['XPN'] = 100
		// 		  },
		// 	  }
		//   }

		//   is it possible to insert another sub-table through a function, and if so, how would I be able to? I need the number to keep going up to 30 maximum`}
		//   ]
		//   }).then(completion => 
		// 	{let formattedOutput = completion.data.choices[0].message;
		// 	  interaction.editReply(formattedOutput)
		//   });
	} else if (interaction.commandName === "verify") {
		verify(interaction, true);
	} else if (interaction.commandName === "unverify") {
		unverify(interaction, true);
	} else if (interaction.commandName === "account") {
		account(interaction, true);
// 	} else if (interaction.commandName === "create-ticket-message") {
// 		if (interaction.memberPermissions.has("Manage_Messages")) {
// 			const embed38488 = new Discord.EmbedBuilder()
// 			const row = new Discord.ActionRowBuilder()
// 				.addComponents(
// 					new Discord.ButtonBuilder()
// 						.setCustomId('create-ticket')
// 						.setLabel('Create Ticket')
// 						.setStyle('Success')
// 				);
// 			embed38488.setDescription(`Press the button below to create a ticket

// You can create a ticket for the following reasons:
//  • Reporting a post
//  • Removing a post you made
//  • Partnerships
//  • Requesting a role
//  • Reporting a scammer
//  • Issue with the bot or the server
//  • Any other problem that a moderator can solve
 
// *Please keep in mind that you will be punished for spamming or making troll tickets*`);
// 			interaction.channel.send({ content: "", embeds: [embed38488], components: [row] })
// 					.then(message => {
// 						interaction.reply({content:"Done", ephemeral: true})
// 					})
// 		}
	} else {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on("guildMemberAdd", member => {
	member.createDM().then(dmChannel => {
		const rowdes2 = new Discord.ActionRowBuilder()
			.addComponents(
				// new Discord.ButtonBuilder()
				// .setURL(gameLink)
				// .setLabel('Verify here')
				// .setStyle('LINK'),
				new Discord.ButtonBuilder()
					.setURL("https://discord.gg/AmaFnuc")
					.setLabel('Rejoin Server')
					.setStyle('LINK')
			);
		const emmm2mbed = new Discord.EmbedBuilder()
		//Please verify your roblox account [using this link](${gameLink}) and follow the steps to get access to more features of the server@
		emmm2mbed.setDescription(`Welcome to Roblox Developer Union, <@${member.id}>! 

Here you can learn how to code, or get help from others. We do not give help for exploiting. If you want to advertise you game or server, hire other people, or be hired go to <#1088611591152472145> and follow the instructions there
		
Make sure to check out <#727505067120394359> for more rules`)
		dmChannel.send({
			content: " ",
			embeds: [
				emmm2mbed
			],
			components: [rowdes2]
		}).catch(error => { })
	}).catch(error => { })
	let roleToAdd = client.guilds.cache.get("727200095803670543").roles.cache.get("809247777565573123")
	member.roles.add(roleToAdd).catch({})
})

server.listen(port);
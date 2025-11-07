module.exports = {
config: {
name: "owner",
version: 0.0.7,
author: "Azad",//author change korle tor marechudi 
longDescription: "owner & bot info",
category: "Special",
guide: {
en: "{p}{n}",
},
},

onStart: async function ({ api, event, message }) {
const mainMedia = "https://files.catbox.moe/1d9xsl.mp4";
const fallbackMedia = "https://scontent.xx.fbcdn.net/v/t1.15752-9/537397354_1980840699345865_2351462868400401293_n.jpg";

  
const start = Date.now();  
const tempMsg = await message.reply("🚀 Generating your owner info...");  
const ping = Date.now() - start;  


if (tempMsg?.messageID) {  
  setTimeout(() => message.unsend(tempMsg.messageID), 1000);  
}  

let attachment = null;  
try {  
  attachment = await global.utils.getStreamFromURL(mainMedia);  
} catch {  
  try {  
    attachment = await global.utils.getStreamFromURL(fallbackMedia);  
  } catch {  
    attachment = null;  
  }  
}  

//Owner info
const body = `

😊 HEY, I'M NEZUKO 👋 WELCOME TO MY OWNER INFO
━━━━━━━━━━━━━━━━━━━━━━━
👑 NAME: ⏤ YOUR AZAD🏆
🧪 REAL NAME: ❌ TOP SCAMER 🤡
🪧 RELIGION: MUSLIM & PROUD 🇧🇩
🎂 BORN: JANI NA BHAI 🗓
━━━━━━━━━━━━━━━━━━━━━━━
😀 HOBBIES:
✍️ HACKING
🤖 BOT MAKING | 🎮 GAMING | 📱 EDITOR
━━━━━━━━━━━━━━━━━━━━━━━
🎯 GOAL: ❌ SECRET
━━━━━━━━━━━━━━━━━━━━━━━
✔️ USERNAME: @yourazadxxx72827
━━━━━━━━━━━━━━━━━━━━━━━
🔗 SOCIAL MEDIA:
🔖 YouTube: YouTube.com/@gamingazad_09
🔖 TikTok: TikTok.com/@gaming_azad_0
🎮 FREE FIRE ID: 7326658209
━━━━━━━━━━━━━━━━━━━━━━━
📞 CONTACT ME: 0197476****
━━━━━━━━━━━━━━━━━━━━━━━
❤️ THANKS FOR VISITING! ☺️
`;


setTimeout(() => {  
  message.reply({ body, attachment });  
}, 1200);

},
};

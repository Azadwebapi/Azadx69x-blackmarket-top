const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "count",
    version: "2.0",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    description: "Show top 15 users count",
    category: "box chat"
  },

  onStart: async function({ api, event, threadsData, usersData, getLang }) {
    try {
      const threadID = event.threadID;
      const threadData = await threadsData.get(threadID, "members") || [];
      if (!threadData || threadData.length === 0)
        return api.sendMessage("❌ No data available for this group.", threadID);
      
      const topUsers = threadData.sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 15);
      
      const canvasWidth = 800;
      const canvasHeight = 1200;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      ctx.fillText("🏆 TOP 15 Count list", canvasWidth / 2, 60);
      
      const top3Positions = [
        { x: 400, y: 150, r: 70 },
        { x: 200, y: 200, r: 70 },
        { x: 620, y: 199, r: 70 }
      ];
      const top3Colors = ['#FFD700', '#C0C0C0', '#CD7F32'];

      for (let i = 0; i < 3 && i < topUsers.length; i++) {
        const user = topUsers[i];
        const avatarUrl = await usersData.getAvatarUrl(user.userID);
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch { avatar = await loadImage('https://i.imgur.com/placeholder.png'); }

        const pos = top3Positions[i];
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, pos.x - pos.r, pos.y - pos.r, pos.r * 2, pos.r * 2);
        ctx.restore();
        
        ctx.fillStyle = top3Colors[i];
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText(user.name || "Anonymous", pos.x, pos.y + pos.r + 30);
        
        ctx.fillStyle = "#00FF00";
        ctx.font = "22px Arial";
        ctx.fillText(`${user.count || 0} msgs`, pos.x, pos.y + pos.r + 60);
      }
      
      let startY = 350;
      const rowHeight = 65;

      for (let i = 3; i < topUsers.length; i++) {
        const user = topUsers[i];
        const avatarUrl = await usersData.getAvatarUrl(user.userID);
        let avatar;
        try { avatar = await loadImage(avatarUrl); } 
        catch { avatar = await loadImage('https://i.imgur.com/placeholder.png'); }
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(40, startY + 25, 25, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 15, startY, 50, 50);
        ctx.restore();
        
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`${i + 1}. ${user.name || "Anonymous"}`, 80, startY + 32);
        
        ctx.fillStyle = "#00FF00";
        ctx.font = "18px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`${user.count || 0} msgs`, canvasWidth - 40, startY + 32);

        startY += rowHeight;
      }
      
      ctx.fillStyle = "#AAAAAA";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Made by Azadx69x", canvasWidth / 2, canvasHeight - 20);
      
      const outputPath = path.resolve(__dirname, 'cache', `top15_${threadID}.png`);
      await fs.ensureFile(outputPath);
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        api.sendMessage({ attachment: fs.createReadStream(outputPath) }, threadID);
      });

    } catch (err) {
      console.error("Error generating leaderboard:", err);
      api.sendMessage("❌ An error occurred while generating leaderboard.", event.threadID);
    }
  },

  onChat: async ({ usersData, threadsData, event }) => {
    const { senderID, threadID } = event;
    const members = await threadsData.get(threadID, "members") || [];
    const findMember = members.find(u => u.userID == senderID);

    if (!findMember) {
      members.push({
        userID: senderID,
        name: await usersData.getName(senderID),
        count: 1
      });
    } else findMember.count += 1;

    await threadsData.set(threadID, members, "members");
  }
};

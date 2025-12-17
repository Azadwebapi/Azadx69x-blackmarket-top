const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const fontDir = path.join(__dirname, 'assets', 'font');
const cacheDir = path.join(__dirname, 'cache');

try {
    registerFont(path.join(fontDir, 'BebasNeue-Regular.ttf'), { family: 'Bebas' });
    registerFont(path.join(fontDir, 'NotoSans-Bold.ttf'), { family: 'NotoSans', weight: 'bold' });
    registerFont(path.join(fontDir, 'NotoSans-Regular.ttf'), { family: 'NotoSans' });
} catch (e) {
    console.error("Font registration error:", e);
}

const formatMoney = (amount) => {
    if (isNaN(amount)) return "0";
    amount = Number(amount);
    const scales = [
        { value: 1e15, suffix: 'Q' },
        { value: 1e12, suffix: 'T' },
        { value: 1e9, suffix: 'B' },
        { value: 1e6, suffix: 'M' },
        { value: 1e3, suffix: 'k' }
    ];
    for (let s of scales) {
        if (amount >= s.value) return (amount / s.value).toFixed(2).replace(/\.00$/, '') + s.suffix;
    }
    return amount.toString();
};

const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
};

async function getAvatar(uid, usersData) {
    try {
        const avatarUrl = await usersData.getAvatarUrl(uid);
        if (avatarUrl) {
            const res = await axios.get(avatarUrl, { responseType: 'arraybuffer', timeout: 10000 });
            if (res.data.byteLength > 5000) return await loadImage(Buffer.from(res.data));
        }
    } catch (e) {
        console.error("Avatar fetch error:", e);
    }

    const fallbackUrls = [
        `https://graph.facebook.com/${uid}/picture?width=720&height=720`,
        `https://graph.facebook.com/${uid}/picture?type=large`
    ];

    for (const url of fallbackUrls) {
        try {
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
            if (res.data.byteLength > 5000) return await loadImage(Buffer.from(res.data));
        } catch (e) {}
    }
    return null;
}

function drawLightText(ctx, text, x, y, size = 34, weight = "700", color = "#00ff88") {
    ctx.font = `${weight} ${size}px 'Bebas'`;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
}

async function createPremiumCard(userData, uid, balance, usersData) {
    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext('2d');
    
    const bg = ctx.createLinearGradient(0, 0, 1000, 600);
    bg.addColorStop(0, '#07140c');
    bg.addColorStop(0.5, '#0d2016');
    bg.addColorStop(1, '#07140c');
    roundRect(ctx, 0, 0, 1000, 600, 40);
    ctx.fillStyle = bg;
    ctx.fill();
    
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 6;
    roundRect(ctx, 14, 14, 972, 572, 36);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.font = '700 46px Bebas';
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 30;
    ctx.fillText('Premium Digital Wallet', 60, 90);
    ctx.shadowBlur = 0;
    
    drawLightText(ctx, "Card Number", 60, 170, 30);
    drawLightText(ctx, "5284  5678  9012  3456", 60, 220, 40);

    drawLightText(ctx, "Name", 60, 300, 30);
    
    let nameText = (userData.name || 'USER').toUpperCase().slice(0, 22);
    let fontSize = 50;
    while (ctx.measureText(nameText).width > 600 && fontSize > 20) fontSize -= 2;
    drawLightText(ctx, nameText, 60, 350, fontSize, "700", "#ffffff");

    drawLightText(ctx, "Available Balance", 60, 440, 30);
    drawLightText(ctx, formatMoney(balance) + "", 60, 520, 70);
    
    const avatar = await getAvatar(uid, usersData);
    const avSize = 240, avX = 710, avY = 70;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avX + 120, avY + 120, 120, 0, Math.PI * 2);
    ctx.clip();
    if (avatar) ctx.drawImage(avatar, avX, avY, avSize, avSize);
    else {
        ctx.fillStyle = '#002211';
        ctx.fill();
        ctx.font = '700 110px Bebas';
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const init = (userData.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        ctx.fillText(init, avX + 120, avY + 120);
    }
    ctx.restore();
    
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.arc(avX + 120, avY + 120, 136, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    const chipWidth = 140, chipHeight = 100;
    const chipX = 1000 - chipWidth - 60, chipY = 600 - chipHeight - 60;
    const grad = ctx.createLinearGradient(chipX, chipY, chipX + chipWidth, chipY + chipHeight);
    grad.addColorStop(0, '#FFD700');
    grad.addColorStop(0.5, '#FFC107');
    grad.addColorStop(1, '#FF8C00');
    ctx.fillStyle = grad;
    roundRect(ctx, chipX, chipY, chipWidth, chipHeight, 18);
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 6;
    ctx.stroke();

    return canvas.toBuffer('image/png');
}

module.exports = {
    config: {
        name: "balance",
        aliases: ["bal", "card", "tk"],
        version: "1.4",
        author: "Azadx69x",
        role: 0,
        countDown: 5,
        description: "Premium Wallet Card with, k/M/B format",
        category: "economy"
    },

    onStart: async function ({ message, event, usersData, args }) {
        try {
            await fs.ensureDir(cacheDir);

            let uid = event.senderID;
            if (event.messageReply?.senderID) uid = event.messageReply.senderID;
            else if (Object.keys(event.mentions)[0]) uid = Object.keys(event.mentions)[0];
            else if (args[0] && !isNaN(args[0])) uid = args[0];

            const user = await usersData.get(uid);
            if (!user) return message.reply("User not found!");

            const buffer = await createPremiumCard(user, uid, user.money || 0, usersData);
            const filePath = path.join(cacheDir, `balance_${Date.now()}.png`);
            await fs.writeFile(filePath, buffer);

            await message.reply({
                body: `╔════✦Premium Wallet ════╗
        ${user.name}'s Card
╚═══════════════════╝`,
                attachment: fs.createReadStream(filePath)
            });

            setTimeout(() => fs.unlink(filePath).catch(() => { }), 20000);

        } catch (err) {
            console.error(err);
            message.reply("Error generating card!");
        }
    }
};

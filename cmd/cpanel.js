const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");
const si = require("systeminformation");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "cpanel",
    version: "3.1",
    author: "Azadx69x",//Author change korle tor marechudi 
    category: "info",
    guide: { en: "{pn} - Shows animated CPU Info Panel." }
  },

  onStart: async function ({ message }) {
    try {
      const cpu = await si.cpu();
      const temp = await si.cpuTemperature();
      const load = await si.currentLoad();
      const mem = await si.mem();
      const osInfo = await si.osInfo();
      
      const uptime = process.uptime() * 1000;
      const uptimeFormatted = formatUptime(uptime);
      
      const bdTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka"
      });

      const canvasWidth = 1000;
      const canvasHeight = 667;
      const outputPath = path.join(__dirname, "cache", `cpu_panel_${Date.now()}.gif`);

      await fs.ensureDir(path.dirname(outputPath));

      const encoder = new GIFEncoder(canvasWidth, canvasHeight);
      const gifStream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(gifStream);

      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(100);
      encoder.setQuality(10);

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      const frameCount = 20;

      for (let i = 0; i < frameCount; i++) {
        const hue = (i * 360 / frameCount) % 360;
        const glowColor = `hsl(${hue}, 100%, 70%)`;

        ctx.fillStyle = "#0a0f1a";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "28px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Nezuko panel 🌸", 25, 20);
        ctx.restore();
        
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(bdTime, canvasWidth - 25, 20);
        ctx.restore();

        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 20;

        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        drawCirclePanel(
          ctx,
          centerX,
          centerY,
          110,
          "Azadx69x",
          "Author",
          glowColor
        );

        const stats = [
          { label: "CORES", value: cpu.physicalCores },
          { label: "THREADS", value: cpu.cores },
          { label: "BASE CLK", value: `${cpu.speed} GHz` },
          { label: "MAX CLK", value: `${cpu.speedmax} GHz` },
          { label: "MIN CLK", value: `${cpu.speedmin} GHz` },
          { label: "TEMP", value: `${temp.main || 0} °C` },
          { label: "LOAD", value: `${load.currentLoad.toFixed(1)}%` },
          { label: "USER LOAD", value: `${load.currentLoadUser.toFixed(1)}%` },
          { label: "TOTAL RAM", value: `${(mem.total / 1e9).toFixed(1)} GB` },
          { label: "FREE RAM", value: `${(mem.available / 1e9).toFixed(1)} GB` },
          { label: "OS", value: osInfo.distro },
          { label: "UPTIME", value: uptimeFormatted }
        ];

        const radius = 240;

        stats.forEach((stat, idx) => {
          const angle = (Math.PI * 2 / stats.length) * idx;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          drawCirclePanel(ctx, x, y, 75, stat.label, stat.value, glowColor);
        });

        encoder.addFrame(ctx);
      }

      encoder.finish();
      await new Promise(res => gifStream.on("finish", res));

      await message.reply({ attachment: fs.createReadStream(outputPath) });

      fs.unlink(outputPath, () => {});
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to generate Cpanel.");
    }
  }
};


function formatUptime(ms) {
    if (ms <= 0) return "0s";

    let sec = Math.floor(ms / 1000);

    const days = Math.floor(sec / 86400);
    sec %= 86400;

    const hours = Math.floor(sec / 3600);
    sec %= 3600;

    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;

    const parts = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(" ");
}


function drawCirclePanel(ctx, x, y, radius, label, value, glow) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#111a25";
  ctx.fill();

  ctx.strokeStyle = glow;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  function fitText(baseSize, text, maxWidth, bold = false) {
    let size = baseSize;
    ctx.font = `${bold ? "bold" : ""} ${size}px Arial`;

    while (ctx.measureText(text).width > maxWidth && size > 6) {
      size--;
      ctx.font = `${bold ? "bold" : ""} ${size}px Arial`;
    }
    return size;
  }

  let valueSize = fitText(22, value, radius * 1.6, true);
  ctx.fillStyle = glow;
  ctx.font = `bold ${valueSize}px Arial`;
  ctx.fillText(value, x, y - 12);

  let labelSize = fitText(15, label, radius * 1.6);
  ctx.fillStyle = "#E5E7EB";
  ctx.font = `${labelSize}px Arial`;
  ctx.fillText(label, x, y + 20);
}

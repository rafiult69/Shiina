/**
 * @author NTKhang
 * ! The source code is written by NTKhang, please don't change the author's name everywhere. Thank you for using
 * ! Official source code: https://github.com/ntkhang03/Goat-Bot-V2
 * ! If you do not download the source code from the above address, you are using an unknown version and at risk of having your account hacked
 *
 * English:
 * ! Please do not change the below code, it is very important for the project.
 * It is my motivation to maintain and develop the project for free.
 * ! If you change it, you will be banned forever
 * Thank you for using
 *
 * Vietnamese:
 * ! Vui lòng không thay đổi mã bên dưới, nó rất quan trọng đối với dự án.
 * Nó là động lực để tôi duy trì và phát triển dự án miễn phí.
 * ! Nếu thay đổi nó, bạn sẽ bị cấm vĩnh viễn
 * Cảm ơn bạn đã sử dụng
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");

function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

startProject();

const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');

const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", async function (req, res) {
	res.sendFile(path.join(__dirname, "/yazky/goatbot.html"));
});

/** const { RsnChat } = require('rsnchat');

const rsnchat = new RsnChat('rsnai_C5Y6ZSoUt3LRAWopF6PQ2Uef');

app.get('/architecture', async (req, res) => {
		const query = req.query.ask;
		if (!query) {
				return res.status(400).json({ error: 'Your question is missing.' });
		}

		try {
				const response = await rsnchat.gpt(query);
				const jsonResponse = { architecture: response.message };
				res.json(jsonResponse);
		} catch (error) {
				res.status(500).json({ error: 'An error occurred: ' + error.message });
		}
}); **/

const os = require('os');

function formatUptime(seconds) {
	const months = Math.floor(seconds / (30 * 24 * 60 * 60)); 
	seconds %= (30 * 24 * 60 * 60);
	const days = Math.floor(seconds / (24 * 60 * 60)); 
	seconds %= (24 * 60 * 60);
	const hours = Math.floor(seconds / (60 * 60));
	seconds %= (60 * 60);
	const minutes = Math.floor(seconds / 60); 
	seconds = Math.floor(seconds % 60); 

	return `${months}mth ${days}d ${hours}h ${minutes}m ${seconds}s`; 
}

app.get('/uptime', (req, res) => {
	const uptimeData = {
		botUptime: formatUptime(process.uptime()),
		systemUptime: formatUptime(os.uptime()),
		cores: os.cpus().length,
		os: os.type(),
		arch: os.arch(),
		cpu: os.cpus()[0].model,
		loadAvg: os.loadavg().map(load => load.toFixed(2)),
		processMemory: `${(process.memoryUsage().rss / (1024 * 1024)).toFixed(2)} MB`,
	};

	res.json(uptimeData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

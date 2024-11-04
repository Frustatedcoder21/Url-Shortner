const express = require('express');
const app = express();
const path = require('path');
const tableSchema = require('./models/table');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

// Helper functions
async function generateUniqueUid() {
    const s = "abcdefghijklmnopqrstuvwxyz1234567890";
    let uid;
    let existingRecord;
    do {
        uid = "";
        for (let i = 1; i <= 6; i++) {
            uid += s.charAt(Math.floor(Math.random() * s.length));
        }
        existingRecord = await tableSchema.findOne({ uid });
    } while (existingRecord);
    return uid;
}

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/generate', async (req, res) => {
    let url = req.body.url;

    // Validate and normalize the URL
    if (!isValidUrl(url)) {
        return res.status(400).send("Invalid URL");
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}`;
    }

    try {
        const uid = await generateUniqueUid();

        // Save the record to the database
        let createdRecord = await tableSchema.create({ uid, url });
        
        // Send the shortened URL to the user
        res.status(201).json({ shortUrl: `http://localhost:3000/${uid}` });
    } catch (error) {
        console.error("Error creating record:", error);
        res.status(500).send("An error occurred while creating the record.");
    }
});

app.get('/:uid', async (req, res) => {
    try {
        // Find the record with the given uid
        let record = await tableSchema.findOne({ uid: req.params.uid });
        
        if (record) {
            res.redirect(record.url);
        } else {
            res.status(404).send("URL not found");
        }
    } catch (error) {
        console.error("Error finding record:", error);
        res.status(500).send("An error occurred while retrieving the URL.");
    }
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

const express = require('express');
const cors = require('cors');
const multer = require("multer");
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const PORT = 80;
// const PORT = 5000;
// const PORT = process.env.PORT || 3306;
const SECRET_KEY = 'suresh@123'; // Replace with a secure secret key

// app.use(cors());
// Enable CORS for specific origins


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
let users = [];

// Read user data from the JSON file
try {
    const data = fs.readFileSync('users.json');
    users = JSON.parse(data).users;
} catch (error) {
    console.error('Error reading users.json:', error);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the destination folder for uploads
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        );
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (adjust as needed)
});
// const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
    const imagePath = "/uploads/" + req.file.filename;
    const uploadDate = req.body.date || new Date().toISOString();

    // Save the image path and upload date to a JSON file
    const data = JSON.parse(fs.readFileSync("uploads.json", "utf-8"));
    data.push({ imagePath, uploadDate });
    fs.writeFileSync("uploads.json", JSON.stringify(data, null, 2));

    // Send a success response to the client
    res.status(200).json({ imagePath, uploadDate });
});


// Add the /upcomingEvents endpoint to fetch upcoming events
app.get('/upEvents', (req, res) => {
    // Read the JSON file containing events data
    const eventsData = require('./uploads.json'); // Adjust the path accordingly

    // Filter events based on date (considering only future events)
    const currentDate = new Date();
    const upcomingEvents = eventsData.filter((event) => new Date(event.uploadDate) > currentDate);

    res.json(upcomingEvents);
});

// Add the /upcomingEvents endpoint to fetch upcoming events
app.get('/pastEvents', (req, res) => {
    // Read the JSON file containing events data
    const eventsData = require('./uploads.json'); // Adjust the path accordingly

    // Filter events based on date (considering only future events)
    const currentDate = new Date();
    const upcomingEvents = eventsData.filter((event) => new Date(event.uploadDate) < currentDate);

    res.json(upcomingEvents);
});


app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    const adminUser = users.find(user => user.username === username && user.password === password && user.isAdmin);

    if (adminUser) {
        // Generate a JWT token
        const token = jwt.sign({ username, isAdmin: true }, SECRET_KEY);

        res.json({ message: 'Admin login successful!', token });
    } else {
        res.status(401).json({ message: 'Invalid admin credentials' });
    }
});

app.get('/data', (req, res) => {
    res.json({ message: 'Hello from the server!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

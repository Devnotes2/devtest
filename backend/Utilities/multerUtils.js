// multer.js (Utility file for configuring multer)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Disk storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get the subdomain part from the host (assuming format like "subdomain.domain.com")
        const subdomain = req.get('host').split('.')[0];
        const uploadDir = `uploads/${subdomain}`;

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Set the directory to store files
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use the memberId from the body or a default value
        const memberId = req.body.memberId || 'unknown';
        const extension = path.extname(file.originalname); // Get the file extension
        cb(null, `${memberId}-${Date.now()}${extension}`); // Add a timestamp to avoid filename conflicts
    }
});

// Create the multer upload middleware for a single file upload and export it
const upload = multer({ storage }).single('image');  // Single file upload, named 'image' in the request
module.exports = upload;

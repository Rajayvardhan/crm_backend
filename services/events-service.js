// utils/upload.js (or any file you prefer for storing configuration)
const multer = require('multer');

// Multer storage configuration to store the image in 'storage/images/profile/'
const storageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Multer Storage Engine');
        cb(null, './storage/events'); // Folder where images will be stored
    },
    filename: (req, file, cb) => {
        // Create a unique filename for each uploaded file
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname); // Filename format
    }
});

// File filter to only accept images (jpg, jpeg, png)
const fileFilter = (req, file, cb) => {
    if (!file) {
        cb(null, false); // If no file, reject the upload
    } else if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true); // Accept the file
    } else {
        cb(null, false); // Reject the file if it's not a valid image type
    }
};

// Configure multer to use the storage engine and file filter
const upload = multer({ storage: storageEngine, fileFilter });

module.exports = upload;

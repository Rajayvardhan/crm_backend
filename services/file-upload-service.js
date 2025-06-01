const multer = require('multer');

const storageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Multer Storage Engine');
        cb(null, './storage/images/profile/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (!file) {
        cb(null, false);
    } else if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage: storageEngine, fileFilter });

module.exports = upload;
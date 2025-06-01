const multer = require('multer');

// Excel files ke liye memory storage use karenge
const excelStorage = multer.memoryStorage();

const excelUpload = multer({ storage: excelStorage });

module.exports = excelUpload;
// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const prefix = file.mimetype === 'application/pdf' ? 'book' : 'photo';
        cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, png, webp, gif) and PDF documents are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB
    },
});

module.exports = upload;

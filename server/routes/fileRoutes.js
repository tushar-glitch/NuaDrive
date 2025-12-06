const express = require('express');
const multer = require('multer');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const pool = require('../db');
const s3Client = require('../s3Client');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

router.post('/upload', authMiddleware, upload.array('files'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const userId = req.user.id;
    const uploadedFiles = [];

    try {
        for (const file of req.files) {
            const fileExtension = file.originalname.split('.').pop();
            const r2Key = `${userId}/${crypto.randomUUID()}.${fileExtension}`;
            const fileUuid = crypto.randomUUID();
            
            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME,
                Key: r2Key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));

            const [result] = await pool.execute(
                'INSERT INTO files (user_id, filename, r2_key, file_type, size, uuid) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, file.originalname, r2Key, fileExtension, file.size, fileUuid]
            );

            uploadedFiles.push({
                id: result.insertId,
                uuid: fileUuid,
                name: file.originalname,
                size: file.size,
                date: new Date(),
                type: fileExtension
            });
        }

        res.status(201).json({ message: 'Files uploaded successfully', files: uploadedFiles });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload files' });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const [files] = await pool.execute(
            'SELECT id, uuid, filename as name, size, file_type as type, upload_date as date FROM files WHERE user_id = ? ORDER BY upload_date DESC',
            [req.user.id]
        );
        res.json(files);
    } catch (error) {
        console.error('Fetch Files Error:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

router.get('/:id/download', authMiddleware, async (req, res) => {
    try {
        const [files] = await pool.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        
        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];
        
        const command = new GetObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Key: file.r2_key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });     

        res.json({ downloadUrl: url });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate download link' });
    }
});

// Public Shared File Endpoint
router.get('/shared/:uuid', async (req, res) => {
    try {
        const [files] = await pool.execute(
            'SELECT filename as name, size, file_type as type, upload_date as date, r2_key FROM files WHERE uuid = ?', 
            [req.params.uuid]
        );
        
        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];
        
        const command = new GetObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Key: file.r2_key,
        });

        const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({
            name: file.name,
            size: file.size,
            type: file.type,
            date: file.date,
            downloadUrl
        });
    } catch (error) {
        console.error('Shared File Error:', error);
        res.status(500).json({ error: 'Failed to retrieve shared file' });
    }
});

// Invite User to File
router.post('/:id/share', authMiddleware, async (req, res) => {
    const { email } = req.body;
    const fileId = req.params.id;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Verify ownership
        const [files] = await pool.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, req.user.id]);
        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }

        // Add to shares table
        await pool.execute(
            'INSERT INTO shares (file_id, shared_with_email) VALUES (?, ?)',
            [fileId, email]
        );

        res.json({ message: `Invite sent to ${email}` });
    } catch (error) {
        console.error('Share Error:', error);
        res.status(500).json({ error: 'Failed to share file' });
    }
});

module.exports = router;

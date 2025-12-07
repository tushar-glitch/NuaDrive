const express = require('express');
const multer = require('multer');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const pool = require('../db');
const s3Client = require('../s3Client');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');
const zlib = require('zlib');

const router = express.Router();

// Smart Compression Configuration
const COMPRESSIBLE_MIME_TYPES = [
    'text/plain', 'text/html', 'text/css', 'text/javascript', 'text/csv', 'text/xml',
    'application/json', 'application/javascript', 'application/xml', 'application/x-yaml',
    'text/markdown', 'image/svg+xml',
    // User requested Images and PDFs
    'application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'
];

const IS_COMPRESSIBLE = (mime, ext) => {
    if (COMPRESSIBLE_MIME_TYPES.includes(mime)) return true;
    // Fallback for extensions
    const exts = [
        'txt', 'md', 'csv', 'json', 'log', 'js', 'jsx', 'ts', 'tsx', 'html', 
        'css', 'scss', 'xml', 'svg', 'sql',
        'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'
    ];
    if (exts.includes(ext.toLowerCase())) return true;
    return false;
};

// Helper: Log Activity
const logActivity = async (fileId, userId, action, details, req) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        await pool.execute(
            'INSERT INTO activity_logs (file_id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
            [fileId, userId, action, details, ip]
        );
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
};

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
            
            let bufferToUpload = file.buffer;
            let contentEncoding = undefined;
            const originalSize = file.size;

            // Smart Compression Logic
            if (IS_COMPRESSIBLE(file.mimetype, fileExtension)) {
                try {
                    const compressed = zlib.gzipSync(file.buffer);
                    // Only use compressed version if it actually saves space
                    if (compressed.length < originalSize) {
                        bufferToUpload = compressed;
                        contentEncoding = 'gzip';
                        console.log(`[Upload] Compressed ${file.originalname} (${originalSize} -> ${compressed.length} bytes)`);
                    }
                } catch (compErr) {
                    console.warn(`[Upload] Compression skipped for ${file.originalname}:`, compErr);
                }
            }
            
            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME,
                Key: r2Key,
                Body: bufferToUpload,
                ContentType: file.mimetype,
                ContentEncoding: contentEncoding, // Browser will auto-decompress if this is set
                Metadata: {
                    'original-size': String(originalSize)
                }
            }));

            const [result] = await pool.execute(
                'INSERT INTO files (user_id, filename, r2_key, file_type, size, uuid, public_token) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, file.originalname, r2Key, fileExtension, originalSize, fileUuid, fileUuid]
            );

            uploadedFiles.push({
                id: result.insertId,
                uuid: fileUuid,
                name: file.originalname,
                size: originalSize,
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
            'SELECT id, uuid, filename as name, size, file_type as type, upload_date as date, link_expires_at, public_token FROM files WHERE user_id = ? ORDER BY upload_date DESC',
            [req.user.id]
        );
        res.json(files);
    } catch (error) {
        console.error('Fetch Files Error:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Update File Settings (e.g., Link Expiry)
router.patch('/:id/settings', authMiddleware, async (req, res) => {
    const { linkExpiresAt } = req.body;
    const fileId = req.params.id;

    try {
        // Verify ownership
        const [files] = await pool.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, req.user.id]);
        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const expirationDate = linkExpiresAt ? new Date(linkExpiresAt) : null;

        await pool.execute(
            'UPDATE files SET link_expires_at = ? WHERE id = ?',
            [expirationDate, fileId]
        );

        // Log Activity
        await logActivity(fileId, req.user.id, 'update_settings', `Updated link expiry: ${expirationDate ? expirationDate.toISOString() : 'Never'}`, req);

        res.json({ message: 'File settings updated' });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ error: 'Failed to update file settings' });
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

// --- PROTECTED ROUTES (Owner/Invited Only, No Expiry) ---

// Protected: Content Proxy
router.get('/protected/:uuid/content', authMiddleware, async (req, res) => {
    try {
        const [files] = await pool.execute(
            `SELECT f.filename, f.r2_key, f.file_type 
             FROM files f
             LEFT JOIN shares s ON f.id = s.file_id AND s.shared_with_email = ?
             WHERE f.uuid = ? AND (f.user_id = ? OR s.id IS NOT NULL)`,
            [req.user.email, req.params.uuid, req.user.id]
        );
        
        if (files.length === 0) {
            return res.status(403).json({ error: 'Access denied or file not found' });
        }

        const file = files[0];
        const command = new GetObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: file.r2_key });
        const data = await s3Client.send(command);
        
        if (file.file_type === 'csv') res.setHeader('Content-Type', 'text/csv');
        if (file.file_type === 'json') res.setHeader('Content-Type', 'application/json');
        
        data.Body.pipe(res);
    } catch (error) {
        console.error('Protected Content Error:', error);
        res.status(500).json({ error: 'Failed to retrieve file content' });
    }
});

// Protected: Metadata & Links
router.get('/protected/:uuid', authMiddleware, async (req, res) => {
    try {
        console.log(`[Debug] Accessing Protected: UUID=${req.params.uuid}, User=${req.user.email} (${req.user.id})`);
        
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        
        const [files] = await pool.execute(
            `SELECT f.id, f.filename as name, f.size, f.file_type as type, f.upload_date as date, f.r2_key, f.link_expires_at, f.public_token,
                    s.id as share_id, s.shared_with_email
             FROM files f
             LEFT JOIN shares s ON f.id = s.file_id AND s.shared_with_email = ?
             WHERE f.uuid = ? AND (f.user_id = ? OR s.id IS NOT NULL)`,
            [req.user.email, req.params.uuid, req.user.id]
        );
        
        console.log(`[Debug] Query Result Count: ${files.length}`);
        if (files.length > 0) {
            console.log(`[Debug] Access Granted. ShareID: ${files[0].share_id}`);
        } else {
            // Debugging why it failed - Check if file exists at all
            const [check] = await pool.execute('SELECT id, user_id FROM files WHERE uuid = ?', [req.params.uuid]);
            if (check.length > 0) {
                console.log(`[Debug] File exists (Owner: ${check[0].user_id}). Requesting User: ${req.user.id}. Share missing?`);
            } else {
                console.log('[Debug] File UUID not found in DB.');
            }
        }
        
        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }

        const file = files[0];
        
        // Log Activity
        await logActivity(file.id, req.user.id, 'view', 'Owner/Invited Access', req);
        
        const previewCommand = new GetObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME, Key: file.r2_key,
            ResponseContentDisposition: `inline; filename="${file.name}"`,
        });
        const previewUrl = await getSignedUrl(s3Client, previewCommand, { expiresIn: 3600 });

        res.json({
            name: file.name,
            size: file.size,
            type: file.type,
            date: file.date,
            link_expires_at: file.link_expires_at,
            public_token: file.public_token,
            previewUrl
        });
    } catch (error) {
        console.error('Protected File Error:', error);
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});

// Protected: Download Endpoint (Logs Activity + Redirects)
router.get('/protected/:uuid/download', authMiddleware, async (req, res) => {
    try {
        const [files] = await pool.execute(
            `SELECT f.id, f.filename as name, f.r2_key, f.file_type 
             FROM files f
             LEFT JOIN shares s ON f.id = s.file_id AND s.shared_with_email = ?
             WHERE f.uuid = ? AND (f.user_id = ? OR s.id IS NOT NULL)`,
            [req.user.email, req.params.uuid, req.user.id]
        );

        if (files.length === 0) return res.status(404).json({ error: 'File not found' });
        const file = files[0];

        // Log Activity
        await logActivity(file.id, req.user.id, 'download', 'Owner/Invited Download', req);

        // Redirect to S3
        const command = new GetObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Key: file.r2_key,
            ResponseContentDisposition: `attachment; filename="${file.name}"`,
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        res.redirect(url);
    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});


// --- PUBLIC ROUTES (Share Link Only, Enforces Expiry) ---
// Note: Keeping authMiddleware to align with previous "Logged In Users Only" restriction.
// To make truly public, remove authMiddleware from these two.

// Public: Content Proxy
router.get('/public/:token/content', authMiddleware, async (req, res) => {
    try {
        const [files] = await pool.execute(
            'SELECT filename, r2_key, file_type, link_expires_at FROM files WHERE public_token = ?', 
            [req.params.token]
        );
        
        if (files.length === 0) return res.status(404).json({ error: 'File not found' });
        const file = files[0];

        if (file.link_expires_at && new Date() > new Date(file.link_expires_at)) {
            return res.status(410).json({ error: 'This link has expired' });
        }

        const command = new GetObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: file.r2_key });
        const data = await s3Client.send(command);
        
        if (file.file_type === 'csv') res.setHeader('Content-Type', 'text/csv');
        if (file.file_type === 'json') res.setHeader('Content-Type', 'application/json');
        
        data.Body.pipe(res);
    } catch (error) {
        console.error('Public Content Error:', error);
        res.status(500).json({ error: 'Failed to retrieve content' });
    }
});

// Public: Download Endpoint (Logs Activity + Redirects)
router.get('/public/:token/download', authMiddleware, async (req, res) => {
    try {
        const [files] = await pool.execute(
            'SELECT id, filename as name, r2_key, link_expires_at FROM files WHERE public_token = ?', 
            [req.params.token]
        );
        
        if (files.length === 0) return res.status(404).json({ error: 'File not found' });
        const file = files[0];

        if (file.link_expires_at && new Date() > new Date(file.link_expires_at)) {
            return res.status(410).json({ error: 'This link has expired' });
        }

        // Log Activity
        await logActivity(file.id, req.user ? req.user.id : null, 'download', 'Public Link Download', req);

        // Redirect to S3
        const command = new GetObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Key: file.r2_key,
            ResponseContentDisposition: `attachment; filename="${file.name}"`,
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        res.redirect(url);
    } catch (error) {
        console.error('Public Download Error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Public: Metadata & Links
router.get('/public/:token', authMiddleware, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        
        const [files] = await pool.execute(
            'SELECT id, filename as name, size, file_type as type, upload_date as date, r2_key, link_expires_at FROM files WHERE public_token = ?', 
            [req.params.token]
        );
        
        if (files.length === 0) return res.status(404).json({ error: 'File not found' });
        const file = files[0];

        // ENFORCE EXPIRY HERE
        if (file.link_expires_at && new Date() > new Date(file.link_expires_at)) {
            return res.status(410).json({ error: 'This link has expired' });
        }
        
        // Log Activity
        await logActivity(file.id, req.user ? req.user.id : null, 'view', 'Public Link Access', req);
        
        const previewCommand = new GetObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME, Key: file.r2_key,
            ResponseContentDisposition: `inline; filename="${file.name}"`,
        });
        const previewUrl = await getSignedUrl(s3Client, previewCommand, { expiresIn: 3600 });

        res.json({
            name: file.name,
            size: file.size,
            type: file.type,
            date: file.date,
            previewUrl
        });
    } catch (error) {
        console.error('Public File Error:', error);
        res.status(500).json({ error: 'Failed to fetch public file' });
    }
});



// LIST FILES SHARED WITH ME
router.get('/shared-with-me', authMiddleware, async (req, res) => {
    try {
        const [files] = await pool.execute(
            `SELECT f.id, f.uuid, f.filename as name, f.size, f.file_type as type, f.upload_date as date, u.name as owner 
             FROM shares s
             JOIN files f ON s.file_id = f.id
             JOIN users u ON f.user_id = u.id
             WHERE s.shared_with_email = ? 
             AND (s.expires_at IS NULL OR s.expires_at > NOW())
             ORDER BY s.created_at DESC`,
            [req.user.email]
        );
        res.json(files);
    } catch (error) {
        console.error('Shared List Error:', error);
        res.status(500).json({ error: 'Failed to fetch shared files' });
    }
});

router.post('/:id/share', authMiddleware, async (req, res) => {
    const { email } = req.body;
    const fileId = req.params.id;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (email === req.user.email) {
        return res.status(400).json({ error: 'You cannot share a file with yourself' });
    }

    try {
        // Verify ownership
        const [files] = await pool.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, req.user.id]);
        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }

        // Add to shares table
        // We set expires_at: null because UI removed support, but DB has it.
        await pool.execute(
            'INSERT INTO shares (file_id, shared_with_email, expires_at) VALUES (?, ?, ?)',
            [fileId, email, null]
        );

        // Log Activity
        await logActivity(fileId, req.user.id, 'share', `Invited ${email}`, req);

        res.json({ message: `Invite sent to ${email}` });
    } catch (error) {
        console.error('Share Error:', error);
        res.status(500).json({ error: 'Failed to share file' });
    }
});

// GET Activity Logs
router.get('/:id/activity', authMiddleware, async (req, res) => {
    const fileId = req.params.id;
    try {
         // Verify ownership (Only owner can see logs)
        const [files] = await pool.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, req.user.id]);
        if (files.length === 0) return res.status(403).json({ error: 'Access denied' });

        const [logs] = await pool.execute(
            `SELECT a.id, a.action, a.details, a.created_at, u.name as user_name, u.email as user_email
             FROM activity_logs a
             LEFT JOIN users u ON a.user_id = u.id
             WHERE a.file_id = ?
             ORDER BY a.created_at DESC`,
            [fileId]
        );
        res.json(logs);
    } catch (error) {
        console.error('Activity Log Error:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

module.exports = router;

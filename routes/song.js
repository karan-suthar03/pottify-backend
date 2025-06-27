const express = require('express');
const router = express.Router();
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

// GET /api/song/:id/audio-url
router.get('/:id/audio-url', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ error: 'Invalid song id' });
    }
    const isValidId = /^[a-zA-Z0-9_-]+$/.test(id);
    if (!isValidId) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Download folder and file path
    const downloadsDir = path.join(__dirname, '../downloads');
    const filePath = path.join(downloadsDir, `${id}.mp3`);
    const fileUrl = `/downloads/${id}.mp3`;

    // If file already exists, return its URL
    if (fs.existsSync(filePath)) {
      return res.status(200).json({ audioUrl: fileUrl });
    }

    // Download from YouTube
    const stream = ytdl(id, { filter: 'audioonly', quality: 'highestaudio' });
    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    writeStream.on('finish', () => {
      return res.status(200).json({ audioUrl: fileUrl });
    });
    writeStream.on('error', (err) => {
      console.error('File write error:', err);
      return res.status(500).json({ error: 'Failed to save audio file' });
    });
  } catch (err) {
    console.error('Audio URL error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/song/:id/url
router.get('/:id/url', async (req, res) => {
  try {
    // const { id } = req.params;
    // if (!id || typeof id !== 'string' || !id.trim()) {
    //   return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid song id', details: {} });
    // }
    // const isValidId = /^[a-zA-Z0-9_-]+$/.test(id);
    // if (!isValidId) {
    //   return res.status(404).json({ code: 'NOT_FOUND', message: 'Song not found', details: {} });
    // }

    // const downloadsDir = path.join(__dirname, '../downloads');
    // const filePath = path.join(downloadsDir, `${id}.mp3`);
    // const fileUrl = `/downloads/${id}.mp3`;
    // const fullUrl = req.protocol + '://' + req.get('host') + fileUrl;

    // // If file already exists, return its URL
    // if (fs.existsSync(filePath)) {
    //   return res.status(200).json({
    //     data: { url: fullUrl },
    //     message: 'MP3 URL fetched successfully'
    //   });
    // }

    // // Download from YouTube
    // const stream = ytdl(id, { filter: 'audioonly', quality: 'highestaudio' });
    // const writeStream = fs.createWriteStream(filePath);
    // stream.pipe(writeStream);

    // writeStream.on('finish', () => {
    //   return res.status(200).json({
    //     data: { url: fullUrl },
    //     message: 'MP3 URL fetched successfully'
    //   });
    // });
    // writeStream.on('error', (err) => {
    //   console.error('File write error:', err);
    //   return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to save audio file', details: {} });
    // });
    return res.status(200).json({
        data: { url: "https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3"},
        message: 'MP3 URL fetched successfully'
    })
  } catch (err) {
    console.error('Audio URL error:', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error', details: {} });
  }
});

module.exports = router;

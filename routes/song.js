const express = require('express');
const router = express.Router();
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const {addSongToDatabase, getSongFromDatabase} = require("../database/databaseManager");
const {uploadFileToSupabase} = require("../services/supabaseStorageService");

// GET /api/song/:id/url
router.get('/:id/url', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid song id', details: {} });
    }
    const isValidId = /^[a-zA-Z0-9_-]+$/.test(id);
    if (!isValidId) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Song not found', details: {} });
    }

    let data = await getSongFromDatabase(id);
    console.log('Fetched song data:', data);
    if (data) {
      return res.status(200).json({
        data: { url: data.url },
        message: 'MP3 URL fetched successfully'
      });
    }



    const downloadsDir = path.join(__dirname, '../downloads');
    const filePath = path.join(downloadsDir, `${id}.mp3`);

    // Download from YouTube
    const stream = ytdl(id, { filter: 'audioonly', quality: 'highestaudio' });
    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    writeStream.on('finish', async () => {
      let url = await uploadFileToSupabase(filePath);
      if (!url) {
          console.error('Failed to upload file to Supabase');
          return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to upload audio file', details: {} });
      }
      addSongToDatabase(id,url).then(() => {
          console.log('Song added to database successfully')
      }).catch((err) => {
          console.error('Error adding song to database:', err);
      })
      // Clean up the downloaded file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully');
        }
      });
      return res.status(200).json({
          data: { url: url },
          message: 'MP3 URL fetched successfully'
      })

    });
    writeStream.on('error', (err) => {
      console.error('File write error:', err);
      return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to save audio file', details: {} });
    });

  } catch (err) {
    console.error('Audio URL error:', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error', details: {} });
  }
});

module.exports = router;

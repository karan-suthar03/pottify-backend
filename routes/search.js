const express = require('express');
const ytSearch = require('yt-search');

const router = express.Router();

// GET /api/search
router.get('/', async (req, res) => {
  try {
    let { q, limit = 20, offset = 0 } = req.query;

    // Validate 'q' parameter
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.status(400).json({ error: 'Missing required parameter: q' });
    }

    // Validate limit and offset
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ error: 'Invalid offset parameter' });
    }

    q = q + ' song';

    // Perform YouTube search
    const searchResult = await ytSearch(q);
    const videos = searchResult.videos || [];

    // Paginate results
    const paginated = videos.slice(parsedOffset, parsedOffset + parsedLimit);
    console.log(`Search results for "${q}":`, paginated.length, 'videos found');

    // Map to API response format
    const results = paginated.map(video => ({
      id: video.videoId,
      title: video.title,
      artist: video.author.name,
      imageUrl: video.image,
      duration: video.timestamp // e.g. '3:45'
    }));
    console.log(`Returning ${results.length} results for query "${q}"`);

    return res.json({ results });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

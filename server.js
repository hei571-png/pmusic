const express = require('express');
const cors = require('cors');
const path = require('path');
const yts = require('yt-search');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Search YouTube videos
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const results = await yts(q);
    
    const videos = results.videos.slice(0, 20).map(video => ({
      id: video.videoId,
      title: video.title,
      artist: video.author.name,
      channelId: video.author.channelId,
      duration: video.duration,
      thumbnail: video.thumbnail,
      url: video.url
    }));

    res.json({ videos });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get video details
app.get('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await yts({ videoId: id });
    
    if (!result || !result.videos || result.videos.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = result.videos[0];
    res.json({
      id: video.videoId,
      title: video.title,
      artist: video.author.name,
      duration: video.duration,
      thumbnail: video.thumbnail
    });
  } catch (error) {
    console.error('Video fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Get trending videos - most streamed music
app.get('/api/trending', async (req, res) => {
  try {
    const results = await yts('most streamed songs 2025');
    
    const videos = results.videos.slice(0, 16).map(video => ({
      id: video.videoId,
      title: video.title,
      artist: video.author?.name || 'Unknown',
      duration: video.duration,
      thumbnail: video.thumbnail,
      url: video.url
    }));

    res.json({ videos });
  } catch (error) {
    console.error('Trending fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// Get related videos
app.get('/api/related/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const videoResult = await yts({ videoId: id });
    if (!videoResult || !videoResult.videos || videoResult.videos.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const video = videoResult.videos[0];
    const artistName = video.author?.name || 'music';
    const searchQuery = `${artistName} music`;
    
    const relatedResults = await yts(searchQuery);
    
    const videos = relatedResults.videos
      .filter(v => v.videoId !== id)
      .slice(0, 10)
      .map(v => ({
        id: v.videoId,
        title: v.title,
        artist: v.author?.name || 'Unknown',
        duration: v.duration,
        thumbnail: v.thumbnail,
        url: v.url
      }));

    res.json({ videos });
  } catch (error) {
    console.error('Related fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch related videos' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

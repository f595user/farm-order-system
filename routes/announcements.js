const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { ensureAdmin } = require('../middleware/auth');

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    let query = Announcement.find().sort({ postDate: -1 }); // Sort by postDate in descending order (newest first)
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const announcements = await query;
    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error while fetching announcements' });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get announcement by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json(announcement);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Server error while fetching announcement' });
  }
});

// @route   POST /api/announcements
// @desc    Create a new announcement
// @access  Private (Admin only)
router.post('/', ensureAdmin, async (req, res) => {
  try {
    const { title, content, postDate } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const newAnnouncement = new Announcement({
      title,
      content,
      postDate: postDate || Date.now()
    });
    
    const announcement = await newAnnouncement.save();
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error while creating announcement' });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update an announcement
// @access  Private (Admin only)
router.put('/:id', ensureAdmin, async (req, res) => {
  try {
    const { title, content, postDate } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    announcement.title = title;
    announcement.content = content;
    if (postDate) {
      announcement.postDate = postDate;
    }
    
    const updatedAnnouncement = await announcement.save();
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error while updating announcement' });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Admin only)
router.delete('/:id', ensureAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    await announcement.remove();
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error while deleting announcement' });
  }
});

module.exports = router;

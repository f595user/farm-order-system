import React, { useState, useEffect } from 'react';
import API from '../../../../utils/api';

const AnnouncementModal = ({ announcement, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postDate: new Date().toISOString().split('T')[0] // Default to today's date in YYYY-MM-DD format
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // If editing an existing announcement, populate the form
    if (announcement) {
      const postDate = announcement.postDate 
        ? new Date(announcement.postDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
        
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        postDate
      });
    }
  }, [announcement]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('タイトルと内容は必須です。');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert postDate string to Date object
      const announcementData = {
        ...formData,
        postDate: new Date(formData.postDate)
      };
      
      await onSave(announcementData);
      onClose();
    } catch (err) {
      console.error('Save announcement error:', err);
      setError(err.message || 'お知らせの保存中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{announcement ? 'お知らせを編集' : '新しいお知らせを作成'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">タイトル</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="お知らせのタイトル"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="postDate">投稿日</label>
              <input
                type="date"
                id="postDate"
                name="postDate"
                value={formData.postDate}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="content">内容</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                placeholder="お知らせの内容"
                className="form-control"
                rows="6"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                キャンセル
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;

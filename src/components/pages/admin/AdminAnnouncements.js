import React, { useState, useEffect } from 'react';
import API from '../../../utils/api';

const AdminAnnouncements = ({ 
  announcements, 
  onAddAnnouncement, 
  onEditAnnouncement, 
  onDeleteAnnouncement 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('このお知らせを削除してもよろしいですか？')) {
      return;
    }
    
    try {
      setLoading(true);
      await onDeleteAnnouncement(id);
    } catch (error) {
      console.error('Delete announcement error:', error);
      setError('お知らせの削除に失敗しました。');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-announcements">
      <div className="admin-section-header">
        <h3>投稿管理</h3>
        <button 
          className="btn btn-primary" 
          onClick={onAddAnnouncement}
          disabled={loading}
        >
          新規投稿作成
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>読み込み中...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="no-data-message">
          <p>投稿はまだありません。</p>
        </div>
      ) : (
        <div className="announcements-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>タイトル</th>
                <th>投稿日</th>
                <th>作成日</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map(announcement => (
                <tr key={announcement._id}>
                  <td>{announcement.title}</td>
                  <td>{formatDate(announcement.postDate)}</td>
                  <td>{formatDate(announcement.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => onEditAnnouncement(announcement._id)}
                        disabled={loading}
                      >
                        編集
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(announcement._id)}
                        disabled={loading}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h2>404 - ページが見つかりません</h2>
      <p>お探しのページは存在しないか、移動した可能性があります。</p>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary">
          ホームに戻る
        </Link>
        <Link to="/products" className="btn">
          商品一覧を見る
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

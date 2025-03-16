import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ロマンス農園</h3>
            <p>苫小牧から新鮮なアスパラをお届け</p>
          </div>
          <div className="footer-section">
            <h3>リンク</h3>
            <ul>
              <li><Link to="/">ホーム</Link></li>
              <li><Link to="/products">商品一覧</Link></li>
              <li><Link to="/order">注文方法</Link></li>
              <li><Link to="/contact">お問い合わせ</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>お問い合わせ</h3>
            <p>住所　: 北海道苫小牧市樽前90</p>
            <p>メール: info@farm-direct.jp</p>
            <p>電話　: 03-1234-5678</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} RomanceFarm. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

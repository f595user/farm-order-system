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
            <h3>SNS Account</h3>
              <div className="social-icons">
                <a 
                  href="https://www.facebook.com/profile.php?id=100057231948484" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-icon-link"
                >
                  <i className="fab fa-facebook-square"></i>
                </a>
                <a 
                  href="https://www.instagram.com/romancefarm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-icon-link"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
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
            <p><i className="fas fa-map-marker-alt"></i> 〒059-1265 北海道苫小牧市樽前90</p>
            <p><i className="fas fa-clock"></i> 営業時間: 10:00〜16:00（シーズン無休）</p>
            <p><i className="fas fa-phone"></i> 0144-XX-XXXX</p>
            <p><i className="fas fa-envelope"></i> info@example.com</p>
            <div className="footer-social">
              
            </div>
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

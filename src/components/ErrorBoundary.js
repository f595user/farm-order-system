import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });

    // If we're in the logout process and encounter an error, force a page reload
    if (window.isLoggingOut) {
      console.log('Error during logout process, forcing page reload');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  }

  handleReset = () => {
    // Reset the error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Navigate to home page
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="error-boundary">
          <h2>エラーが発生しました</h2>
          <p>申し訳ありませんが、予期しないエラーが発生しました。</p>
          <button 
            onClick={this.handleReset}
            className="btn btn-primary"
          >
            ホームページに戻る
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
              <summary>エラーの詳細 (開発モードのみ)</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <p>コンポーネントスタック:</p>
              <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
            </details>
          )}
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;

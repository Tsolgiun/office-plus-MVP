import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';

// Import Ant Design styles
import 'antd/dist/reset.css';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Red Hat Display';
    src: url('/src/assets/fonts/Red_Hat_Display/RedHatDisplay-VariableFont_wght.ttf') format('truetype');
    font-weight: 100 900;
    font-style: normal;
  }

  @font-face {
    font-family: 'Noto Sans SC';
    src: url('/src/assets/fonts/Noto_Sans_SC/NotoSansSC-Regular.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'Noto Sans SC';
    src: url('/src/assets/fonts/Noto_Sans_SC/NotoSansSC-Bold.otf') format('opentype');
    font-weight: bold;
    font-style: normal;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Red Hat Display', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                 Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  .ant-layout {
    background: #f0f2f5;
  }

  .ant-layout-header {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  .ant-menu-item.ant-menu-item-selected {
    font-weight: 500;
  }

  .ant-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
`;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);


import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './views/Home';
import SendPage from './views/SendPage'; // Tetap ada untuk Backward Compatibility
import InboxPage from './views/InboxPage';
import DetailPage from './views/DetailPage';
import RepliesPage from './views/RepliesPage';
import ProfilePage from './views/ProfilePage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/u/:username" element={<ProfilePage />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/read" element={<InboxPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/replies" element={<RepliesPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;

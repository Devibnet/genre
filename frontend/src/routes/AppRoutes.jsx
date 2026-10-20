import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from '../pages/public/Home';
import Articles from '../pages/public/Articles';
import ArticleDetail from '../pages/public/ArticleDetail';
import News from '../pages/public/News';
import NewsDetail from '../pages/public/NewsDetail';
import Quizzes from '../pages/public/Quizzes';
import QuizDetail from '../pages/public/QuizDetail';
import Gallery from '../pages/public/Gallery';
import Counselors from '../pages/public/Counselors';
import Contact from '../pages/public/Contact';

import PublicLayout from '../components/layout/PublicLayout';

// Admin Pages
import Login from '../pages/admin/Login';
import Dashboard from '../pages/admin/Dashboard';
import AdminArticles from '../pages/admin/AdminArticles';
import AdminNews from '../pages/admin/AdminNews';
import AdminQuizzes from '../pages/admin/AdminQuizzes';
import AdminQuizQuestions from '../pages/admin/AdminQuizQuestions';
import AdminQuizResults from '../pages/admin/AdminQuizResults';
import AdminCounselors from '../pages/admin/AdminCounselors';
import AdminGallery from '../pages/admin/AdminGallery';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminCounseling from '../pages/admin/AdminCounseling';
import AdminFeedback from '../pages/admin/AdminFeedback';

// Route Guard
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/edukasi" element={<Articles />} />
        <Route path="/edukasi/:slug" element={<ArticleDetail />} />
        <Route path="/berita" element={<News />} />
        <Route path="/berita/:slug" element={<NewsDetail />} />
        <Route path="/quiz" element={<Quizzes />} />
        <Route path="/quiz/:id" element={<QuizDetail />} />
        <Route path="/galeri" element={<Gallery />} />
        <Route path="/konselor" element={<Counselors />} />
        <Route path="/kontak" element={<Contact />} />
      </Route>

      {/* Admin Auth Route */}
      <Route path="/admin/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="quizzes/:id/questions" element={<AdminQuizQuestions />} />
        <Route path="quizzes/:id/results" element={<AdminQuizResults />} />
        <Route path="counselors" element={<AdminCounselors />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="counseling" element={<AdminCounseling />} />
        <Route path="feedback" element={<AdminFeedback />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

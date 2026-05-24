import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import UserProfilePage from './pages/UserProfilePage';
import AddListingPage from './pages/AddListingPage';
import EditListingPage from './pages/EditListingPage';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import FAQPage from './pages/FAQPage';
import SafetyRulesPage from './pages/SafetyRulesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import AboutUsPage from './pages/AboutUsPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminListingsPage from './pages/AdminListingsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="add-listing" element={<AddListingPage />} />
        <Route path="edit-listing/:slug" element={<EditListingPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:sellerId" element={<ChatPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="safety" element={<SafetyRulesPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="terms" element={<TermsOfUsePage />} />
        <Route path="about" element={<AboutUsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="listings" element={<AdminListingsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;

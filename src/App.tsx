import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Contacts } from './pages/Contacts';
import { ContactDetail } from './pages/ContactDetail';
import { Waitlist } from './pages/Waitlist';
import { WaitlistDetail } from './pages/WaitlistDetail';
import { VendorSignups } from './pages/VendorSignups';
import { VendorSignupDetail } from './pages/VendorSignupDetail';
import { BusinessCategories } from './pages/BusinessCategories';
import { CreateBusinessCategory } from './pages/CreateBusinessCategory';
import { BusinessCategoryDetail } from './pages/BusinessCategoryDetail';
import { ProductCategories } from './pages/ProductCategories';
import { CreateProductCategory } from './pages/CreateProductCategory';
import { ProductCategoryDetail } from './pages/ProductCategoryDetail';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import { useAuthCheck } from './hooks/useAuthCheck';

function App() {
  const { initializeAuth } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Use the auth check hook to monitor token expiry
  useAuthCheck();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          <Route path="waitlist" element={<Waitlist />} />
          <Route path="waitlist/:id" element={<WaitlistDetail />} />
          <Route path="vendor-signups" element={<VendorSignups />} />
          <Route path="vendor-signups/:id" element={<VendorSignupDetail />} />
          <Route path="business-categories" element={<BusinessCategories />} />
          <Route path="business-categories/create" element={<CreateBusinessCategory />} />
          <Route path="business-categories/:id" element={<BusinessCategoryDetail />} />
          <Route path="product-categories" element={<ProductCategories />} />
          <Route path="product-categories/create" element={<CreateProductCategory />} />
          <Route path="product-categories/:id" element={<ProductCategoryDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

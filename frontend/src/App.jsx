import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Collection from "./pages/Collection";
import BookDetails from "./pages/BookDetails";
import Community from "./pages/Community";
import CommunityBookDetails from "./pages/CommunityBookDetails";
import Genres from "./pages/Genres";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyLibrary from "./pages/MyLibrary";
import Admin from "./pages/Admin";
import AdminSetup from "./pages/AdminSetup";
import AccountInfo from "./pages/AccountInfo";
import MyReviews from "./pages/MyReviews";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";

function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/:id" element={<CommunityBookDetails />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/my-library"
              element={
                <ProtectedRoute>
                  <MyLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/reviews"
              element={
                <ProtectedRoute>
                  <MyReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;

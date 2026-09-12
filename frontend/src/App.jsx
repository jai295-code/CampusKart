import { Link, Route, Routes } from 'react-router-dom';

import EmptyState from './components/EmptyState';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { SearchIcon } from './components/icons';
import CreateListing from './pages/CreateListing';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import MyListings from './pages/MyListings';
import Signup from './pages/Signup';

export default function App() {
  // The page tint and text colour live on `body` in index.css, so the shell only
  // owns layout: a sensible reading width and vertical rhythm.
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <EmptyState
                className="mx-auto max-w-lg"
                icon={<SearchIcon className="h-6 w-6" />}
                title="Page not found"
                description="That link does not lead anywhere. The listing may have been removed."
                action={
                  <Link to="/" className="btn btn-primary">
                    Back to listings
                  </Link>
                }
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { firstNameOf, initialOf } from '../ui';
import { LogoMark, PlusIcon } from './icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3"
      >
        <Link
          to="/"
          className="focus-ring flex items-center gap-2 rounded-xl"
          aria-label="CampusKart home"
        >
          <LogoMark className="h-9 w-9" />
          <span className="bg-linear-to-r from-brand-600 to-violet-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent sm:text-lg">
            CampusKart
          </span>
        </Link>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3">
          {/* Label collapses away below sm so the row never wraps mid-button. */}
          <Link to="/post" className="btn btn-gradient px-3 py-2 sm:px-4 sm:py-2.5">
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Post item</span>
            <span className="sr-only sm:hidden">Post item</span>
          </Link>

          {user ? (
            <>
              <span className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pr-1 pl-1 sm:pr-3">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-violet-600 text-xs font-bold text-white"
                >
                  {initialOf(user.name)}
                </span>
                <span className="hidden max-w-24 truncate text-xs font-semibold text-slate-700 sm:inline">
                  {firstNameOf(user.name)}
                </span>
              </span>

              <Link
                to="/my-listings"
                className="focus-ring rounded-lg px-1 py-1 text-xs font-semibold text-slate-700 transition hover:text-brand-700 sm:px-2 sm:text-sm"
              >
                My listings
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="focus-ring rounded-lg px-1 py-1 text-xs font-medium text-slate-500 transition hover:text-slate-800 sm:px-2 sm:text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="focus-ring rounded-lg px-1 py-1 text-xs font-semibold text-slate-700 transition hover:text-brand-700 sm:px-2 sm:text-sm"
              >
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm sm:px-4 sm:py-2 sm:text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

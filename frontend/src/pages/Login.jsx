import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { LockIcon, LogoMark, MailIcon, Spinner } from '../components/icons';
import { errorMessage } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err, 'Could not log you in'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-4 sm:py-8">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 bg-linear-to-r from-brand-600 to-violet-600 px-5 py-5 sm:px-7">
          <LogoMark variant="plain" className="h-11 w-11" iconClassName="h-6 w-6" />
          <div>
            <h1 className="text-lg font-bold text-white sm:text-xl">Welcome back</h1>
            <p className="text-xs text-brand-100 sm:text-sm">Log in to post and manage listings.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Email
            </label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@college.edu"
                className="field pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Password
            </label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="field pl-11"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="alert-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn btn-gradient w-full py-3">
            {submitting && <Spinner />}
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 text-center text-sm text-slate-600 sm:px-7">
          New to CampusKart?{' '}
          <Link to="/signup" className="link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

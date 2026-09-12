import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { LockIcon, LogoMark, MailIcon, PhoneIcon, PinIcon, Spinner, UserIcon } from '../components/icons';
import { errorMessage } from '../constants';
import { useAuth } from '../context/AuthContext';

const EMPTY = { name: '', email: '', password: '', hostel: '', phone: '' };

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fields, setFields] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(key) {
    return (event) => setFields((prev) => ({ ...prev, [key]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(fields);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err, 'Could not create your account'));
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
            <h1 className="text-lg font-bold text-white sm:text-xl">Join CampusKart</h1>
            <p className="text-xs text-brand-100 sm:text-sm">
              Buy and sell within your campus. Deals happen in person.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7" noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Name
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="name"
                type="text"
                value={fields.name}
                onChange={update('name')}
                autoComplete="name"
                className="field pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Email
            </label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                value={fields.email}
                onChange={update('email')}
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
                value={fields.password}
                onChange={update('password')}
                autoComplete="new-password"
                className="field pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="hostel" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Hostel
            </label>
            <div className="relative">
              <PinIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="hostel"
                type="text"
                value={fields.hostel}
                onChange={update('hostel')}
                placeholder="e.g. Ganga"
                className="field pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Mobile number
            </label>
            <div className="relative">
              <PhoneIcon className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="phone"
                type="tel"
                value={fields.phone}
                onChange={update('phone')}
                placeholder="+919876543210"
                aria-describedby="phone-help"
                autoComplete="tel"
                className="field pl-11"
              />
            </div>
            <p id="phone-help" className="mt-1.5 text-xs text-slate-500">
              Include your country code, otherwise the WhatsApp link will not resolve.
            </p>
          </div>

          {error && (
            <p role="alert" className="alert-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn btn-gradient w-full py-3">
            {submitting && <Spinner />}
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 text-center text-sm text-slate-600 sm:px-7">
          Already have an account?{' '}
          <Link to="/login" className="link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

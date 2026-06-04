import { Link } from 'react-router-dom';
import NestlyLogo from '../components/layout/NestlyLogo';

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-[#FBF8F4] dark:bg-[#111110] flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <NestlyLogo size={48} className="text-[#7A9B7E] dark:text-[#8FB89A]" />
      
      {/* 404 number */}
      <h1 
        className="text-6xl font-bold text-[#1F1B16] dark:text-[#FAFAF8] mt-6"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        404
      </h1>
      
      {/* Message */}
      <p className="text-lg text-[#6B6259] dark:text-[#9C9C94] mt-3">
        This page doesn't exist.
      </p>
      <p className="text-sm text-[#A89F94] dark:text-[#6C6C64] mt-1">
        Maybe the baby hid it during tummy time.
      </p>
      
      {/* Back home button */}
      <Link
        to="/"
        className="mt-8 h-[48px] px-8 rounded-xl bg-[#7A9B7E] dark:bg-[#8FB89A] text-white dark:text-[#111110] font-semibold text-sm flex items-center justify-center hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
      >
        Go home
      </Link>
    </div>
  );
}

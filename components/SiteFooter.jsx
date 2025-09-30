"use client";
import Link from 'next/link';
import Image from 'next/image';

export default function SiteFooter(){
  const year = new Date().getFullYear();
  return (
  <footer className="mt-0 border-t border-borderNeutral bg-surface text-[13px] text-muted">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">
        {/* Brand and Contact Info */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="StudyMate" width={150} height={0} />
          </Link>
          <p className="leading-relaxed text-[12px]">Nền tảng kết nối & học tập. Hợp tác – Tiến bộ – Truyền cảm hứng.</p>
          <ul className="space-y-1 text-[12px]">
            <li><span className="font-medium text-text">Hotline:</span> 1900 6750</li>
            <li><span className="font-medium text-text">Email:</span> support@studymate.vn</li>
            <li><span className="font-medium text-text">Địa chỉ:</span> Đại Học FPT, Quy Nhơn, Gia Lai</li>
          </ul>
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-sm text-text">Theo dõi chúng tôi</h4>
            <div className="flex gap-3 text-sm">
              <SocialIcon label="Facebook" href="#" />
              <SocialIcon label="YouTube" href="#" />
              <SocialIcon label="Twitter" href="#" />
              <SocialIcon label="Instagram" href="#" />
            </div>
          </div>
        </div>
        {/* Link groups */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-text">Về chúng tôi</h4>
          <ul className="space-y-2">
            <FooterLink href="/">Trang chủ</FooterLink>
            <FooterLink href="/courses">Danh sách khóa học</FooterLink>
            <FooterLink href="/featured-courses">Khóa học tiêu biểu</FooterLink>
            <FooterLink href="/news">Tin tức</FooterLink>
            <FooterLink href="/contact">Liên hệ</FooterLink>
            <FooterLink href="/about">Giới thiệu</FooterLink>
          </ul>
        </div>
        {/* Trợ giúp */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-text">Trợ giúp</h4>
          <ul className="space-y-2">
            <FooterLink href="#">Trung tâm hỗ trợ</FooterLink>
            <FooterLink href="#">Chính sách bảo mật</FooterLink>
            <FooterLink href="#">Điều khoản sử dụng</FooterLink>
            <FooterLink href="#">FAQ</FooterLink>
          </ul>
        </div>
        {/* Hợp tác liên kết & Thanh toán */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-text">Hợp tác liên kết</h4>
            <ul className="space-y-2">
              <FooterLink href="#">Đối tác</FooterLink>
              <FooterLink href="#">Tuyển dụng</FooterLink>
              <FooterLink href="#">Giảng viên</FooterLink>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-text">Hình thức thanh toán</h4>
            <div className="flex gap-2 text-xs">
              <span className="inline-block px-3 py-1 bg-white border border-borderNeutral rounded">Visa</span>
              <span className="inline-block px-3 py-1 bg-white border border-borderNeutral rounded">MasterCard</span>
              <span className="inline-block px-3 py-1 bg-white border border-borderNeutral rounded">MoMo</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-borderNeutral text-center py-4 text-[11px] text-muted bg-white">
        © {year} <b className="text-text">StudyMate</b>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }){
  return <li><Link className="text-muted hover:text-text transition-colors" href={href}>{children}</Link></li>;
}

function SocialIcon({ label, href }){
  const icon = {
    Facebook: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 4.98 3.63 9.11 8.38 9.93v-7.03H7.9v-2.9h2.34V9.73c0-2.32 1.38-3.61 3.5-3.61.7 0 1.8.12 2.23.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.45 2.9h-2.33v7.07c5-.66 8.92-4.94 8.92-10.14Z" />
      </svg>
    ),
    YouTube: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4h0s-3.8 0-6.7.3c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 8.9 2 10.6v1.8c0 1.7.2 3.4.2 3.4s.2 1.4.8 2c.8.8 1.8.8 2.2.9 1.6.2 6.6.3 6.6.3s3.8 0 6.7-.3c.4-.1 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.7.2-3.4v-1.8c0-1.7-.2-3.4-.2-3.4ZM10.4 14.7V8.9l5.4 2.9-5.4 2.9Z" />
      </svg>
    ),
    Twitter: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M17.53 3H21l-7.5 8.56L22.35 21H15.6l-5.2-6.29L4.2 21H.73l8.18-9.33L.65 3h6.9l4.7 5.68L17.53 3Zm-1.32 16.2h1.86L7.94 4.7H6L16.21 19.2Z" />
      </svg>
    ),
    Instagram: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
        <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
      </svg>
  )
  }[label];

  const BRAND_BG = {
    Facebook: 'bg-[#1877F2] text-white',
    YouTube: 'bg-[#FF0000] text-white',
    Twitter: 'bg-black text-white',
    Instagram: 'instagram-gradient text-white',
    
  }[label];

  const isInstagram = label === 'Instagram';

  return (
    <Link
      href={href}
      aria-label={label}
  className={`group inline-flex items-center justify-center h-10 w-10 aspect-square rounded-full p-0 flex-none overflow-hidden shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 hover:scale-110 active:scale-95 transition ${!isInstagram ? BRAND_BG : ''}`}
      style={isInstagram ? { background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)' } : undefined}
    >
      {icon}
    </Link>
  );
}


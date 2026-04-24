'use client';

import { useState } from 'react';
import { Link2, Share2 } from 'lucide-react';

export default function NewsShareCopyButton({ title = '' }) {
  const [message, setMessage] = useState('');

  const handleShareOrCopy = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (!url) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });
        setMessage('Đã mở menu chia sẻ.');
      } else {
        await navigator.clipboard.writeText(url);
        setMessage('Đã sao chép link bài viết.');
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }

      setMessage('Không thể sao chép tự động. Hãy copy link thủ công.');
    }

    window.setTimeout(() => {
      setMessage('');
    }, 2400);
  };

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[#e7ebfb] pt-6">
      <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7f879c]">Chia sẻ bài viết</div>
      <button
        type="button"
        onClick={handleShareOrCopy}
        className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[#d8def7] bg-white px-5 text-[13px] font-medium text-[#252c3d] transition hover:border-[#bac4f5] hover:bg-[#f8f9ff]"
      >
        <Share2 className="h-4 w-4" />
        <span>Share / Copy link</span>
        <Link2 className="h-4 w-4" />
      </button>
      {message ? <div className="text-[13px] text-[#586176]">{message}</div> : null}
    </div>
  );
}

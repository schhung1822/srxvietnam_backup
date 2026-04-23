'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Phone, X } from 'lucide-react';

const initialFormData = {
  customer_name: '',
  phone: '',
  email: '',
  consultation_request: '',
};

function AboutContactPopup({ isOpen, onClose }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);

    window.setTimeout(() => {
      onClose();
      setFormData(initialFormData);
      setSubmitStatus(null);
    }, 250);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setIsVisible(true);
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [handleClose, isOpen]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(
        'https://data.nextgency.vn/api/v1/db/data/noco/pt23og868jycyzo/mmw1iwmnal17i0t',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': 'dY0LCW8ChnwtfC6KiA94S17SaBax6RGRaZ4LMaHb',
          },
          body: JSON.stringify({
            customer_name: formData.customer_name,
            phone: formData.phone,
            email: formData.email,
            consultation_request: formData.consultation_request,
            created_at: new Date().toISOString(),
            status: 'New',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitStatus('success');
      setFormData(initialFormData);

      window.setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] overflow-y-auto bg-[#16120b]/45 transition-all duration-300 ${
        isVisible ? 'opacity-100 backdrop-blur-[5px]' : 'opacity-0'
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div
          className={`relative my-auto w-full max-w-[1100px] rounded-[22px] border border-[#c9ae74] bg-[#fbf7ee] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.24)] transition-all duration-300 sm:p-7 lg:max-h-[calc(100vh-48px)] lg:p-10 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full text-[#4e4a44] transition-colors duration-200 hover:bg-[#efe5d1]"
            aria-label="Đóng popup liên hệ"
          >
            <X className="h-6 w-6" strokeWidth={1.8} />
          </button>

          <div className="max-h-[calc(100vh-80px)] overflow-y-auto pr-1 lg:max-h-[calc(100vh-128px)]">
            <div className="pr-12">
              <h3
                className="text-[28px] font-medium leading-[1.1] tracking-[-0.04em] text-[#2c2417] sm:text-[34px] lg:text-[42px]"
                style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
              >
                Liên hệ với SRX
              </h3>
            </div>

            <div className="mt-8 lg:mt-10">
              {submitStatus ? (
                <div
                  className={`mb-6 rounded-[16px] border px-5 py-4 text-[14px] ${
                    submitStatus === 'success'
                      ? 'border-[#b7cba9] bg-[#eff8e7] text-[#405236]'
                      : 'border-[#e5b7ae] bg-[#fff0ed] text-[#8a3f33]'
                  }`}
                >
                  {submitStatus === 'success'
                    ? 'Thông tin đã được gửi. SRX sẽ liên hệ với bạn sớm.'
                    : 'Gửi thông tin chưa thành công. Vui lòng thử lại sau.'}
                </div>
              ) : null}

              <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block">
                    <span
                      className="block text-[15px] text-[#d0ab63] sm:text-[16px]"
                      style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                    >
                      Nhập tên của bạn*
                    </span>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                      className="mt-3 w-full border-b border-[#ead9b9] bg-transparent pb-3 text-[16px] text-[#2b241a] outline-none transition-colors duration-200 placeholder:text-[#cdb68e] focus:border-[#b9934c]"
                    />
                  </label>

                  <label className="block">
                    <span
                      className="block text-[15px] text-[#d0ab63] sm:text-[16px]"
                      style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                    >
                      Nhập số điện thoại*
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-3 w-full border-b border-[#ead9b9] bg-transparent pb-3 text-[16px] text-[#2b241a] outline-none transition-colors duration-200 placeholder:text-[#cdb68e] focus:border-[#b9934c]"
                    />
                  </label>
                </div>

                <label className="mt-8 block">
                  <span
                    className="block text-[15px] text-[#d0ab63] sm:text-[16px]"
                    style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                  >
                    Nhập địa chỉ email*
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-3 w-full border-b border-[#ead9b9] bg-transparent pb-3 text-[16px] text-[#2b241a] outline-none transition-colors duration-200 placeholder:text-[#cdb68e] focus:border-[#b9934c]"
                  />
                </label>

                <label className="mt-8 block">
                  <span
                    className="block text-[15px] text-[#d0ab63] sm:text-[16px]"
                    style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                  >
                    Nhập câu hỏi của bạn ở đây:*
                  </span>
                  <textarea
                    rows="6"
                    name="consultation_request"
                    value={formData.consultation_request}
                    onChange={handleInputChange}
                    required
                    className="mt-3 w-full resize-none border-b border-[#ead9b9] bg-transparent pb-3 text-[16px] text-[#2b241a] outline-none transition-colors duration-200 placeholder:text-[#cdb68e] focus:border-[#b9934c]"
                  />
                </label>

                <div className="mt-10 grid gap-4 md:grid-cols-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex min-h-[70px] items-center justify-center rounded-[6px] bg-[#1f1a14] px-6 text-center text-[20px] font-medium uppercase tracking-[-0.03em] text-white transition-transform duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ fontFamily: '"Bebas Neue", "Manrope", sans-serif' }}
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi cho SRX'}
                  </button>

                  <a
                    href="tel:+84903010692"
                    className="flex min-h-[70px] items-center justify-center gap-3 rounded-[6px] border border-[#d7b36c] px-6 text-center text-[20px] font-medium uppercase tracking-[-0.03em] text-[#2b241a] transition-colors duration-200 hover:bg-[#f3ead9]"
                    style={{ fontFamily: '"Bebas Neue", "Manrope", sans-serif' }}
                  >
                    <Phone className="h-5 w-5" strokeWidth={1.9} />
                    <span>Gọi cho SRX</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AboutContactSection() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <section className="bg-white pt-12 sm:pt-14 lg:pt-20">
        <div className="relative min-h-[420px] w-full overflow-hidden bg-[#f4dfe8] sm:min-h-[500px] lg:min-h-[560px]">
          <img
            src="/assets/images/bg_contact.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_100%)]" />

          <div className="relative z-[1] mx-auto flex min-h-[420px] max-w-[1800px] items-center justify-center px-6 py-14 sm:min-h-[500px] sm:px-10 lg:min-h-[560px] lg:px-16">
            <div className="w-full max-w-[860px] rounded-[12px] border border-white/65 bg-white/44 px-6 py-10 shadow-[0_28px_90px_rgba(184,129,151,0.18)] backdrop-blur-[14px] sm:px-8 lg:px-10 lg:py-12">
              <h2
                className="text-center text-[24px] font-medium leading-[1.02] tracking-[-0.06em] text-[#171212] sm:text-[36px] lg:text-[44px]"
                style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
              >
                Không tìm thấy được dòng sản phẩm mà bạn cần hoặc thích hợp với da của bạn?
              </h2>

              <button
                type="button"
                onClick={() => setIsPopupOpen(true)}
                className="mx-auto mt-8 flex min-h-[56px] items-center justify-center rounded-full border border-[#1a1715] bg-[#1a1715] px-7 text-[14px] font-medium uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#302821]"
                style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
              >
                Liên hệ với chúng tôi
              </button>
            </div>
          </div>
        </div>
      </section>

      <AboutContactPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </>
  );
}

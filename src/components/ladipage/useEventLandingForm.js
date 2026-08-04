'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  applySearchPrefills,
  buildHiddenFieldKeys,
  buildVisibleFields,
  createInitialFormValues,
  normalizePhone,
  parseJsonResponse,
  validateForm,
} from '../../lib/ladipage/eventLandingForm.js';

const CLOSED_MODAL = { open: false, type: 'success', title: '', message: '' };

export default function useEventLandingForm(event, { successMessage } = {}) {
  const visibleFields = useMemo(() => buildVisibleFields(event), [event]);
  const hiddenFieldKeys = useMemo(() => buildHiddenFieldKeys(event), [event]);

  const [formValues, setFormValues] = useState(() => createInitialFormValues(event));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [modalState, setModalState] = useState(CLOSED_MODAL);

  useEffect(() => {
    setFormValues(applySearchPrefills(event, buildVisibleFields(event), createInitialFormValues(event)));
  }, [event]);

  function closeModal() {
    setModalState((currentState) => ({ ...currentState, open: false }));
  }

  function handleInputChange(changeEvent) {
    const { name, value } = changeEvent.target;

    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const validationMessage = validateForm(event, formValues);

    if (validationMessage) {
      setModalState({
        open: true,
        type: 'error',
        title: 'Thiếu thông tin',
        message: validationMessage,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusText('Đang gửi thông tin, vui lòng chờ trong giây lát...');

      const response = await fetch(`/api/events/${event.slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: {
            ...formValues,
            phone: normalizePhone(formValues.phone),
          },
          pageUrl: window.location.href,
        }),
      });
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể gửi đăng ký lúc này.');
      }

      setModalState({
        open: true,
        type: 'success',
        title: 'Đăng ký thành công',
        message:
          data.message ||
          successMessage ||
          `SRX Việt Nam đã nhận thông tin tham dự ${event.eventName}.`,
      });
      setFormValues(applySearchPrefills(event, visibleFields, createInitialFormValues(event)));
    } catch (error) {
      setModalState({
        open: true,
        type: 'error',
        title: 'Không thể gửi đăng ký',
        message: error.message || 'Vui lòng thử lại sau ít phút.',
      });
    } finally {
      setStatusText('');
      setIsSubmitting(false);
    }
  }

  return {
    visibleFields,
    hiddenFieldKeys,
    formValues,
    isSubmitting,
    statusText,
    modalState,
    closeModal,
    handleInputChange,
    handleSubmit,
  };
}

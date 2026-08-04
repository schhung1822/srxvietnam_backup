'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getCheckoutTotals, paymentMethodOptions } from '../../lib/commerce/checkout';
import { useDiscountCodes } from '../../hooks/useDiscountCodes';
import { EMAIL_PATTERN, toContactEmail } from '../../lib/email-address.js';
import ProductArtwork from '../../components/shop/ProductArtwork';
import VoucherField from '../../components/cart/VoucherField';
import provinceData from '../../../province.json';
import wardData from '../../../ward.json';


const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const orderDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const orderStatusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  refunded: 'Hoàn tiền',
};

const paymentStatusLabels = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán lỗi',
  refunded: 'Đã hoàn tiền',
  partially_refunded: 'Hoàn tiền một phần',
};

const paymentMethodIcons = {
  cod: Truck,
  bank_transfer: QrCode,
};

const defaultCheckoutValues = {
  fullName: '',
  phone: '',
  email: '',
  province: '',
  ward: '',
  addressLine: '',
  note: '',
};

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatSavedAddress(address) {
  return [address.addressLine, address.ward, address.province].filter(Boolean).join(', ');
}

function formatCheckoutContact(contact) {
  return [contact.addressLine, contact.ward, contact.province].filter(Boolean).join(', ');
}

function getLocationOptions(data) {
  return Object.values(data ?? {})
    .map((item) => ({
      code: String(item.code ?? ''),
      parentCode: item.parent_code ? String(item.parent_code) : '',
      name: item.name_with_type || item.name || '',
    }))
    .filter((item) => item.code && item.name);
}

function getLocationNameByCode(options, code) {
  return options.find((item) => item.code === String(code))?.name || '';
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(new RegExp('\\u0111', 'g'), 'd')
    .replace(new RegExp('\\u0110', 'g'), 'D')
    .toLowerCase()
    .trim();
}

function formatCheckoutOrderDate(value) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? 'Chưa cập nhật' : orderDateFormatter.format(parsedDate);
}

function formatCheckoutContactValue(value) {
  return String(value ?? '').trim() || 'Chưa cập nhật';
}

function getCheckoutOrderStatusClass(status) {
  switch (status) {
    case 'completed':
      return 'border-[#d4ecdc] bg-[#edf9f1] text-[#237a3b]';
    case 'shipping':
    case 'processing':
      return 'border-[#dbe3ff] bg-[#eef2ff] text-[#2b4eff]';
    case 'cancelled':
    case 'refunded':
      return 'border-[#f0d3d3] bg-[#fff0f0] text-[#b14040]';
    default:
      return 'border-[#eadfce] bg-[#fcfaf8] text-[#7a6958]';
  }
}

function AddressOption({ address, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(address.id)}
      className={`rounded-[24px] border p-5 text-left transition ${
        isSelected
          ? 'border-[#dedede] bg-[#f2f2f2] text-[#15110d]'
          : 'border-[#dedede] bg-white text-[#15110d] hover:border-[#bdbdbd]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold">{address.label || address.recipientName}</div>
          <div className={`mt-1 text-[14px] ${isSelected ? 'text-[#666]' : 'text-[#665a4e]'}`}>
            {address.recipientName} • {address.recipientPhone}
          </div>
        </div>

        {address.isDefault ? (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] ${
              isSelected
                ? 'border-white/16 bg-white/10 text-white'
                : 'border-[#e8dfd3] bg-[#fcfaf8] text-[#8d7f72]'
            }`}
          >
            Mặc định
          </span>
        ) : null}
      </div>

      <div className={`mt-4 text-[14px] leading-6 ${isSelected ? 'text-[#666]' : 'text-[#665a4e]'}`}>
        {formatSavedAddress(address)}
      </div>
    </button>
  );
}

function PaymentMethodOption({ method, isSelected, onSelect }) {
  const Icon = paymentMethodIcons[method.id] ?? CreditCard;

  return (
    <button
      type="button"
      onClick={() => onSelect(method.id)}
      className={`flex min-h-[58px] w-full items-center gap-4 rounded-[10px] border px-4 py-3 text-left transition ${
        isSelected
          ? 'border-[#dedede] bg-[#f2f2f2] text-[#15110d]'
          : 'border-[#dedede] bg-white text-[#15110d] hover:border-[#bdbdbd]'
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[8px] ${
          isSelected ? 'bg-white text-[#2540dd]' : 'bg-[#f7f7f7] text-[#15110d]'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <div className="text-[16px] font-semibold">{method.label}</div>
        <div className={`mt-0.5 line-clamp-1 text-[12px] leading-5 ${isSelected ? 'text-[#666]' : 'text-[#665a4e]'}`}>
          {method.description}
        </div>
      </div>
    </button>
  );
}

function CheckoutCartLine({ item, onQuantityChange, onVariantChange, onRemove }) {
  const [isVariantMenuOpen, setIsVariantMenuOpen] = useState(false);
  const variantOptions = item.variantOptions?.length
    ? item.variantOptions
    : [{ id: item.variantId, label: item.variantLabel || 'Mặc định' }];
  const selectedVariant = variantOptions.find((variant) => String(variant.id) === String(item.variantId)) ?? variantOptions[0];
  const hasVariantOptions = variantOptions.length > 1;
  const productPath = item.slug ? '/products/' + item.slug : '/products';
  const imageUrl = item.scene?.image ?? '';

  return (
    <div className="border-b border-[#e5e5e5] py-4 last:border-b-0 sm:py-5">
      <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-4">
        <Link href={productPath} className="block h-[96px] w-[72px] overflow-hidden rounded-[8px] bg-[#f3f3f3] sm:h-[124px] sm:w-[96px]">
          {imageUrl ? <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" loading="lazy" /> : <ProductArtwork scene={item.scene} badge={item.badge} mode="cart-thumbnail" />}
        </Link>
        <div className="min-w-0">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
            <div className="min-w-0">
              <Link href={productPath} className="line-clamp-2 text-[14px] font-semibold leading-5 text-[#15110d] transition hover:text-[#2540dd] sm:text-[15px] sm:leading-6">{item.name}</Link>
              <div className="mt-1 text-[12px] text-[#777] sm:text-[13px]">{selectedVariant?.label || 'Mặc định'}</div>
            </div>
            <div className="font-['Inter',_sans-serif] text-left text-[14px] font-semibold text-[#15110d] sm:text-right sm:text-[15px]">
              {currencyFormatter.format(item.price * item.quantity)}
              {Number(item.originalPrice) > Number(item.price) ? <div className="mt-1 text-[12px] font-normal text-[#777] line-through">{currencyFormatter.format(item.originalPrice * item.quantity)}</div> : null}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 sm:mt-3 sm:gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button type="button" onClick={() => hasVariantOptions && setIsVariantMenuOpen((current) => !current)} className={["inline-flex h-9 min-w-[82px] sm:h-10 sm:min-w-[96px] items-center justify-between gap-3 rounded-full border px-4 text-[13px] font-semibold shadow-sm transition", isVariantMenuOpen ? "border-[#2540dd] bg-white text-[#2540dd] shadow-[0_0_0_2px_rgba(37,64,221,0.08)]" : "border-[#e1e1e1] bg-[#f7f7f7] text-[#252525] hover:border-[#2540dd] hover:bg-white", hasVariantOptions ? "" : "cursor-default"].join(' ')} aria-expanded={isVariantMenuOpen} aria-haspopup="listbox">
                  <span>{selectedVariant?.label || 'Mặc định'}</span>
                  {hasVariantOptions ? <ChevronDown className="h-4 w-4" /> : null}
                </button>
                {isVariantMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-[120px] overflow-hidden rounded-[6px] border border-[#d8d8d8] bg-white py-1 shadow-[0_16px_34px_rgba(15,23,42,0.14)]" role="listbox">
                    {variantOptions.map((variant) => {
                      const isSelected = String(variant.id) === String(item.variantId);
                      return <button key={variant.id} type="button" onClick={() => { onVariantChange(item.lineId, variant.id); setIsVariantMenuOpen(false); }} className={isSelected ? 'block w-full bg-[#2540dd] px-4 py-2 text-left text-[13px] font-semibold text-white' : 'block w-full px-4 py-2 text-left text-[13px] text-[#15110d] hover:bg-[#f2f2f2]'} role="option" aria-selected={isSelected}>{variant.label}</button>;
                    })}
                  </div>
                ) : null}
              </div>
              <button type="button" onClick={() => onRemove(item.lineId)} className="inline-flex h-10 items-center gap-1.5 text-[13px] font-medium text-[#777] transition hover:text-[#15110d]"><Trash2 className="h-3.5 w-3.5" />Xóa</button>
            </div>
            <div className="grid h-8 grid-cols-[28px_30px_28px] sm:grid-cols-[30px_34px_30px] items-center rounded-full border border-[#e6e6e6] bg-white">
              <button type="button" onClick={() => onQuantityChange(item.lineId, item.quantity - 1)} className="flex h-full items-center justify-center text-[#555] hover:text-[#2540dd]" aria-label="Giảm số lượng"><Minus className="h-3.5 w-3.5" /></button>
              <span className="text-center text-[13px] font-semibold text-[#15110d]">{item.quantity}</span>
              <button type="button" onClick={() => onQuantityChange(item.lineId, item.quantity + 1)} className="flex h-full items-center justify-center text-[#555] hover:text-[#2540dd]" aria-label="Tăng số lượng"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationSelect({ label, value, options, placeholder, disabled = false, inputProps, error, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedOption = options.find((option) => option.code === String(value));
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    if (!normalizedQuery) return options;
    return options.filter((option) => normalizeSearchText(option.name).includes(normalizedQuery));
  }, [options, searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, value]);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <input type="hidden" {...inputProps} value={value || ''} readOnly />
      <label className="mb-1.5 block pl-3 text-[13px] font-medium text-[#555]">{label}</label>
      <div
        className={[
          'flex min-h-[44px] w-full items-center rounded-[18px] border bg-white px-5 text-[14px] font-semibold outline-none transition',
          isOpen ? 'border-[#15110d] shadow-[0_0_0_2px_rgba(21,17,13,0.05)]' : 'border-[#d8d8d8]',
          disabled ? 'cursor-not-allowed bg-[#f5f5f5] text-[#999]' : 'text-[#15110d] hover:border-[#777]',
        ].join(' ')}
      >
        <input
          type="text"
          value={isOpen ? searchQuery : selectedOption?.name || ''}
          onFocus={() => {
            if (!disabled) {
              setSearchQuery(selectedOption?.name || '');
              setIsOpen(true);
            }
          }}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          disabled={disabled}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#15110d] outline-none placeholder:text-[#9a9a9a] disabled:cursor-not-allowed disabled:text-[#999]"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((current) => !current)}
          disabled={disabled}
          className="ml-3 flex h-6 w-6 flex-shrink-0 items-center justify-center text-[#777] disabled:cursor-not-allowed"
          aria-label={'M\u1edf danh s\u00e1ch'}
        >
          <ChevronDown className={[
            'h-4 w-4 transition',
            isOpen ? 'rotate-180' : '',
          ].join(' ')} />
        </button>
      </div>

      {isOpen ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-[16px] border border-[#ececec] bg-white py-2 shadow-[0_18px_45px_rgba(15,23,42,0.14)]" role="listbox">
          <div className="max-h-[260px] overflow-y-auto px-1.5">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const isSelected = option.code === String(value);
                return (
                  <button
                    key={option.code}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(option.code)}
                    className={[
                      'flex min-h-[44px] w-full items-center gap-3 rounded-[10px] px-4 text-left text-[14px] font-semibold transition',
                      isSelected ? 'bg-[#f1f1f1] text-[#050505]' : 'text-[#050505] hover:bg-[#f7f7f7]',
                    ].join(' ')}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                      {isSelected ? <Check className="h-4 w-4" /> : null}
                    </span>
                    <span className="truncate">{option.name}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-4 text-[14px] font-medium text-[#777]">{'Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u1ecba ch\u1ec9 ph\u00f9 h\u1ee3p'}</div>
            )}
          </div>
        </div>
      ) : null}
      <FieldError error={error} />
    </div>
  );
}

function FieldError({ error }) {
  if (!error?.message) {
    return null;
  }

  return <div className="mt-2 text-[13px] text-red-600">{error.message}</div>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { items, subtotal, clearCart, isReady, updateQuantity, updateVariant, removeItem } = useCart();
  const { discountCodes, isLoading: isLoadingDiscountCodes } = useDiscountCodes();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedCheckout, setCompletedCheckout] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressesError, setAddressesError] = useState('');
  const [saveNewAddress] = useState(true);

  const checkoutForm = useForm({
    defaultValues: defaultCheckoutValues,
    shouldUnregister: true,
  });

  const provinceOptions = useMemo(() => getLocationOptions(provinceData), []);
  const allWardOptions = useMemo(() => getLocationOptions(wardData), []);
  const selectedProvinceCode = checkoutForm.watch('province');
  const wardOptions = useMemo(
    () => allWardOptions.filter((ward) => ward.parentCode === String(selectedProvinceCode || '')),
    [allWardOptions, selectedProvinceCode],
  );

  useEffect(() => {
    const selectedWardCode = checkoutForm.getValues('ward');
    if (selectedWardCode && !wardOptions.some((ward) => ward.code === String(selectedWardCode))) {
      checkoutForm.setValue('ward', '');
    }
  }, [checkoutForm, selectedProvinceCode, wardOptions]);

  useEffect(() => {
    const currentValues = checkoutForm.getValues();

    checkoutForm.reset({
      fullName: currentValues.fullName || user?.fullName || '',
      phone: currentValues.phone || user?.phone || '',
      // toContactEmail lọc email placeholder của tài khoản đăng nhập bằng Zalo.
      email: currentValues.email || toContactEmail(user?.email),
      province: currentValues.province || '',
      ward: currentValues.ward || '',
      addressLine: currentValues.addressLine || '',
      note: currentValues.note || '',
    });
  }, [checkoutForm, user]);

  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setSelectedAddressId(null);
      setAddressesError('');
      return;
    }

    let isCancelled = false;

    const loadAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        setAddressesError('');

        const response = await fetch('/api/account/addresses', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await parseJson(response);

        if (!response.ok) {
          throw new Error(data.message ?? 'Không thể tải danh sách địa chỉ.');
        }

        if (!isCancelled) {
          const nextAddresses = Array.isArray(data.addresses) ? data.addresses : [];
          setAddresses(nextAddresses);

          if (nextAddresses.length) {
            const defaultAddress = nextAddresses.find((address) => address.isDefault) ?? nextAddresses[0];
            setSelectedAddressId(defaultAddress.id);
          } else {
            setSelectedAddressId(null);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setAddresses([]);
          setSelectedAddressId(null);
          setAddressesError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAddresses(false);
        }
      }
    };

    loadAddresses();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Giỏ hàng đổi số lượng có thể khiến mã đang áp dụng không còn thỏa điều kiện.
  useEffect(() => {
    if (!appliedCouponCode) {
      return;
    }

    const nextTotals = getCheckoutTotals({
      subtotal,
      couponCode: appliedCouponCode,
      discountCodes,
    });

    if (!nextTotals.coupon.isValid) {
      setAppliedCouponCode('');
    }
  }, [appliedCouponCode, discountCodes, subtotal]);

  const totals = useMemo(
    () =>
      getCheckoutTotals({
        subtotal,
        couponCode: appliedCouponCode,
        discountCodes,
      }),
    [appliedCouponCode, discountCodes, subtotal],
  );

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const hasSavedAddresses = addresses.length > 0;
  const useSavedAddresses = Boolean(user && hasSavedAddresses);

  const handleSubmitOrder = checkoutForm.handleSubmit(async (values) => {
    if (!items.length) {
      setSubmitError('Giỏ hàng đang trống.');
      return;
    }

    if (useSavedAddresses && !selectedAddressId) {
      setSubmitError('Vui lòng chọn địa chỉ giao hàng.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      const normalizedValues = {
        ...values,
        province: getLocationNameByCode(provinceOptions, values.province) || values.province,
        ward: getLocationNameByCode(allWardOptions, values.ward) || values.ward,
      };

      const payloadItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        name: item.name,
        variantLabel: item.variantLabel,
        price: item.price,
        quantity: item.quantity,
      }));

      const shouldUseSelectedAddress = useSavedAddresses && selectedAddressId;
      let checkoutAddressId = shouldUseSelectedAddress ? selectedAddressId : null;
      let checkoutAddress = shouldUseSelectedAddress ? selectedAddress : null;

      if (user && !shouldUseSelectedAddress && saveNewAddress) {
        const addressResponse = await fetch('/api/account/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: normalizedValues.fullName || 'Địa chỉ giao hàng',
            recipientName: normalizedValues.fullName,
            recipientPhone: normalizedValues.phone,
            province: normalizedValues.province,
            ward: normalizedValues.ward,
            addressLine: normalizedValues.addressLine,
            isDefault: !hasSavedAddresses,
          }),
        });
        const addressData = await parseJson(addressResponse);
        if (!addressResponse.ok) throw new Error(addressData.message ?? 'Kh?ng th? l?u nhanh Địa chỉ giao hàng.');
        checkoutAddressId = addressData.address?.id ?? null;
        checkoutAddress = addressData.address ?? null;
        setAddresses(Array.isArray(addressData.addresses) ? addressData.addresses : addresses);
        setSelectedAddressId(checkoutAddressId);
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod,
          couponCode: appliedCouponCode,
          addressId: checkoutAddressId,
          customer: checkoutAddressId ? null : normalizedValues,
          items: payloadItems,
        }),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể tạo đơn hàng.');
      }

      const contactSnapshot = checkoutAddress
        ? {
            fullName: checkoutAddress.recipientName ?? user?.fullName ?? '',
            phone: checkoutAddress.recipientPhone ?? user?.phone ?? '',
            email: toContactEmail(user?.email) || normalizedValues.email || '',
            province: checkoutAddress.province ?? '',
            ward: checkoutAddress.ward || checkoutAddress.district || '',
            addressLine: checkoutAddress.addressLine ?? '',
          }
        : normalizedValues;

      clearCart();

      if (data.order?.paymentMethod === 'bank_transfer' && data.order?.orderNumber) {
        router.push(`/checkout/payment/${encodeURIComponent(data.order.orderNumber)}`);
        return;
      }

      setCompletedCheckout({
        order: data.order,
        payment: data.payment,
        customer: contactSnapshot,
        items: [...payloadItems, ...(data.order?.gifts ?? [])],
      });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (!isReady || isAuthLoading) {
    return (
      <section className="bg-[#fcfaf8] py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-[#ece4da] bg-white text-[15px] text-[#665a4e]">
            Đang chuẩn bị checkout...
          </div>
        </div>
      </section>
    );
  }

  if (completedCheckout) {
    const isBankTransfer = completedCheckout.order.paymentMethod === 'bank_transfer';
    const paymentMethodLabel =
      paymentMethodOptions.find((method) => method.id === completedCheckout.order.paymentMethod)?.label ??
      completedCheckout.order.paymentMethod;

    return (
      <section className="bg-[#fcfaf8] py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="bg-white p-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#15110d] text-white">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="mt-6 inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                Đơn hàng thành công
              </div>
              <h1 className="mt-5 text-[32px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d] md:text-[38px]">
                #{completedCheckout.order.orderNumber} đã được tạo
              </h1>
              <p className="mt-4 max-w-[620px] text-[16px] leading-8 text-[#665a4e]">
                {isBankTransfer
                  ? 'Đơn hàng đang chờ thanh toán. Quét QR hoặc chuyển khoản đúng số tiền và nội dung bên dưới để hệ thống dễ đối soát.'
                  : 'Đơn hàng của bạn đã được ghi nhận. SRX sẽ liên hệ xác nhận trước khi giao và bạn thanh toán khi nhận hàng.'}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-[13px] font-medium ${getCheckoutOrderStatusClass(
                    completedCheckout.order.orderStatus,
                  )}`}
                >
                  {orderStatusLabels[completedCheckout.order.orderStatus] ?? completedCheckout.order.orderStatus}
                </span>
                <span className="inline-flex rounded-full border border-[#eadfce] bg-white px-3 py-1.5 text-[13px] font-medium text-[#665a4e]">
                  {paymentStatusLabels[completedCheckout.order.paymentStatus] ?? completedCheckout.order.paymentStatus}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                  <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Tổng thanh toán</div>
                  <div className="font-['Inter',_sans-serif] mt-2 text-[24px] font-semibold text-[#15110d]">
                    {currencyFormatter.format(completedCheckout.order.grandTotal)}
                  </div>
                </div>
                <div className="rounded-[22px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                  <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Phương thức</div>
                  <div className="mt-2 text-[18px] font-semibold text-[#15110d]">
                    {paymentMethodLabel}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {user ? (
                  <Link
                    href="/account"
                    className="inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
                  >
                    Xem tài khoản
                  </Link>
                ) : null}
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border border-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            <div className="space-y-6">

              <div className="rounded-[32px] border border-[#ece4da] bg-white p-4">
                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="p-5">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">
                      Thông tin đơn hàng
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Mã đơn hàng</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">
                          #{completedCheckout.order.orderNumber}
                        </div>
                      </div>
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Ngày đặt</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">
                          {formatCheckoutOrderDate(completedCheckout.order.placedAt)}
                        </div>
                      </div>
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Trạng thái đơn</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">
                          {orderStatusLabels[completedCheckout.order.orderStatus] ?? completedCheckout.order.orderStatus}
                        </div>
                      </div>
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Tổng tiền</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">
                          {currencyFormatter.format(completedCheckout.order.grandTotal)}
                        </div>
                      </div>
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Tạm tính</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">
                          {currencyFormatter.format(completedCheckout.order.subtotal)}
                        </div>
                      </div>
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Giảm giá</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">
                          {completedCheckout.order.discountTotal > 0
                            ? `- ${currencyFormatter.format(completedCheckout.order.discountTotal)}`
                            : currencyFormatter.format(0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">
                      Thông tin thanh toán
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Tên khách hàng</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">
                          {formatCheckoutContactValue(completedCheckout.customer.fullName)}
                        </div>
                      </div>
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Số điện thoại</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">
                          {formatCheckoutContactValue(completedCheckout.customer.phone)}
                        </div>
                      </div>
                      {/* Email là tùy chọn nên chỉ hiện khi khách có điền. */}
                      {completedCheckout.customer.email ? (
                        <div className="px-4 py-1">
                          <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Email</div>
                          <div className="mt-1 break-all text-[15px] font-semibold text-[#15110d]">
                            {completedCheckout.customer.email}
                          </div>
                          <div className="mt-1 text-[12.5px] leading-5 text-[#8d7f72]">
                            Thư xác nhận đơn hàng đã được gửi tới địa chỉ này.
                          </div>
                        </div>
                      ) : null}
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Địa chỉ giao hàng</div>
                        <div className="mt-1 text-[15px] font-semibold leading-6 text-[#15110d]">
                          {formatCheckoutContactValue(formatCheckoutContact(completedCheckout.customer))}
                        </div>
                      </div>
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Phương thức thanh toán</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">{paymentMethodLabel}</div>
                      </div>
                      <div className="px-4 py-1">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-[#8d7f72]">Trạng thái thanh toán</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#15110d]">
                          {paymentStatusLabels[completedCheckout.order.paymentStatus] ?? completedCheckout.order.paymentStatus}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                  Thông tin nhận hàng
                </div>
                <div className="mt-4 rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                  <div className="text-[17px] font-semibold text-[#15110d]">
                    {completedCheckout.customer.fullName}
                  </div>
                  <div className="mt-2 text-[14px] text-[#665a4e]">
                    {completedCheckout.customer.phone}
                    {completedCheckout.customer.email ? ` • ${completedCheckout.customer.email}` : ''}
                  </div>
                  <div className="mt-2 text-[14px] leading-6 text-[#665a4e]">
                    {formatCheckoutContact(completedCheckout.customer)}
                  </div>
                </div>

                <div className="mt-5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                  Sản phẩm
                </div>
                <div className="mt-4 space-y-3">
                  {completedCheckout.items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-start justify-between gap-4 rounded-[18px] border border-[#f0e7dc] bg-[#fcfaf8] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold leading-6 text-[#15110d]">{item.name}</div>
                        {item.variantLabel ? (
                          <div className="mt-1 text-[13px] text-[#665a4e]">{item.variantLabel}</div>
                        ) : null}
                        <div className="mt-2 text-[13px] text-[#665a4e]">
                          Đơn giá {currencyFormatter.format(item.price)}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-[14px] text-[#665a4e]">x{item.quantity}</div>
                        <div className="mt-2 text-[15px] font-semibold text-[#15110d]">
                          {currencyFormatter.format(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="bg-[#fcfaf8] py-12 md:py-20">
        <div className="mx-auto max-w-[980px] px-4 md:px-6">
          <div className="rounded-[32px] border border-[#ece4da] bg-white px-6 py-14 text-center md:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#15110d] text-white">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-[32px] font-semibold tracking-[-0.04em] text-[#15110d]">
              Giỏ hàng đang trống
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[#665a4e]">
              Hãy thêm sản phẩm vào giỏ trước khi tiến hành checkout.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
            >
              Xem sản phẩm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page bg-white pb-[92px] pt-4 md:pb-[104px] md:pt-8">
      <div className="mx-auto max-w-[1920px] px-3 sm:px-6 lg:px-10 xl:px-[58px]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(620px,0.95fr)] xl:gap-8">
          <div className="min-w-0">
            <div className="flex min-h-[52px] flex-col items-start gap-3 rounded-[7px] bg-[#f3f3f3] px-4 py-4 text-[13px] font-semibold leading-5 text-[#050505] sm:min-h-[58px] sm:flex-row sm:items-center sm:gap-8 sm:px-5 sm:py-0 sm:text-[14px]">
              <Link href="/register" className="rounded-full bg-[#2540dd] px-5 py-2 text-[12px] font-bold uppercase text-white text-nowrap transition hover:bg-[#1f34ba] sm:px-7 sm:text-[13px]">ĐĂNG KÝ NGAY</Link>
              <div>
                Đăng ký tài khoản để nhận Voucher - 10% cho đơn hàng đầu tiên và ghi nhận hoàn tiền trên từng đơn hàng. <a className="text-[#2540dd] underline" href="#">Tìm hiểu thêm</a>
              </div>
            </div>

            <h1 className="mt-7 text-[22px] font-semibold tracking-[-0.03em] text-[#050505] sm:mt-12 sm:text-[24px]">Thông tin vận chuyển</h1>

            {useSavedAddresses ? (
              <div className="bg-white p-0">
                <div className="flex items-center gap-3">
                  <div className="hidden">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                      Địa chỉ giao hàng
                    </div>
                    <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                      Chọn địa chỉ có sẵn
                    </h2>
                  </div>
                </div>

                {isLoadingAddresses ? (
                  <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] px-5 py-4 text-[14px] text-[#665a4e]">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Đang tải địa chỉ đã lưu...
                  </div>
                ) : addressesError ? (
                  <div className="mt-6 rounded-[20px] border border-[#efd3d3] bg-[#fff1f1] px-4 py-3 text-[14px] text-[#ad4040]">
                    {addressesError}
                  </div>
                ) : hasSavedAddresses ? (
                  <>
                    <div className="mt-7 space-y-2">
                      {addresses.map((address) => (
                        <AddressOption
                          key={address.id}
                          address={address}
                          isSelected={selectedAddressId === address.id}
                          onSelect={setSelectedAddressId}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="mt-6 rounded-[24px] border border-dashed border-[#d8c8b6] bg-[#fcfaf8] px-6 py-10 text-center">
                    <MapPin className="mx-auto h-8 w-8 text-[#15110d]" />
                    <h3 className="mt-4 text-[22px] font-semibold text-[#15110d]">Tài khoản chưa có địa chỉ</h3>
                    <p className="mt-3 text-[15px] leading-7 text-[#665a4e]">
                      Khi đã đăng nhập, checkout chỉ dùng địa chỉ giao hàng đã lưu. Hãy thêm địa chỉ trong tài khoản rồi quay lại thanh toán.
                    </p>
                    <Link
                      href="/account"
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
                    >
                      Đi tới tài khoản
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-0">
                <div className="mt-5 space-y-3 sm:mt-9">
                <label className="flex items-start gap-2 text-[12px] font-semibold leading-5 text-[#777] sm:items-center sm:text-[13px]"><input type="checkbox" defaultChecked className="h-5 w-5 rounded border-[#2540dd] accent-[#2540dd]" />
                  Tôi đã đọc và đồng ý với các thông tin trong Chính sách bảo vệ dữ liệu người dùng <a href='/chinh-sach-bao-mat' className='text-[#2540dd] underline' target='_blank'>Tại đây</a>
                </label>
                <div className="grid gap-2.5 sm:gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
                  <div>
                    <label className="mb-1.5 block pl-3 text-[13px] font-medium text-[#555]">Họ tên</label>
                    <input
                      type="text"
                      {...checkoutForm.register('fullName', {
                        required: 'Vui lòng nhập họ tên.',
                        minLength: {
                          value: 2,
                          message: 'Họ tên quá ngắn.',
                        },
                      })}
                      className="min-h-[44px] w-full rounded-full border border-[#d8d8d8] bg-white px-5 text-[14px] outline-none transition focus:border-[#2540dd]"
                      placeholder="Nguyễn Văn A"
                    />
                    <FieldError error={checkoutForm.formState.errors.fullName} />
                  </div>

                  <div>
                    <label className="mb-1.5 block pl-3 text-[13px] font-medium text-[#555]">SĐT</label>
                    <input
                      type="tel"
                      {...checkoutForm.register('phone', {
                        required: 'Vui lòng nhập số điện thoại.',
                        minLength: {
                          value: 8,
                          message: 'Số điện thoại không hợp lệ.',
                        },
                      })}
                      className="min-h-[44px] w-full rounded-full border border-[#d8d8d8] bg-white px-5 text-[14px] outline-none transition focus:border-[#2540dd]"
                      placeholder="09xxxxxxxx"
                    />
                    <FieldError error={checkoutForm.formState.errors.phone} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block pl-3 text-[13px] font-medium text-[#555]">
                      Email <span className="text-[#8a8a8a]">(không bắt buộc)</span>
                    </label>
                    <input
                      type="email"
                      {...checkoutForm.register('email', {
                        // Bỏ trống được; chỉ kiểm tra định dạng khi khách có nhập.
                        validate: (value) =>
                          !String(value ?? '').trim() ||
                          EMAIL_PATTERN.test(String(value).trim()) ||
                          'Email không hợp lệ.',
                      })}
                      className="min-h-[44px] w-full rounded-full border border-[#d8d8d8] bg-white px-5 text-[14px] outline-none transition focus:border-[#2540dd]"
                      placeholder="example@gmail.com"
                    />
                    <FieldError error={checkoutForm.formState.errors.email} />
                    {!checkoutForm.formState.errors.email ? (
                      <p className="mt-1.5 pl-3 text-[12.5px] leading-5 text-[#8a8a8a]">
                        Điền email nếu bạn muốn nhận thêm thư xác nhận đơn hàng. Để trống vẫn đặt hàng bình thường.
                      </p>
                    ) : null}
                  </div>

                  <LocationSelect
                    label={'T\u1ec9nh/TP'}
                    value={selectedProvinceCode}
                    options={provinceOptions}
                    placeholder={'Ch\u1ecdn t\u1ec9nh/th\u00e0nh ph\u1ed1'}
                    inputProps={checkoutForm.register('province', {
                      required: 'Vui l\u00f2ng ch\u1ecdn t\u1ec9nh/th\u00e0nh ph\u1ed1.',
                    })}
                    error={checkoutForm.formState.errors.province}
                    onChange={(nextValue) => {
                      checkoutForm.setValue('province', nextValue, { shouldDirty: true, shouldValidate: true });
                      checkoutForm.setValue('ward', '', { shouldDirty: true, shouldValidate: true });
                    }}
                  />

                  <LocationSelect
                    label={'Ph\u01b0\u1eddng/X\u00e3'}
                    value={checkoutForm.watch('ward')}
                    options={wardOptions}
                    placeholder={selectedProvinceCode ? 'Ch\u1ecdn ph\u01b0\u1eddng/x\u00e3' : 'Ch\u1ecdn t\u1ec9nh/th\u00e0nh ph\u1ed1 tr\u01b0\u1edbc'}
                    disabled={!selectedProvinceCode}
                    inputProps={checkoutForm.register('ward', {
                      required: 'Vui l\u00f2ng ch\u1ecdn ph\u01b0\u1eddng/x\u00e3.',
                    })}
                    error={checkoutForm.formState.errors.ward}
                    onChange={(nextValue) => {
                      checkoutForm.setValue('ward', nextValue, { shouldDirty: true, shouldValidate: true });
                    }}
                  />

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block pl-3 text-[13px] font-medium text-[#555]">
                      Địa chỉ chi tiết
                    </label>
                    <textarea
                      rows={2}
                      {...checkoutForm.register('addressLine', {
                        required: 'Vui lòng nhập địa chỉ chi tiết.',
                        minLength: {
                          value: 6,
                          message: 'Địa chỉ quá ngắn.',
                        },
                      })}
                      className="min-h-[68px] w-full resize-none rounded-[18px] border border-[#d8d8d8] bg-white px-5 py-3 text-[14px] leading-6 outline-none transition focus:border-[#2540dd]"
                      placeholder="Số nhà, tên đường, tòa nhà..."
                    />
                    <FieldError error={checkoutForm.formState.errors.addressLine} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block pl-3 text-[13px] font-medium text-[#555]">Ghi chú</label>
                    <input type="text" {...checkoutForm.register('note')} className="min-h-[44px] w-full rounded-full border border-[#d8d8d8] bg-white px-5 text-[14px] outline-none transition focus:border-[#2540dd]" placeholder="Nhập ghi chú" />
                  </div>
                </div>
                <div className="border-t hidden border-[#e8e8e8]" />
                <label className="flex hidden items-center gap-3 border-b border-[#e8e8e8] pb-5 text-[15px] font-bold text-[#15110d]"><input type="checkbox" className="h-5 w-5 rounded border-[#999] accent-[#2540dd]" />Xuất hoá đơn VAT</label>
              </div>
              </div>
            )}

            <div className="bg-white p-0">
              <h2 className="mt-7 text-[22px] font-semibold tracking-[-0.04em] text-[#15110d] sm:mt-6 sm:text-[24px]">
                Chọn phương thức phù hợp
              </h2>

              <div className="mt-4 grid gap-2.5 sm:mt-6 sm:gap-4">
                {paymentMethodOptions.map((method) => (
                  <PaymentMethodOption
                    key={method.id}
                    method={method}
                    isSelected={paymentMethod === method.id}
                    onSelect={setPaymentMethod}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-[92px] lg:self-start">
            <div className="bg-white p-0">
              <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-[#050505] xl:mt-0 xl:text-[30px]">Giỏ hàng</h2>
              <div className="mt-3 flex min-h-[36px] items-center justify-between rounded-[7px] bg-[#e9ecff] px-3 text-[12px] font-semibold text-[#2540dd] sm:px-4 sm:text-[14px]">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Freeship đơn từ 200k</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-b border-[#e5e5e5] pb-3 text-[13px] text-[#777] sm:mt-5 sm:pb-4 sm:text-[14px]">
                <label className="inline-flex items-center gap-3">Tất cả sản phẩm</label>
                <button type="button" onClick={clearCart} className="text-[13px] transition hover:text-[#15110d]">Xóa tất cả</button>
              </div>
              <div className="mt-3 sm:mt-5">
                {items.map((item) => (
                  <CheckoutCartLine
                    key={item.lineId}
                    item={item}
                    onQuantityChange={updateQuantity}
                    onVariantChange={updateVariant}
                    onRemove={removeItem}
                  />
                ))}
              </div>
              <div className="border-b border-[#e5e5e5] py-4 text-[12px] font-semibold text-[#15110d] sm:py-5 sm:text-[14px]">Có 3 người đang thêm cùng sản phẩm giống bạn vào giỏ hàng.</div>

            </div>

            <div className="bg-white p-0">
              <VoucherField
                subtotal={subtotal}
                discountCodes={discountCodes}
                isLoading={isLoadingDiscountCodes}
                appliedCode={totals.coupon.isValid ? totals.coupon.code : ''}
                discountTotal={totals.discountTotal}
                onApply={setAppliedCouponCode}
                onRemove={() => setAppliedCouponCode('')}
                isLoggedIn={Boolean(user)}
                loginHref="/login?next=/checkout"
              />

              <div className="mt-6 border-t border-[#e5e5e5] pt-5 sm:mt-8 sm:pt-7"><h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#15110d] sm:text-[22px]">Chi tiết thanh toán</h3><div className="mt-4 space-y-3 text-[14px] text-[#666] sm:mt-5 sm:space-y-4 sm:text-[15px]">
                <div className="flex items-center justify-between">
                  <span>Tạm tính</span>
                  <span className="font-['Inter',_sans-serif] font-medium text-[#15110d]">{currencyFormatter.format(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giảm giá</span>
                  <span className="font-['Inter',_sans-serif] font-medium text-[#15110d]">-{currencyFormatter.format(totals.discountTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-[#15110d]">Miễn phí</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#e5e5e5] pt-4 text-[16px] font-bold text-[#15110d]">
                  <span>Tổng cộng</span>
                  <span className="font-['Inter',_sans-serif]">{currencyFormatter.format(totals.grandTotal)}</span>
                </div>

                </div>
              </div>

              {submitError ? (
                <div className="mt-4 rounded-[20px] border border-[#efd3d3] bg-[#fff1f1] px-4 py-3 text-[14px] text-[#ad4040]">
                  {submitError}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting || (useSavedAddresses ? !selectedAddressId : false) || (useSavedAddresses && isLoadingAddresses)}
                className="hidden"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                <span>{paymentMethod === 'bank_transfer' ? 'Tạo đơn và nhận QR' : 'Xác nhận đặt hàng'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#e5e5e5] bg-[#eef1ff] shadow-[0_-12px_34px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto grid max-w-[1920px] grid-cols-[minmax(0,1fr)_116px] items-stretch px-0 sm:grid-cols-[minmax(0,1fr)_164px] sm:px-6 lg:px-10 xl:px-[58px]">
          <div className="grid min-h-[64px] items-center gap-1 bg-[#eef1ff] px-3 py-2 sm:min-h-[74px] sm:gap-3 sm:px-4 sm:py-3 md:grid-cols-[minmax(220px,0.85fr)_minmax(0,1fr)] md:px-8">
            <div className="hidden items-center gap-3 text-[14px] font-semibold text-[#15110d] sm:flex">
              <CreditCard className="h-5 w-5 text-[#2540dd]" />
              <span>{paymentMethodOptions.find((method) => method.id === paymentMethod)?.label ?? 'Thanh toán'}</span>
            </div>
            <div className="flex flex-col items-start justify-center gap-0.5 text-left text-[11px] text-[#555] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1 sm:text-center sm:text-[13px]">
              <div className="font-['Inter',_sans-serif] text-[21px] font-bold leading-none text-[#2540dd] sm:text-[26px]">{currencyFormatter.format(totals.grandTotal)}</div>
              <div>Tiết kiệm {currencyFormatter.format(totals.discountTotal)}</div>
            </div>
          </div>
          <button type="button" onClick={handleSubmitOrder} disabled={isSubmitting || isLoadingAddresses} className="flex h-full min-h-[64px] items-center justify-center bg-black px-3 text-[13px] font-bold uppercase text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[74px] sm:px-6 sm:text-[15px]">
            {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : 'Đặt hàng'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ZaloLogo({ className = 'h-[18px] w-[18px]' }) {
  return (
    <img
      src="/assets/images/zalo.svg"
      alt=""
      aria-hidden="true"
      className={`${className} shrink-0 object-contain`}
    />
  );
}

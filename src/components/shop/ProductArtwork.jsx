function getShapeClass(mode) {
  if (mode === 'detail') {
    return 'aspect-square rounded-[28px]';
  }

  if (mode === 'cart-thumbnail') {
    return 'aspect-square rounded-[14px]';
  }

  if (mode === 'thumbnail') {
    return 'aspect-[4/5] rounded-[16px]';
  }

  return 'aspect-[5/6] rounded-[12px]';
}

export default function ProductArtwork({
  scene = null,
  hoverScene = null,
  promoLabel,
  badge,
  mode = 'card',
  showEyebrow = true,
}) {
  const isCard = mode === 'card';
  const isDetail = mode === 'detail';
  const isThumbnail = mode === 'thumbnail';
  const isCartThumbnail = mode === 'cart-thumbnail';
  const isCompactThumbnail = isThumbnail || isCartThumbnail;
  const shapeClass = getShapeClass(mode);
  const borderClass = isCard
    ? 'border-0'
    : isDetail
      ? 'border-0'
    : isCartThumbnail
      ? 'border border-[#f7f7f7]'
      : 'border-0';
  const badgeClasses = isCard
    ? 'inline-flex rounded-[8px] bg-[#F9F9F9] px-4 py-2 text-[12px] font-bold tracking-[0.08em] text-[#E2000F]'
    : 'inline-flex rounded-[8px] bg-[#F9F9F9] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E2000F]';
  const canSwapImages =
    isCard &&
    scene?.image &&
    hoverScene?.image &&
    hoverScene.image !== scene.image;
  const imageClass = isCartThumbnail
    ? `absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out drop-shadow ${
        canSwapImages ? 'opacity-100 group-hover:opacity-0' : ''
      }`
    : isDetail
      ? `absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-500 ease-out drop-shadow  ${
          canSwapImages ? 'opacity-100 group-hover:opacity-0' : ''
        }`
    : `absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-ou drop-shadowt ${
        canSwapImages ? 'opacity-100 group-hover:opacity-0' : ''
      }`;
  const hoverImageClass = isCartThumbnail
    ? 'absolute inset-0 h-full w-full object-cover p-3 opacity-0 transition-opacity duration-500 ease-out drop-shadow-[0_12px_22px_rgba(120,100,80,0.16)] group-hover:opacity-100'
    : 'absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100';

  if (scene?.image) {
    return (
      <div className={`relative overflow-hidden ${borderClass} ${shapeClass}`}>
        {isDetail ? (
          <>
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_34%,rgba(124,147,241,0.28),transparent_24%),radial-gradient(circle_at_76%_76%,rgba(246,191,223,0.34),transparent_28%),radial-gradient(circle_at_52%_48%,rgba(255,255,255,0.94),rgba(255,255,255,0)_62%)]" />
          </>
        ) : null}

        <img
          src={scene.image}
          alt={scene.alt ?? scene.title ?? 'Product image'}
          className={imageClass}
          loading={isCard ? 'eager' : 'lazy'}
        />

        {canSwapImages ? (
          <img
            src={hoverScene.image}
            alt={hoverScene.alt ?? hoverScene.title ?? 'Product image hover'}
            className={hoverImageClass}
            loading="lazy"
          />
        ) : null}

        {isCartThumbnail ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,255,255,0)_58%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(105,82,63,0.06)_100%)]" />
          </>
        ) : isDetail ? null : (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(17,24,39,0.02)_48%,rgba(17,24,39,0.18)_100%)]" />
        )}

        {!isCompactThumbnail ? (
          <div className={`absolute left-[3%] top-[3%] ${isDetail ? 'right-[5%]' : 'right-[36%]'}`}>
            {isDetail && showEyebrow && scene.eyebrow ? (
              <div className="inline-flex rounded-full border border-white/50 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#2f3643] backdrop-blur">
                {scene.eyebrow}
              </div>
            ) : null}

            {badge ? (
              <div className={`${isDetail && showEyebrow && scene.eyebrow ? 'mt-2' : ''} ${badgeClasses}`}>
                {badge}
              </div>
            ) : null}
          </div>
        ) : null}

        {isCard && promoLabel ? (
          <div className="absolute inset-x-0 bottom-0 flex h-[54px] items-center justify-between bg-[#2540dd] px-4 text-white">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">SRX Beauty</span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2540dd]">
              {promoLabel}
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#faf7f2,#f1ebe2)] text-center ${borderClass} ${shapeClass}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_42%)]" />
      <div className="relative z-[1] px-4 text-[#8a7d70]">
        {!isCompactThumbnail ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em]">SRX Beauty</div>
        ) : null}
        <div className={`mt-2 font-medium ${isDetail ? 'text-[18px]' : 'text-[13px]'}`}>
          {'Ch\u01b0a c\u00f3 \u1ea3nh s\u1ea3n ph\u1ea9m'}
        </div>
      </div>
    </div>
  );
}

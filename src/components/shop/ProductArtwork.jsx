function getShapeClass(mode) {
  if (mode === 'detail') {
    return 'aspect-[6/7] rounded-[32px]';
  }

  if (mode === 'thumbnail') {
    return 'aspect-[4/5] rounded-[12px]';
  }

  return 'aspect-[5/6] rounded-[12px]';
}

export default function ProductArtwork({
  scene = null,
  hoverScene = null,
  promoLabel,
  badge,
  mode = 'card',
}) {
  const isCard = mode === 'card';
  const isDetail = mode === 'detail';
  const isThumbnail = mode === 'thumbnail';
  const shapeClass = getShapeClass(mode);
  const borderClass = isCard ? 'border-0' : 'border border-[#eadfce]';
  const canSwapImages =
    isCard &&
    scene?.image &&
    hoverScene?.image &&
    hoverScene.image !== scene.image;

  if (scene?.image) {
    return (
      <div className={`relative overflow-hidden bg-[#f7f3ee] ${borderClass} ${shapeClass}`}>
        <img
          src={scene.image}
          alt={scene.alt ?? scene.title ?? 'Product image'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
            canSwapImages ? 'opacity-100 group-hover:opacity-0' : ''
          }`}
          loading={isCard ? 'eager' : 'lazy'}
        />

        {canSwapImages ? (
          <img
            src={hoverScene.image}
            alt={hoverScene.alt ?? hoverScene.title ?? 'Product image hover'}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            loading="lazy"
          />
        ) : null}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(17,24,39,0.02)_48%,rgba(17,24,39,0.18)_100%)]" />

        {!isThumbnail ? (
          <div className={`absolute left-[5%] top-[5%] ${isDetail ? 'right-[5%]' : 'right-[36%]'}`}>
            {isDetail && scene.eyebrow ? (
              <div className="inline-flex rounded-full border border-white/50 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#2f3643] backdrop-blur">
                {scene.eyebrow}
              </div>
            ) : null}

            {badge ? (
              <div className={`${isDetail && scene.eyebrow ? 'mt-3' : ''} inline-flex rounded-full bg-[#111111] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white`}>
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
        {!isThumbnail ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em]">SRX Beauty</div>
        ) : null}
        <div className={`mt-2 font-medium ${isDetail ? 'text-[18px]' : 'text-[13px]'}`}>
          {'Ch\u01b0a c\u00f3 \u1ea3nh s\u1ea3n ph\u1ea9m'}
        </div>
      </div>
    </div>
  );
}



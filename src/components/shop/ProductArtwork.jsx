const packageVariants = {
  dropper: {
    body: 'h-[42%] w-[26%] rounded-[26px_26px_18px_18px]',
    neck: 'h-[10%] w-[10%] rounded-t-[12px]',
    cap: 'h-[8%] w-[14%] rounded-full',
  },
  tube: {
    body: 'h-[50%] w-[28%] rounded-[20px_20px_28px_28px]',
    neck: 'h-[6%] w-[20%] rounded-t-[10px]',
    cap: 'h-[8%] w-[16%] rounded-[10px]',
  },
  jar: {
    body: 'h-[28%] w-[34%] rounded-[26px]',
    neck: 'h-[4%] w-[28%] rounded-t-[12px]',
    cap: 'h-[10%] w-[32%] rounded-[16px]',
  },
  bottle: {
    body: 'h-[46%] w-[24%] rounded-[20px_20px_16px_16px]',
    neck: 'h-[8%] w-[10%] rounded-t-[10px]',
    cap: 'h-[8%] w-[16%] rounded-[10px]',
  },
  pump: {
    body: 'h-[48%] w-[26%] rounded-[18px_18px_16px_16px]',
    neck: 'h-[10%] w-[10%] rounded-t-[10px]',
    cap: 'h-[6%] w-[22%] rounded-full',
  },
};

function ProductPackage({ packageType = 'bottle', accent, lightTone, darkTone, layout = 'single' }) {
  const shape = packageVariants[packageType] ?? packageVariants.bottle;

  if (layout === 'texture') {
    return (
      <div className="absolute inset-x-[12%] bottom-[12%] top-[18%]">
        <div
          className="absolute left-[6%] top-[16%] h-[42%] w-[42%] rounded-full blur-[2px]"
          style={{ background: `radial-gradient(circle at 35% 35%, ${lightTone}, ${accent})` }}
        />
        <div
          className="absolute right-[4%] bottom-[8%] h-[34%] w-[38%] rounded-[38%]"
          style={{ background: `radial-gradient(circle at 40% 40%, #ffffff, ${darkTone})` }}
        />
        <div
          className="absolute left-[28%] bottom-[18%] h-[18%] w-[28%] rotate-[-12deg] rounded-full"
          style={{ background: `linear-gradient(135deg, ${accent}, ${lightTone})` }}
        />
      </div>
    );
  }

  if (layout === 'duo') {
    return (
      <div className="absolute inset-x-[10%] bottom-[10%] top-[12%]">
        <div className="absolute bottom-0 left-[6%] h-[76%] w-[38%]">
          <div className="absolute left-1/2 top-[10%] h-[12%] w-[24%] -translate-x-1/2 rounded-t-[12px] bg-[#2a2f3f]" />
          <div
            className="absolute left-1/2 top-[22%] -translate-x-1/2 rounded-[22px]"
            style={{
              height: '58%',
              width: '70%',
              background: `linear-gradient(160deg, ${lightTone}, ${darkTone})`,
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
            }}
          />
        </div>
        <div className="absolute bottom-[4%] right-[4%] h-[52%] w-[42%]">
          <div className="absolute left-1/2 top-0 h-[18%] w-[52%] -translate-x-1/2 rounded-[18px] bg-[#f8f3ea]" />
          <div
            className="absolute left-1/2 top-[16%] -translate-x-1/2 rounded-[24px]"
            style={{
              height: '54%',
              width: '78%',
              background: `linear-gradient(160deg, #ffffff, ${lightTone})`,
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.14)',
            }}
          />
        </div>
      </div>
    );
  }

  if (layout === 'ritual') {
    return (
      <div className="absolute inset-x-[8%] bottom-[10%] top-[12%]">
        <div
          className="absolute bottom-[6%] left-[10%] h-[62%] w-[28%] rounded-[24px]"
          style={{ background: `linear-gradient(160deg, ${lightTone}, ${darkTone})`, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.16)' }}
        />
        <div
          className="absolute bottom-[6%] left-[40%] h-[40%] w-[28%] rounded-[26px]"
          style={{ background: `linear-gradient(160deg, #ffffff, ${lightTone})`, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)' }}
        />
        <div
          className="absolute bottom-[6%] right-[10%] h-[54%] w-[18%] rounded-[18px]"
          style={{ background: `linear-gradient(160deg, ${darkTone}, ${accent})`, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.16)' }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-x-[18%] bottom-[8%] top-[12%]">
      <div className={`absolute left-1/2 top-[2%] -translate-x-1/2 bg-[#232939] ${shape.cap}`} />
      <div className={`absolute left-1/2 top-[10%] -translate-x-1/2 bg-[#353b4c] ${shape.neck}`} />
      <div
        className={`absolute left-1/2 top-[18%] -translate-x-1/2 ${shape.body}`}
        style={{
          background: `linear-gradient(165deg, ${lightTone}, ${darkTone})`,
          boxShadow: '0 24px 50px rgba(15, 23, 42, 0.18)',
        }}
      >
        <div className="absolute inset-x-[16%] top-[14%] h-[18%] rounded-full bg-white/55" />
        <div className="absolute inset-x-[18%] bottom-[16%] top-[34%] rounded-[18px] border border-white/25 bg-white/12" />
      </div>
    </div>
  );
}

export default function ProductArtwork({
  scene,
  hoverScene = null,
  promoLabel,
  badge,
  mode = 'card',
}) {
  const [first, second] = scene.palette;
  const isCard = mode === 'card';
  const isDetail = mode === 'detail';
  const isThumbnail = mode === 'thumbnail';
  const lightTone = '#fffaf4';
  const darkTone = second;
  const cardShapeClass = isDetail
    ? 'aspect-[6/7] rounded-[32px]'
    : isThumbnail
      ? 'aspect-[4/5] rounded-[18px]'
      : 'aspect-[5/6] rounded-[18px]';
  const borderClass = isCard ? 'border-0' : 'border border-[#eadfce]';
  const canSwapImages =
    isCard &&
    scene.image &&
    hoverScene?.image &&
    hoverScene.image !== scene.image;

  if (scene.image) {
    return (
      <div
        className={`relative overflow-hidden ${borderClass} ${cardShapeClass}`}
        style={{
          background: `linear-gradient(145deg, ${first}, ${second})`,
        }}
      >
        <img
          src={scene.image}
          alt={scene.alt ?? scene.title ?? 'Product artwork'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
            canSwapImages ? 'opacity-100 group-hover:opacity-0' : ''
          }`}
          loading={isCard ? 'eager' : 'lazy'}
        />
        {canSwapImages ? (
          <img
            src={hoverScene.image}
            alt={hoverScene.alt ?? hoverScene.title ?? 'Product artwork hover'}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            loading="lazy"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(16,24,40,0.04)_44%,rgba(17,24,39,0.24)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_34%)]" />

        {!isThumbnail ? (
          <div className={`absolute left-[5%] top-[5%] ${isDetail ? 'right-[5%]' : 'right-[36%]'}`}>
            {isDetail && scene.eyebrow ? (
              <div className="inline-flex rounded-full border border-white/50 bg-white/78 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#2f3643] backdrop-blur">
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

        <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(180deg,transparent,rgba(17,24,39,0.26))]" />

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
      className={`relative overflow-hidden ${borderClass} ${cardShapeClass}`}
      style={{
        background: `linear-gradient(145deg, ${first}, ${second})`,
      }}
    >
      <div
        className="absolute -right-[8%] top-[8%] h-[38%] w-[38%] rounded-full blur-3xl"
        style={{ backgroundColor: `${scene.accent}33` }}
      />
      <div
        className="absolute -left-[14%] bottom-[4%] h-[42%] w-[42%] rounded-full blur-3xl"
        style={{ backgroundColor: `${scene.accent}20` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.55),transparent_30%)]" />

      <div
        className={`absolute right-[3%] top-[4%] font-black uppercase tracking-[-0.08em] text-white/55 ${
          isDetail ? 'text-[136px]' : isThumbnail ? 'text-[42px]' : 'text-[88px]'
        }`}
      >
        {scene.word}
      </div>

      {!isThumbnail ? (
        <div className={`absolute left-[5%] top-[5%] ${isDetail ? 'right-[5%]' : 'right-[36%]'}`}>
          {isDetail ? (
            <div className="inline-flex rounded-full border border-white/40 bg-white/72 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#2f3643] backdrop-blur">
              {scene.eyebrow}
            </div>
          ) : null}
          {badge ? (
            <div className={`${isDetail ? 'mt-3' : ''} inline-flex rounded-full bg-[#111111] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white`}>
              {badge}
            </div>
          ) : null}
        </div>
      ) : null}

      <ProductPackage
        packageType={scene.packageType}
        accent={scene.accent}
        lightTone={lightTone}
        darkTone={darkTone}
        layout={scene.layout}
      />

      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(180deg,transparent,rgba(17,24,39,0.16))]" />

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

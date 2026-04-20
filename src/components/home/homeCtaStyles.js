export const homeButtonBaseClass =
  "group relative isolate inline-flex min-h-[46px] items-center justify-center overflow-hidden rounded-full px-5 py-[12px] text-[14px] font-medium leading-none tracking-[-0.03em] transition-all duration-300 ease-out hover:-translate-y-1 sm:min-h-[48px] sm:text-[15px]";

export const homeButtonHighlightClass =
  "pointer-events-none absolute inset-x-[10%] top-[8%] h-[58%] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(255,255,255,0))] opacity-90 transition-opacity duration-300 group-hover:opacity-100";

export const homeButtonSheenClass =
  "pointer-events-none absolute inset-y-[16%] left-[-32%] w-[34%] -skew-x-[24deg] rounded-full bg-white/45 opacity-0 blur-md transition-[left,opacity] duration-500 ease-out group-hover:left-[112%] group-hover:opacity-70";

export const homePrimaryButtonClass =
  `${homeButtonBaseClass} bg-[linear-gradient(123deg,#eea0eb_-12%,#807ae9_88.69%)] text-white shadow-[0_1px_1px_rgba(136,138,227,0.48),0_4px_8px_rgba(136,138,227,0.34),0_10px_18px_rgba(190,126,224,0.34),inset_0_0_2px_rgba(30,33,115,0.22)] hover:bg-[linear-gradient(123deg,#f4acf0_-12%,#7c73ee_88.69%)] hover:shadow-[0_2px_3px_rgba(136,138,227,0.5),0_8px_16px_rgba(136,138,227,0.36),0_16px_28px_rgba(189,117,223,0.42),inset_0_0_2px_rgba(30,33,115,0.24)]`;

export const homeSecondaryButtonClass =
  `${homeButtonBaseClass} border border-white/90 bg-[linear-gradient(123deg,#fbfbff_-12%,#ffffff_88.69%)] text-[#8b97ee] shadow-[0_1px_1px_rgba(136,138,227,0.24),0_4px_8px_rgba(136,138,227,0.16),0_11px_20px_rgba(181,171,242,0.34),inset_0_0_2px_rgba(30,33,115,0.12)] hover:bg-[linear-gradient(123deg,#ffffff_-12%,#f4f6ff_88.69%)] hover:text-[#7684ea] hover:shadow-[0_2px_3px_rgba(136,138,227,0.26),0_8px_16px_rgba(136,138,227,0.18),0_16px_28px_rgba(181,171,242,0.42),inset_0_0_2px_rgba(30,33,115,0.14)]`;

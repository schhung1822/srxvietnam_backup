import React from "react";

const PageTransition = ({
  logoSrc = "/assets/images/header/logo_primary.webp",
  transitionPhase = "hidden",
}) => {
  if (transitionPhase === "hidden") {
    return null;
  }

  const animationClass =
    transitionPhase === "covering"
      ? "animate-page-transition-fade-in"
      : "animate-page-transition-fade-out";

  return (
    <>
      <div
        className={`page-transition fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm ${animationClass}`}
      >
        <div className="flex items-center justify-center">
          <img
            src={logoSrc}
            alt="SRX Logo"
            className="h-auto w-[120px] select-none object-contain opacity-90 md:w-[180px]"
            style={{
              animation:
                transitionPhase === "covering"
                  ? "pageTransitionLogoFadeIn 0.28s ease-out forwards"
                  : "pageTransitionLogoFadeOut 0.24s ease-in forwards",
            }}
            draggable="false"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes pageTransitionFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pageTransitionFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes pageTransitionLogoFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.92;
          }
        }

        @keyframes pageTransitionLogoFadeOut {
          from {
            opacity: 0.92;
          }
          to {
            opacity: 0;
          }
        }

        .animate-page-transition-fade-in {
          animation: pageTransitionFadeIn 0.24s ease-out forwards;
        }

        .animate-page-transition-fade-out {
          animation: pageTransitionFadeOut 0.3s ease-in forwards;
        }
      `}</style>
    </>
  );
};

export default PageTransition;

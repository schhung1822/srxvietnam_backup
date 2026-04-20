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
      ? "animate-page-transition-cover"
      : "animate-page-transition-reveal";

  return (
    <>
      <div className={`page-transition fixed inset-0 z-[9999] flex items-center justify-center bg-white ${animationClass}`}>
        <div className="flex items-center justify-center">
          <img
            src={logoSrc}
            alt="SRX Logo"
            className="h-20 w-20 object-contain opacity-90 md:h-28 md:w-28"
            style={{
              animation:
                transitionPhase === "covering"
                  ? "pageTransitionLogoIn 0.45s ease-out forwards"
                  : "pageTransitionLogoOut 0.35s ease-in forwards",
            }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes pageTransitionCover {
          from {
            transform: translate3d(100%, 0, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes pageTransitionReveal {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-100%, 0, 0);
          }
        }

        @keyframes pageTransitionLogoIn {
          from {
            opacity: 0;
            transform: scale(0.84);
          }
          to {
            opacity: 0.92;
            transform: scale(1);
          }
        }

        @keyframes pageTransitionLogoOut {
          from {
            opacity: 0.92;
            transform: scale(1);
          }
          to {
            opacity: 0.64;
            transform: scale(0.96);
          }
        }

        .animate-page-transition-cover {
          animation: pageTransitionCover 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-page-transition-reveal {
          animation: pageTransitionReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default PageTransition;

import type { BoxBrandingProps } from "./BoxBranding.types";

/**
 * Component for displaying the branding section of the BoxWidget
 */
export const BoxBranding = ({ show, themeClasses }: BoxBrandingProps) => {
  if (!show) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 pt-1">
      <div className={themeClasses.brandingDividerClasses} />
      <a
        href="https://deadlock-api.com"
        target="_blank"
        rel="noopener noreferrer"
        className={themeClasses.brandingLinkClasses}
        aria-label="Visit deadlock-api.com"
        tabIndex={0}
      >
        <span className={themeClasses.brandingTextClasses.primary}>Widget by</span>
        <span className={themeClasses.brandingTextClasses.secondary}>deadlock-api.com</span>
      </a>
      <div className={themeClasses.brandingDividerClasses} />
    </div>
  );
};

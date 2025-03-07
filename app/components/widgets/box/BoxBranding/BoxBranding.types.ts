/**
 * Props for the BoxBranding component
 */
export interface BoxBrandingProps {
  /** Whether to show the branding section */
  show: boolean;
  /** Theme-related class names */
  themeClasses: {
    /** Class name for the branding divider */
    brandingDividerClasses: string;
    /** Class name for the branding link */
    brandingLinkClasses: string;
    /** Class names for the branding text */
    brandingTextClasses: {
      /** Class for the primary text */
      primary: string;
      /** Class for the secondary text */
      secondary: string;
    };
  };
}

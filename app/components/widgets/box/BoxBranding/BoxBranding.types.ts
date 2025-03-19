/**
 * Props for the BoxBranding component
 */
export interface BoxBrandingProps {
  /** Theme-related class names */
  themeClasses: {
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

import { type FC } from "react";
import { StatImageProps } from "./StatImage.types";

/**
 * Component for displaying an image statistic
 */
export const StatImage = ({ value, label }: StatImageProps) => {
  return <img src={value} alt={label} className="w-16" />;
}; 
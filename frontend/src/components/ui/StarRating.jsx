import React, { memo } from "react";
import { Star } from "lucide-react";

/**
 * Reusable star rating display.
 * @param {number} value - rating value from 1-5.
 */
const StarRating = memo(({ value }) => (
  <div
    className="flex gap-1"
    aria-label={`Rating: ${value} out of 5`}
  >
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={15}
        fill={i < value ? "#D4AF37" : "transparent"}
        color="#D4AF37"
      />
    ))}
  </div>
));

StarRating.displayName = "StarRating";

export default StarRating;

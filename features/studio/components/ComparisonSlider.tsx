"use client";

import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/components/ui/compare-slider";

interface Props {
  beforeUrl: string;
  afterUrl: string;
}

export function ComparisonSlider({ beforeUrl, afterUrl }: Props) {
  return (
    <CompareSlider defaultValue={50} className="h-full w-full rounded-none">
      {/* DiceUI's <After> renders the left side and <Before> the right side —
          opposite of the names — so swap content to keep "trước" on the left. */}
      <CompareSliderAfter>
        <img src={beforeUrl} alt="Trước" draggable={false} className="h-full w-full object-contain" />
        <div className="absolute inset-0 bg-black/10" />
      </CompareSliderAfter>
      <CompareSliderBefore>
        <img src={afterUrl} alt="Sau" draggable={false} className="h-full w-full object-contain" />
      </CompareSliderBefore>
      <CompareSliderHandle />
    </CompareSlider>
  );
}

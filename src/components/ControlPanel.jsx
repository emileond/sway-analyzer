/**
 * ControlPanel – Alpha slider + Reset, designed to live inside a Popover.
 */
import { Button, Label, Slider } from "@heroui/react";

export default function ControlPanel({ alpha, onAlphaChange, onReset, roundCount }) {
  return (
    <div className="flex flex-col gap-4 w-full min-w-[260px]">
      <Slider
        minValue={0.1}
        maxValue={0.5}
        step={0.05}
        value={alpha}
        onChange={onAlphaChange}
        aria-label="Alpha smoothing factor"
      >
        <Label className="text-sm">
          Smoothing Factor α = {alpha.toFixed(2)}
        </Label>
        <Slider.Output />
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      <p className="text-xs text-muted leading-relaxed">
        <strong>α = {alpha.toFixed(2)}</strong> —{" "}
        {alpha <= 0.15
          ? "Very slow adaptation. Historical performance dominates."
          : alpha <= 0.3
            ? "Balanced weighting. Retains memory while responding to shifts."
            : "Fast adaptation. Recent rounds dominate the trend."}
      </p>

      <div className="flex items-center gap-3">
        <Button variant="danger" onPress={onReset} isDisabled={roundCount === 0} size="sm">
          Reset Game
        </Button>
        {roundCount > 0 && (
          <span className="text-xs text-muted">{roundCount} rounds</span>
        )}
      </div>
    </div>
  );
}

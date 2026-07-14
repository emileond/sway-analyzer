/**
 * ControlPanel – Deck count + New Shoe + Alpha slider + Reset.
 */
import { Button, Label, Slider } from "@heroui/react";

export default function ControlPanel({ alpha, onAlphaChange, onReset, onNewShoe, roundCount, totalDecks, onDeckChange }) {
  return (
    <div className="flex flex-col gap-4 w-full min-w-[260px]">
      {/* Deck count selector */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm">Number of Decks: {totalDecks}</Label>
        <div className="flex gap-1.5">
          {[4, 6, 8].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={totalDecks === d ? "primary" : "secondary"}
              onPress={() => onDeckChange(d)}
              className="flex-1"
            >
              {d} Deck{d > 1 ? "s" : ""}
            </Button>
          ))}
        </div>
      </div>

      <Slider
        minValue={0.1}
        maxValue={0.5}
        step={0.05}
        value={alpha}
        onChange={onAlphaChange}
        aria-label="Alpha smoothing factor"
      >
        <Label className="text-sm">
          Trend Smoothing α = {alpha.toFixed(2)}
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
          Reset All
        </Button>
        <Button variant="secondary" onPress={onNewShoe} size="sm">
          New Shoe
        </Button>
        {roundCount > 0 && (
          <span className="text-xs text-muted">{roundCount} rounds</span>
        )}
      </div>
    </div>
  );
}

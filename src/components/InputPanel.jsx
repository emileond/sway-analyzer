/**
 * InputPanel – Round result buttons for blackjack (Win / Loss / Push).
 */
import { Button } from "@heroui/react";

export default function InputPanel({ onResult, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-3 text-xs font-semibold"
          onPress={() => onResult("A")}
        >
          Win
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 px-3 text-xs"
          onPress={() => onResult("Tie")}
        >
          Push
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="h-7 px-3 text-xs font-semibold"
          onPress={() => onResult("B")}
        >
          Loss
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2">
        <Button
          variant="primary"
          className="flex-1 h-14 text-base font-semibold"
          onPress={() => onResult("A")}
        >
          Win
        </Button>
        <Button
          variant="danger"
          className="flex-1 h-14 text-base font-semibold"
          onPress={() => onResult("B")}
        >
          Loss
        </Button>
      </div>
      <Button
        variant="secondary"
        className="w-full"
        onPress={() => onResult("Tie")}
      >
        Push
      </Button>
    </div>
  );
}

/**
 * InputPanel – Score buttons.
 * Compact mode: all 3 buttons in a single horizontal row.
 */
import { Button } from "@heroui/react";

export default function InputPanel({ onScore, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-3 text-xs font-semibold"
          onPress={() => onScore("A")}
        >
          A +
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 px-3 text-xs"
          onPress={() => onScore("Tie")}
        >
          Tie
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="h-7 px-3 text-xs font-semibold"
          onPress={() => onScore("B")}
        >
          B +
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
          onPress={() => onScore("A")}
        >
          A Wins
        </Button>
        <Button
          variant="danger"
          className="flex-1 h-14 text-base font-semibold"
          onPress={() => onScore("B")}
        >
          B Wins
        </Button>
      </div>
      <Button
        variant="secondary"
        className="w-full"
        onPress={() => onScore("Tie")}
      >
        Tie / Empate
      </Button>
    </div>
  );
}

/**
 * InputPanel – Score buttons redesigned to sit alongside the ScoreCard.
 * Large primary/danger buttons for A and B, smaller tie button below.
 */
import { Button } from "@heroui/react";

export default function InputPanel({ onScore }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* A and B side by side */}
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
      {/* Tie across full width */}
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

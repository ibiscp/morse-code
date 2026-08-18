import { MorseTrainer } from "@/components/MorseTrainer";
import { BackLink } from "@/components/BackLink";

export default function PracticePage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-16">
      <BackLink />
      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <MorseTrainer />
      </div>
    </div>
  );
}

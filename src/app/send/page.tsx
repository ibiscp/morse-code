import { MorseEmitter } from "@/components/MorseEmitter";
import { BackLink } from "@/components/BackLink";

export default function SendPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-16">
      <BackLink />
      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <MorseEmitter />
      </div>
    </div>
  );
}

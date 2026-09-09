import { registerRoot, Composition } from "remotion";
import { HypeTrailer }     from "./Reel1";
import { WhyJoin }         from "./Reel2";
import { RealizationReel } from "./Reel3";
import { TaylorSwiftLore } from "./Reel4";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="HypeTrailer"
        component={HypeTrailer}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="WhyJoin"
        component={WhyJoin}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="RealizationReel"
        component={RealizationReel}
        durationInFrames={480}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TaylorSwiftLore"
        component={TaylorSwiftLore}
        durationInFrames={480}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

registerRoot(RemotionRoot);

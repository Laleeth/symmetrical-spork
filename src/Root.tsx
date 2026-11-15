import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { BarbersShort, BARBER_FRAMES } from "./videos/barbers/Barbers";
import { MonoShort, MONO_FRAMES } from "./videos/mono/Mono";
import { PuddingShort, PUDDING_FRAMES } from "./videos/pudding/Pudding";
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BarbersShort" component={BarbersShort} durationInFrames={BARBER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PuddingShort" component={PuddingShort} durationInFrames={PUDDING_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MonoShort" component={MonoShort} durationInFrames={MONO_FRAMES} fps={30} width={1080} height={1920} />
  </>
);

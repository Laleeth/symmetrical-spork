import React from "react";
import { Composition, registerRoot } from "remotion";
import { MonoShort, MONO_FRAMES } from "../../videos/mono_diner/Mono";
const Root: React.FC = () => <Composition id="MonoShort" component={MonoShort} durationInFrames={MONO_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

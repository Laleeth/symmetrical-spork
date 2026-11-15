import React from "react";
import { Composition, registerRoot } from "remotion";
import { BarbersShort, BARBER_FRAMES } from "../../videos/barbers_w/Barbers";
const Root: React.FC = () => <Composition id="BarbersShort" component={BarbersShort} durationInFrames={BARBER_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

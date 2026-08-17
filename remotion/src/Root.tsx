import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "./theme";
import { reelDuration } from "./components/Reel";
import { SetupSubscription } from "./compositions/SetupSubscription";
import { SelfServiceTour } from "./compositions/SelfServiceTour";
import { RetryToRecovery } from "./compositions/RetryToRecovery";
import { NotificationEmails } from "./compositions/NotificationEmails";
import { AddCardFlow } from "./compositions/AddCardFlow";

const base = { fps: VIDEO.fps, width: VIDEO.width, height: VIDEO.height };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="setup-subscription" component={SetupSubscription} durationInFrames={reelDuration(2)} {...base} />
    <Composition id="self-service-tour" component={SelfServiceTour} durationInFrames={reelDuration(3)} {...base} />
    <Composition id="retry-to-recovery" component={RetryToRecovery} durationInFrames={reelDuration(2)} {...base} />
    <Composition id="notification-emails" component={NotificationEmails} durationInFrames={reelDuration(3)} {...base} />
    <Composition id="add-card-flow" component={AddCardFlow} durationInFrames={reelDuration(2)} {...base} />
  </>
);

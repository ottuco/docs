import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "./theme";
import { SetupSubscription } from "./compositions/SetupSubscription";
import { SelfServiceTour } from "./compositions/SelfServiceTour";
import { RetryToRecovery } from "./compositions/RetryToRecovery";
import { NotificationEmails } from "./compositions/NotificationEmails";
import { AddCardFlow } from "./compositions/AddCardFlow";

const base = { fps: VIDEO.fps, width: VIDEO.width, height: VIDEO.height };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="setup-subscription"
      component={SetupSubscription}
      durationInFrames={VIDEO.fps * 14}
      {...base}
    />
    <Composition
      id="self-service-tour"
      component={SelfServiceTour}
      durationInFrames={VIDEO.fps * 12}
      {...base}
    />
    <Composition
      id="retry-to-recovery"
      component={RetryToRecovery}
      durationInFrames={VIDEO.fps * 12}
      {...base}
    />
    <Composition
      id="notification-emails"
      component={NotificationEmails}
      durationInFrames={VIDEO.fps * 8}
      {...base}
    />
    <Composition
      id="add-card-flow"
      component={AddCardFlow}
      durationInFrames={VIDEO.fps * 11}
      {...base}
    />
  </>
);

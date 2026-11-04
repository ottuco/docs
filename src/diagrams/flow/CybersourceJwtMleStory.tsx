// Story diagram: one CyberSource REST request in JWT with Message-Level Encryption mode.
// Usage in MDX:  import CybersourceJwtMleStory from "@site/src/diagrams/flow/CybersourceJwtMleStory";  <CybersourceJwtMleStory />
import React from "react";
import {
  mdiAlertOctagonOutline,
  mdiBankTransfer,
  mdiCheckDecagramOutline,
  mdiCogOutline,
  mdiKeyChainVariant,
  mdiLockOpenVariantOutline,
  mdiLockOutline,
  mdiSend,
  mdiServer,
  mdiShieldCheckOutline,
  mdiStoreSearchOutline,
} from "@mdi/js";
import {
  StoryDiagram,
  type StoryLane,
  type StoryLink,
  type StoryStep,
  type StoryJourney,
} from "@site/src/components/FlowDiagram";

const lanes: StoryLane[] = [
  {
    title: "You (merchant)",
    icon: mdiServer,
    chip: "Your part",
    about: {
      does: "Starts a payment or an operation such as a refund, and checks the Business Center if Ottu reports an unknown outcome.",
      relies: "Ottu to send the request and read the reply.",
    },
  },
  {
    title: "Ottu",
    icon: mdiShieldCheckOutline,
    chip: "Ottu's part",
    about: {
      does: "Encrypts each request, signs it with a JWT, decrypts the reply, and pauses the MID if it cannot.",
      relies: "The keys and certificate you saved in the MID settings.",
    },
  },
  {
    title: "CyberSource",
    icon: mdiBankTransfer,
    chip: "CyberSource's part",
    about: {
      does: "Checks the JWT, decrypts the request, processes it and encrypts the reply.",
      relies: "The request certificate and Response MLE key you generated in the Business Center.",
    },
  },
];

const steps: StoryStep[] = [
  {
    lane: 0,
    title: "Starts a payment or refund",
    sub: "Dashboard or API",
    icon: mdiSend,
    detail:
      "A payment, refund, capture, void or status check that uses the CyberSource REST API.",
  },
  {
    lane: 1,
    title: "Checks the MID settings",
    sub: "Keys and pause",
    icon: mdiCogOutline,
    detail:
      "Ottu stops here with an error if the JWT + MLE settings are incomplete or the MID is paused.",
  },
  {
    lane: 1,
    title: "Encrypts the request",
    sub: "Request certificate",
    icon: mdiLockOutline,
    tone: "accent",
    detail:
      "Ottu encrypts the request body with the CyberSource request MLE certificate.",
  },
  {
    lane: 1,
    title: "Signs a JWT",
    sub: "API key or signing .p12",
    icon: mdiKeyChainVariant,
    detail:
      "The JWT is signed with your API key ID and API secret key, or with the JWT signing .p12 if you uploaded one.",
  },
  {
    lane: 2,
    title: "Processes the request",
    sub: "Host from the MID",
    icon: mdiCheckDecagramOutline,
    detail:
      "CyberSource verifies the JWT, decrypts the request and carries out the operation.",
  },
  {
    lane: 2,
    title: "Replies encrypted",
    sub: "Response MLE key",
    icon: mdiLockOutline,
    tone: "info",
    detail:
      "CyberSource encrypts the reply for your Response MLE key. A request it refuses before encryption, such as a bad token, comes back as plain JSON.",
  },
  {
    lane: 1,
    title: "Decrypts the reply",
    sub: "Response MLE key",
    icon: mdiLockOpenVariantOutline,
    tone: "accent",
    detail:
      "Ottu decrypts the reply with the Response MLE .p12 key and its password.",
  },
  {
    lane: 0,
    title: "Sees the result",
    sub: "Paid, refunded or declined",
    icon: mdiCheckDecagramOutline,
    tone: "success",
    detail: "The normal outcome: the operation finishes as usual.",
  },
  {
    lane: 1,
    title: "Pauses the MID",
    sub: "Outcome is unknown",
    icon: mdiAlertOctagonOutline,
    tone: "danger",
    detail:
      "If Ottu cannot decrypt a reply, CyberSource has acted but Ottu cannot tell how. Ottu pauses REST operations on this MID until its settings are saved.",
  },
  {
    lane: 0,
    title: "Checks the Business Center",
    sub: "Do not retry",
    icon: mdiStoreSearchOutline,
    detail:
      "Look the transaction up in the CyberSource Business Center before doing anything else, fix the keys, then save the MID settings to resume.",
  },
];

const links: StoryLink[] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6, undefined, "reply"],
  [6, 7, undefined, "reply"],
  [7, 8, undefined, "reply"],
  [7, 9, "cannot decrypt", "plain"],
  [9, 10, undefined, "plain"],
];

const journeys: StoryJourney[] = [
  {
    name: "Normal request",
    stops: [
      { step: 1, text: "An operation that uses the CyberSource REST API starts." },
      { step: 2, text: "Ottu checks the MID is complete and not paused." },
      { step: 3, text: "Ottu encrypts the request with the CyberSource certificate." },
      { step: 4, text: "Ottu signs a JWT for it." },
      { step: 5, text: "CyberSource verifies and processes the request." },
      { step: 6, text: "CyberSource encrypts its reply." },
      { step: 7, text: "Ottu decrypts the reply with your Response MLE key." },
      { step: 8, text: "The operation finishes with its normal result." },
    ],
  },
  {
    name: "Reply cannot be decrypted",
    stops: [
      { step: 5, text: "CyberSource processed the request." },
      { step: 6, text: "It replied, encrypted." },
      { step: 7, text: "Ottu could not decrypt the reply." },
      { step: 9, text: "Ottu pauses REST operations on this MID. The outcome is UNKNOWN." },
      { step: 10, text: "Do NOT retry. Check the Business Center, then save the MID settings to resume." },
    ],
  },
];

export default function CybersourceJwtMleStory(): React.JSX.Element {
  return (
    <StoryDiagram
      title="How a JWT + MLE request works"
      sub="Read top to bottom · click a step, or pick a path below"
      lanes={lanes}
      steps={steps}
      links={links}
      journeys={journeys}
      maxHeight={480}
    />
  );
}

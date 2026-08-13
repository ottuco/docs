import { Config } from "@remotion/cli/config";

// Size levers for the committed clips (see README hosting decision):
// higher CRF = smaller file. Clips are muted/silent by design.
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(28);
Config.setOverwriteOutput(true);

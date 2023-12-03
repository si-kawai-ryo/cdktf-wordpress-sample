import { App } from "cdktf";

import { NetworkStack } from "./lib/network";

const app = new App();
new NetworkStack(app, "network", {region: "ap-northeast-1"});
app.synth();

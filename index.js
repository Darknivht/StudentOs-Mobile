import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo";

const app = require("./App");

registerRootComponent(ExpoRoot(app));

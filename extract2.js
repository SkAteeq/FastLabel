import fs from "fs";
import { execSync } from "child_process";

try {
  execSync("tar -xzf ./node_modules/@capacitor/cli/assets/android-template.tar.gz -C ./android");
} catch(e) {
  console.error(e);
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const shell = __importStar(require("shelljs"));
async function run() {
    try {
        shell.rm("-rf", github.context.repo.repo);
        shell.exec(`git clone https://${core.getInput("github-token")}@github.com/${github.context.repo.owner}/${github.context.repo.repo}.git`);
        shell.cd(github.context.repo.repo);
        shell.exec("git config user.name github-actions");
        shell.exec("git config user.email github-actions@github.com");
        shell.exec(`git commit --allow-empty -m "empty commit"`);
        shell.exec("git push");
        shell.rm("-rf", "ORBOS");
        shell.exec(`git clone https://${core.getInput("github-token")}@github.com/caos/ORBOS.git`);
        shell.cd("ORBOS");
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
async function cleanup() {
}
if (!process.env['STATE_isPost']) {
    run();
}
else {
    cleanup();
}

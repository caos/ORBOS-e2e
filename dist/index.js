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
function run() {
    cleanup();
    let ghToken = core.getInput("github-token");
    let branchUnderTest = core.getInput("branch");
    handleErr(shell.exec(`
    set -e

    git clone --depth 0 https://${ghToken}@github.com/${github.context.repo.owner}/${github.context.repo.repo}.git
    cd ${github.context.repo.repo}
    git config user.name github-actions
    git config user.email github-actions@github.com
    git commit --allow-empty -m "empty commit"
    git push
    cd ..
    rm -rf ORBOS
    git clone --depth 0 --no-single-branch https://${ghToken}@github.com/caos/ORBOS.git
    cd ORBOS
    git tag --delete ${branchUnderTest} || true
    git checkout ${branchUnderTest}
    echo "${core.getInput("orbconfig")}" > ./orbconfig
    go run ./cmd/chore/e2e/run/*.go --orbconfig ./orbconfig ${testFlag("graphiteurl", "graphite-url")} ${testFlag("graphitekey", "graphite-key")} ${testFlag("from", "from")}
    `));
}
function testFlag(flag, input) {
    let result = core.getInput(input);
    if (result) {
        result = `--${flag} ${result}`;
    }
    return result;
}
function handleErr(result) {
    if (result.code !== 0) {
        core.setFailed(result.stderr);
        shell.exit(1);
    }
}
function cleanup() {
    handleErr(shell.rm("-rf", "ORBOS", github.context.repo.repo));
}
if (!process.env['STATE_isPost']) {
    run();
}
else {
    cleanup();
}

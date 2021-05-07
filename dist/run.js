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
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const shell = __importStar(require("shelljs"));
const helpers = __importStar(require("./helpers"));
const cu = __importStar(require("./cleanup"));
const cp = __importStar(require("./cancel"));
async function run() {
    await cu.cleanup();
    const { repo: { owner, repo }, payload: { client_payload: { from, branch, cleanup } } } = github.context;
    core.info(`from=${from}`);
    core.info(`branch=${branch}`);
    core.info(`cleanup=${cleanup}`);
    let ghToken = core.getInput("github-token");
    await cp.cancelPrevious(ghToken, owner, repo);
    helpers.handleErr(shell.exec(`
    set -exv

    git clone --depth 1 https://${ghToken}@github.com/${owner}/${repo}.git
    cd ${repo}
    git config user.name github-actions
    git config user.email github-actions@github.com
    git commit --allow-empty -m "empty commit"
    git push
    cd ..
    rm -rf ORBOS
    git clone --depth 1 --no-single-branch https://${ghToken}@github.com/caos/ORBOS.git
    cd ORBOS
    git tag --delete ${branch} || true
    git checkout ${branch}
    echo "${core.getInput("orbconfig")}" > ./orbconfig
    go run ./cmd/chore/e2e/run/*.go --orbconfig ./orbconfig ${helpers.testFlag("graphiteurl", core.getInput("graphite-url"))} ${helpers.testFlag("graphitekey", core.getInput("graphite-key"))} ${helpers.testFlag("lokiurl", core.getInput("loki-url"))} ${helpers.testFlag("from", from)} --cleanup=${cleanup}
    `));
}
exports.run = run;
run();
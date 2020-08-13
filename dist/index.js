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
    await cleanup();
    const { repo: { owner, repo }, payload: { client_payload: { from, branch } } } = github.context;
    let ghToken = core.getInput("github-token");
    await cancelPrevious(ghToken, owner, repo);
    handleErr(shell.exec(`
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
    go run ./cmd/chore/e2e/run/*.go --orbconfig ./orbconfig ${testFlag("graphiteurl", core.getInput("graphite-url"))} ${testFlag("graphitekey", core.getInput("graphite-key"))} ${testFlag("from", from)}
    `));
}
async function cancelPrevious(ghToken, owner, repo) {
    const octokit = github.getOctokit(ghToken);
    const { GITHUB_RUN_ID } = process.env;
    const { data: { workflow_id } } = await octokit.actions.getWorkflowRun({ owner, repo, run_id: Number(GITHUB_RUN_ID) });
    try {
        const { data } = await octokit.actions.listWorkflowRuns({
            owner,
            repo,
            workflow_id
        });
        core.info(`Found ${data.total_count} runs total.`);
        const runningWorkflows = data.workflow_runs.filter(workflow => workflow.head_branch === '' && workflow.head_sha !== github.context.sha && workflow.status !== 'completed');
        core.info(`Found ${runningWorkflows.length} runs in progress.`);
        for (const { id, head_sha, status } of runningWorkflows) {
            core.info(`Cancelling another run: ${id} ${head_sha} ${status}`);
            const res = await octokit.actions.cancelWorkflowRun({
                owner,
                repo,
                run_id: id
            });
            core.info(`Cancel run ${id} responded with status ${res.status}`);
        }
    }
    catch (e) {
        const msg = e.message || e;
        core.info(`Error while cancelling workflow_id ${workflow_id}: ${msg}`);
    }
}
function testFlag(flag, value) {
    return `${value ? `--${flag} ${value}` : ''}`;
}
function handleErr(result) {
    if (result.code !== 0) {
        core.setFailed("executing script failed");
        shell.exit(1);
    }
}
async function cleanup() {
    handleErr(shell.rm("-rf", "ORBOS", github.context.repo.repo));
}
const IsPost = !!process.env['STATE_isPost'];
if (!IsPost) {
    run();
}
else {
    cleanup();
}

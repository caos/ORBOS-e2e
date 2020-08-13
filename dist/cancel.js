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
exports.cancelPrevious = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
async function cancelPrevious(ghToken, owner, repo) {
    core.info("Cancelling previous runs");
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
        const runningWorkflows = data.workflow_runs.filter(workflow => workflow.head_sha !== github.context.sha && workflow.status !== 'completed');
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
exports.cancelPrevious = cancelPrevious;

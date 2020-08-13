import * as core from '@actions/core'
import * as github from '@actions/github'

export async function cancelPrevious(ghToken: string, owner: string, repo: string): Promise<void>{

    core.info("Cancelling previous runs")
  
    const octokit = github.getOctokit(ghToken)
    const { GITHUB_RUN_ID } = process.env;
  
    const {data: {workflow_id}} = await octokit.actions.getWorkflowRun({owner, repo, run_id: Number(GITHUB_RUN_ID)})
  
      try {
        const { data } = await octokit.actions.listWorkflowRuns({
          owner,
          repo,
          workflow_id
        });
        core.info(`Found ${data.total_count} runs total.`)
        const runningWorkflows = data.workflow_runs.filter(
          workflow => workflow.head_sha !== github.context.sha && workflow.status !== 'completed'
        );
        core.info(`Found ${runningWorkflows.length} runs in progress.`)
        for (const {id, head_sha, status} of runningWorkflows) {
          core.info(`Cancelling another run: ${id} ${head_sha} ${status}`);
          const res = await octokit.actions.cancelWorkflowRun({
            owner,
            repo,
            run_id: id
          });
          core.info(`Cancel run ${id} responded with status ${res.status}`);
        }
      } catch (e) {
        const msg = e.message || e;
        core.info(`Error while cancelling workflow_id ${workflow_id}: ${msg}`);
      }    
  }
  
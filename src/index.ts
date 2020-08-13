import * as core from '@actions/core'
import * as github from '@actions/github'
//import * as exec from '@actions/exec'
//import * as io from '@actions/io'
import * as shell from 'shelljs'


function run() {
    cleanup()

    const { repo: { owner, repo }, payload: { from, branch } } = github.context;

    let ghToken = core.getInput("github-token")
    cancelPrevious(ghToken, owner, repo)
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
    `
    ))
}

async function cancelPrevious(ghToken: string, owner: string, repo: string){
  const octokit = github.getOctokit(ghToken)
  const { GITHUB_RUN_ID } = process.env;

  const {data: {workflow_id}} = await octokit.actions.getWorkflowRun({owner, repo, run_id: Number(GITHUB_RUN_ID)})

    try {
      const { data } = await octokit.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id,
        branch: "master"
      });
      console.log(`Found ${data.total_count} runs total.`);
      const runningWorkflows = data.workflow_runs.filter(
        workflow => workflow.head_branch === '' && workflow.head_sha !== github.context.sha && workflow.status !== 'completed'
      );
      console.log(`Found ${runningWorkflows.length} runs in progress.`);
      for (const {id, head_sha, status} of runningWorkflows) {
        console.log('Cancelling another run: ', {id, head_sha, status});
        const res = await octokit.actions.cancelWorkflowRun({
          owner,
          repo,
          run_id: id
        });
        console.log(`Cancel run ${id} responded with status ${res.status}`);
      }
    } catch (e) {
      const msg = e.message || e;
      console.log(`Error while cancelling workflow_id ${workflow_id}: ${msg}`);
    }    
}

function testFlag(flag: string, value: string) {
  return `${value ? `--${flag} ${value}` : ''}`
}

function handleErr(result: shell.ShellString){
  if (result.code !== 0){
    core.setFailed("executing script failed")
    shell.exit(1)
  }
}


function cleanup(){
  handleErr(shell.rm("-rf", "ORBOS", github.context.repo.repo))
}

// Main
if (!process.env['STATE_isPost']) {
  run()
}
// Post
else {
  cleanup()
}


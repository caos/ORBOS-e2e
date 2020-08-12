import * as core from '@actions/core'
import * as github from '@actions/github'
import * as exec from '@actions/exec'


async function run(): Promise<void> {

  try {

//    const octokit = github.getOctokit(core.getInput('token', {required: true}))

    await exec.exec("git", ["clone", `git@github.com:${github.context.repo.owner}/${github.context.repo.owner}.git`])


  } catch (error) {
    core.setFailed(error.message)
  }
}

async function cleanup(): Promise<void> {

}

// Main
if (!process.env['STATE_isPost']) {
  run()
}
// Post
else {
  cleanup()
}


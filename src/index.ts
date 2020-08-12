import * as core from '@actions/core'
import * as github from '@actions/github'
import * as exec from '@actions/exec'


async function run(): Promise<void> {

  try {

    await exec.exec("git", ["clone", `https://${core.getInput("personal-access-token")}@github.com/${github.context.repo.owner}/${github.context.repo.repo}.git`])

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


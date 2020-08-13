import * as core from '@actions/core'
import * as github from '@actions/github'
//import * as exec from '@actions/exec'
//import * as io from '@actions/io'
import * as shell from 'shelljs'


async function run(): Promise<void> {

  try {

    shell.rm("-rf", github.context.repo.repo)
    shell.exec(`git clone https://${core.getInput("github-token")}@github.com/${github.context.repo.owner}/${github.context.repo.repo}.git`)
    shell.cd(github.context.repo.repo)

    shell.exec("git config user.name github-actions")	
    shell.exec("git config user.email github-actions@github.com")
    shell.exec(`git commit --allow-empty -m "empty commit"`)
    shell.exec("git push")

    shell.rm("-rf", "ORBOS")
    shell.exec(`git clone https://${core.getInput("github-token")}@github.com/caos/ORBOS.git`)
    shell.cd("ORBOS")

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


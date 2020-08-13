import * as core from '@actions/core'
import * as github from '@actions/github'
//import * as exec from '@actions/exec'
//import * as io from '@actions/io'
import * as shell from 'shelljs'


async function run(): Promise<void> {

  try {

    shell.rm("-rf", github.context.repo.repo)
    trowErr()
    shell.exec(`git clone https://${core.getInput("github-token")}@github.com/${github.context.repo.owner}/${github.context.repo.repo}.git`)
    trowErr()
    shell.cd(github.context.repo.repo)
    trowErr()

    shell.exec("git config user.name github-actions")
    trowErr()
    shell.exec("git config user.email github-actions@github.com")
    trowErr()
    shell.exec(`git commit --allow-empty -m "empty commit"`)
    trowErr()
    shell.exec("git push")
    trowErr()

    shell.rm("-rf", "ORBOS")
    trowErr()
    shell.exec(`git clone https://${core.getInput("github-token")}@github.com/caos/ORBOS.git`)
    trowErr()
    shell.cd("ORBOS")
    trowErr()

  } catch (error) {
    core.setFailed(error.message)
  }
}

function trowErr(){
  let err = shell.error() 
  if (err){
    throw err
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


import * as core from '@actions/core'
import * as github from '@actions/github'
//import * as exec from '@actions/exec'
//import * as io from '@actions/io'
import * as shell from 'shelljs'


function run() {
    cleanup()
    let ghToken = core.getInput("github-token")
    let branchUnderTest = core.getInput("branch")
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
    `
    ))
}

function testFlag(flag: string, input: string) {
  let result = core.getInput(input)
  if (result) {
    result = `--${flag} ${result}`
  }
  return result
}

function handleErr(result: shell.ShellString){
  if (result.code !== 0){
    core.setFailed(result.stderr)
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


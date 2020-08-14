import * as core from '@actions/core'
import * as github from '@actions/github'
import * as shell from 'shelljs'
import * as helpers from './helpers'
import * as cu from './cleanup'
import * as cp from './cancel'

export async function run(): Promise<void> {
    await cu.cleanup()

    const { repo: { owner, repo }, payload: { client_payload: { from, branch, cleanup } } } = github.context;

    core.info(`from=${from}`)
    core.info(`branch=${branch}`)
    core.info(`cleanup=${cleanup}`)

    let ghToken = core.getInput("github-token")
    await cp.cancelPrevious(ghToken, owner, repo)
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
    go run ./cmd/chore/e2e/run/*.go --orbconfig ./orbconfig ${helpers.testFlag("graphiteurl", core.getInput("graphite-url"))} ${helpers.testFlag("graphitekey", core.getInput("graphite-key"))} ${helpers.testFlag("from", from)} cleanup=${cleanup}
    `))
}

run()
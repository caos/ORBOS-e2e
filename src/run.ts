import * as core from '@actions/core'
import * as github from '@actions/github'
import * as shell from 'shelljs'
import * as helpers from './helpers'
import * as cu from './cleanup'
import * as cp from './cancel'

export async function run(): Promise<void> {
    await cu.cleanup()

    const { 
        repo: { owner, repo },
        payload: { 
            client_payload: {
                from: fromWebhook,
                branch: branchWebhook,
                cleanup: cleanupWebhook
            },
            input: {
                from: fromManual,
                branch: branchManual,
                cleanup: cleanupManual
            }
        }
    } = github.context;

    const from = fromWebhook || fromManual
    const branch = branchWebhook || branchManual
    const cleanup = core.getInput("omit-cleanup") == "true" ? false : 
        cleanupWebhook == "false" || cleanupManual == "false" ? false : true

    core.info(`from=${from}`)
    core.info(`branch=${branch}`)
    core.info(`cleanup=${cleanup}`)

    core.setOutput("from", from)
    core.setOutput("branch", branch)
    core.setOutput("cleanup", cleanup)

    const dryRun = core.getInput("dry-run") == "true"

    let ghToken = "xxxxx"

    if (!dryRun) {
        ghToken = core.getInput("github-token")
    }
 
    let script = `
    set -ev

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
    echo "${core.getInput("orbconfig", {required: true})}" > ./orbconfig
    go run ./cmd/chore/e2e/run/*.go --orbconfig ./orbconfig ${helpers.testFlag("graphiteurl", core.getInput("graphite-url"), false)} ${helpers.testFlag("graphitekey", core.getInput("graphite-key"), dryRun)} ${helpers.testFlag("lokiurl", core.getInput("loki-url"), dryRun)} ${helpers.testFlag("from", from, false)} --cleanup=${cleanup}
    `

    if (dryRun) {
        script = `echo "Not executing the following script in dry run mode"
        echo "${script}"`
    } else {
        await cp.cancelPrevious(ghToken, owner, repo)
    }

    helpers.handleErr(shell.exec(script))
}

run()
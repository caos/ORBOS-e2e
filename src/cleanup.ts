import * as helpers from './helpers'
import * as shell from 'shelljs'
import * as github from '@actions/github'


export async function cleanup(): Promise<void>{
    helpers.handleErr(shell.rm("-rf", "ORBOS", github.context.repo.repo))
}

cleanup()

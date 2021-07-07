import * as shell from 'shelljs'
import * as core from '@actions/core'

export function testFlag(flag: string, value: string, mask: boolean) {
    return `${value ? `--${flag} ${mask ? "xxxxxx" : value}` : ''}`
}
  
export function handleErr(result: shell.ShellString){
    if (result.code !== 0){
        core.setFailed("executing script failed")
        shell.exit(1)
    }
}
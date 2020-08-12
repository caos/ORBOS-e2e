import * as core from '@actions/core'
/*
import * as coreCommand from '@actions/core/lib/command'
import * as gitSourceProvider from 'checkout/src/git-source-provider'
import * as inputHelper from 'checkout/src//input-helper'
import * as path from 'path'
import * as stateHelper from 'checkout/src//state-helper'
import * as cancel from 'cancel-workflow-action'
*/
core.info("It works")

/*
async function run(): Promise<void> {


  try {

    await checkout()

    cancel()



  } catch (error) {
    core.setFailed(error.message)
  }
}

async function cleanup(): Promise<void> {
  try {
    await gitSourceProvider.cleanup(stateHelper.RepositoryPath)
  } catch (error) {
    core.warning(error.message)
  }
}

// Main
if (!stateHelper.IsPost) {
  run()
}
// Post
else {
  cleanup()
}

async function checkout(){
  const sourceSettings = inputHelper.getInputs()

  try {
    // Register problem matcher
    coreCommand.issueCommand(
      'add-matcher',
      {},
      path.join(__dirname, 'problem-matcher.json')
    )

    // Get sources
    await gitSourceProvider.getSource(sourceSettings)
  } finally {
    // Unregister problem matcher
    coreCommand.issueCommand('remove-matcher', {owner: 'checkout-git'}, '')
  }  
}
*/
'use strict';

import core from '@actions/core';
import {ReleaseType, inc} from 'semver';

function run(): void {
  try {
    const inputVersion = core.getInput('version');
    const inputType = core.getInput('type');

    const versionRegex = /(\d+).(\d+).(\d+)/;
    const matchedVersion = inputVersion.match(versionRegex);
    const version = matchedVersion === null ? '0.0.0' : matchedVersion[0];
    const nextVersion = inc(version, inputType as ReleaseType);
    if (nextVersion === null) {
      throw new Error(`could not determine next version: ${version}`);
    }

    core.debug(`next version: ${nextVersion}`);
    core.setOutput('next_version_number', nextVersion);
    core.setOutput(
      'next_version',
      inputVersion.replace(/(\d+).(\d+).(\d+)/, nextVersion),
    );
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(e.message);
    }
  }
}

run();

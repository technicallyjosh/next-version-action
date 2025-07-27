import * as core from '@actions/core';
import semver from 'semver';
import {exec} from '@actions/exec';

/**
 * Represents the input parameters for the action.
 *
 * @property {string} version - The version string to be processed.
 * @property {semver.ReleaseType} type - The type of versioning or release (e.g., 'major', 'minor', 'patch').
 * @property {string} pattern - The pattern used to match or validate the version string.
 */
type Input = {
  version: string;
  type: semver.ReleaseType;
  pattern: string;
};

/**
 * The main function for the action.
 */
export async function run(): Promise<void> {
  try {
    const input = getInput();

    // Default to the input version.
    let currentVersion = input.version;

    core.debug(`currentVersion: ${currentVersion}`);

    if (currentVersion === '' || input.pattern !== '') {
      let out = '';
      let err = '';

      await exec(
        'git',
        ['describe', '--tags', `--match="${input.pattern}"`, '--abbrev=0"'],
        {
          listeners: {
            stdout: (data: Buffer) => {
              out += data.toString();
            },
            stderr: (data: Buffer) => {
              err += data.toString();
            },
          },
        },
      );

      if (err !== '') {
        throw new Error(`describe failed for pattern: ${input.pattern}`);
      }

      if (out === '') {
        throw new Error(`describe resulted with empty tag: ${input.pattern}`);
      }

      currentVersion = out;
      core.debug(`current version: ${currentVersion}`);
    }

    const versionRegex = /(\d+).(\d+).(\d+)/;
    const matchedVersion = currentVersion.match(versionRegex);
    const version = matchedVersion === null ? '0.0.0' : matchedVersion[0];
    const nextVersion = semver.inc(version, input.type as semver.ReleaseType);
    if (nextVersion === null) {
      throw new Error(`could not determine next version: ${version}`);
    }

    core.debug(`next version: ${nextVersion}`);
    core.setOutput('current_version', currentVersion);
    core.setOutput('next_version_number', nextVersion);
    core.setOutput(
      'next_version',
      currentVersion.replace(/(\d+).(\d+).(\d+)/, nextVersion),
    );
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(e.message);
    }

    throw e;
  }
}

/**
 * Retrieves and returns the action inputs required for the action.
 */
function getInput(): Input {
  const version = core.getInput('version', {trimWhitespace: true});
  const type = (core.getInput('type') || 'minor') as semver.ReleaseType;
  let pattern = core.getInput('pattern', {trimWhitespace: true});

  if (version === '' && pattern === '') {
    pattern = 'v[0-9]*';
  }

  return {
    version,
    type,
    pattern,
  };
}

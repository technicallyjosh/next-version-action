import * as core from '../__fixtures__/core';
import * as exec from '../__fixtures__/exec';
import {expect, describe} from '@jest/globals';
import {jest} from '@jest/globals';

jest.unstable_mockModule('@actions/core', () => core);
jest.unstable_mockModule('@actions/exec', () => exec);

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const {run} = await import('../src/main.js');

describe('run', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('default pattern minor works', async () => {
    mock({}, 'v1.0.0');

    await run();

    expect(exec.exec).toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'current_version',
      'v1.0.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'next_version_number',
      '1.1.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'next_version', 'v1.1.0');
  });

  it('default pattern major works', async () => {
    mock({type: 'major'}, 'v1.0.0');

    await run();

    expect(exec.exec).toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'current_version',
      'v1.0.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'next_version_number',
      '2.0.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'next_version', 'v2.0.0');
  });

  it('default pattern patch works', async () => {
    mock({type: 'patch'}, 'v1.0.0');

    await run();

    expect(exec.exec).toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'current_version',
      'v1.0.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'next_version_number',
      '1.0.1',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'next_version', 'v1.0.1');
  });

  it('custom pattern minor works', async () => {
    mock({pattern: 'pkg/test/v*'}, 'pkg/test/v1.0.0');

    await run();

    expect(exec.exec).toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'current_version',
      'pkg/test/v1.0.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'next_version_number',
      '1.1.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      3,
      'next_version',
      'pkg/test/v1.1.0',
    );
  });

  it('custom pattern major works', async () => {
    mock({pattern: 'pkg/test/v*'}, 'pkg/test/v1.0.0');

    await run();

    expect(exec.exec).toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'current_version',
      'pkg/test/v1.0.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'next_version_number',
      '1.1.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      3,
      'next_version',
      'pkg/test/v1.1.0',
    );
  });

  it('version minor works', async () => {
    mock({version: 'v2.1.0'});

    await run();

    expect(exec.exec).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'current_version',
      'v2.1.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'next_version_number',
      '2.2.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'next_version', 'v2.2.0');
  });

  it('version major works', async () => {
    mock({version: 'v2.1.0', type: 'major'});

    await run();

    expect(exec.exec).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'current_version',
      'v2.1.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'next_version_number',
      '3.0.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'next_version', 'v3.0.0');
  });

  it('version patch works', async () => {
    mock({version: 'v2.1.0', type: 'patch'});

    await run();

    expect(exec.exec).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'current_version',
      'v2.1.0',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'next_version_number',
      '2.1.1',
    );
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'next_version', 'v2.1.1');
  });
});

function mock(inputs: {[key: string]: string}, versionOutput?: string) {
  const values: {[key: string]: string} = {
    version: '',
    type: '',
    pattern: '',
    ...inputs,
  };

  core.getInput.mockImplementation(name => {
    return values[name];
  });

  if (versionOutput) {
    exec.exec.mockImplementation(async (_command, _args, options) => {
      options?.listeners?.stdout?.(Buffer.from(versionOutput));

      return 0;
    });
  }
}

import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import {expect, test, describe} from '@jest/globals';

describe('runs', () => {
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'lib', 'main.js');

  test('with prefix', () => {
    process.env['INPUT_VERSION'] = 'test/v1.0.0';
    process.env['INPUT_TYPE'] = 'minor';

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();
    expect(out).toContain('::set-output name=next_version_number::1.1.0');
    expect(out).toContain('::set-output name=next_version::test/v1.1.0');
  });

  test('with suffix', () => {
    process.env['INPUT_VERSION'] = '1.0.0-test';
    process.env['INPUT_TYPE'] = 'minor';

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();

    expect(out).toContain('::set-output name=next_version_number::1.1.0');
    expect(out).toContain('::set-output name=next_version::1.1.0-test');
  });

  test('with v', () => {
    process.env['INPUT_VERSION'] = 'v1.0.0';
    process.env['INPUT_TYPE'] = 'minor';

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();

    expect(out).toContain('::set-output name=next_version_number::1.1.0');
    expect(out).toContain('::set-output name=next_version::v1.1.0');
  });

  test('major', () => {
    process.env['INPUT_VERSION'] = 'v1.0.0';
    process.env['INPUT_TYPE'] = 'major';

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();

    expect(out).toContain('::set-output name=next_version_number::2.0.0');
    expect(out).toContain('::set-output name=next_version::v2.0.0');
  });

  test('patch', () => {
    process.env['INPUT_VERSION'] = 'v1.0.0';
    process.env['INPUT_TYPE'] = 'patch';

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();

    expect(out).toContain('::set-output name=next_version_number::1.0.1');
    expect(out).toContain('::set-output name=next_version::v1.0.1');
  });
});

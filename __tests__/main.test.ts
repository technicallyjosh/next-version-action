import * as process from 'process';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import {expect, test, describe} from '@jest/globals';

describe('runs', () => {
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'lib', 'main.js');

  function getOutputFilename(): string | undefined {
    return tmp.fileSync({prefix: 'gh-output-'}).name;
  }

  function assertOutputFileSetsValue(
    filename: string,
    name: string,
    value: string,
  ) {
    const contents = fs.readFileSync(filename, 'utf8');
    const heredocRegex = /([^<]+?)<<(.+)\n([^\n]+)\n\2(?:\n|$)/gm;

    for (const match of contents.matchAll(heredocRegex)) {
      // group 1 is the name, group 3 is the value
      if (match[1] === name && match[3] === value) {
        return;
      }
    }

    throw new Error(
      `Could not find output ${name} with value ${value} in GITHUB_OUTPUT file ${filename}`,
    );
  }

  test('with prefix', () => {
    process.env['INPUT_VERSION'] = 'test/v1.0.0';
    process.env['INPUT_TYPE'] = 'minor';
    process.env['GITHUB_OUTPUT'] = getOutputFilename();

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();

    expect(out).toContain('::debug::next version: 1.1.0');

    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version_number',
      '1.1.0',
    );
    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version',
      'test/v1.1.0',
    );
  });

  test('with suffix', () => {
    process.env['INPUT_VERSION'] = '1.0.0-test';
    process.env['INPUT_TYPE'] = 'minor';
    process.env['GITHUB_OUTPUT'] = getOutputFilename();

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();
    expect(out).toContain('::debug::next version: 1.1.0');

    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version_number',
      '1.1.0',
    );
    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version',
      '1.1.0-test',
    );
  });

  test('with v', () => {
    process.env['INPUT_VERSION'] = 'v1.0.0';
    process.env['INPUT_TYPE'] = 'minor';
    process.env['GITHUB_OUTPUT'] = getOutputFilename();

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();
    expect(out).toContain('::debug::next version: 1.1.0');

    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version_number',
      '1.1.0',
    );
    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version',
      'v1.1.0',
    );
  });

  test('major', () => {
    process.env['INPUT_VERSION'] = 'v1.0.0';
    process.env['INPUT_TYPE'] = 'major';
    process.env['GITHUB_OUTPUT'] = getOutputFilename();

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();
    expect(out).toContain('::debug::next version: 2.0.0');

    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version_number',
      '2.0.0',
    );
    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version',
      'v2.0.0',
    );
  });

  test('patch', () => {
    process.env['INPUT_VERSION'] = 'v1.0.0';
    process.env['INPUT_TYPE'] = 'patch';
    process.env['GITHUB_OUTPUT'] = getOutputFilename();

    const out = cp.execFileSync(np, [ip], {env: process.env}).toString();
    expect(out).toContain('::debug::next version: 1.0.1');

    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version_number',
      '1.0.1',
    );
    assertOutputFileSetsValue(
      process.env['GITHUB_OUTPUT']!,
      'next_version',
      'v1.0.1',
    );
  });
});

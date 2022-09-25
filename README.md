# Next Version Action

A simple GitHub action to generate a next version via semantic versioning.

## Example Usage

```yaml
steps:
  - name: Next Version
    id: version
    uses: technicallyjosh/next-version-action@v1
    with:
      version: v1.0.0
  - name: Do Something
    run: echo "${{ steps.version.outputs.next_version }}"
```

## Inputs

- `version` - The version string to get the next version from.
- `type` (optional) - Release type for incrementing the version. major, minor,
  or patch.

## Outputs

- `next_version`
- `next_version_number`

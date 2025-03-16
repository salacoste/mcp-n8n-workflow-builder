# Publishing to npm

This guide provides instructions for publishing the n8n Workflow Builder MCP Server package to npm.

## Prerequisites

Before publishing, make sure you have:

1. An npm account (in this case, the package will be published under the `@kernel.salacoste` scope)
2. Proper access rights to publish to this scope
3. A properly configured package.json file
4. All changes committed to git

## Publishing Steps

### 1. Login to npm

```bash
npm login
```

Follow the prompts to authenticate with your npm credentials. You may need to provide a one-time password if you have 2FA enabled.

### 2. Update Version (if needed)

To update the package version:

```bash
# For patch updates (bug fixes)
npm version patch

# For minor updates (new features, backward compatible)
npm version minor

# For major updates (breaking changes)
npm version major
```

This will update the version in package.json and create a git tag.

### 3. Build the Package

The package will be automatically built during publishing due to the `prepublishOnly` script, but you can also build it manually:

```bash
npm run clean && npm run build
```

### 4. Publish to npm

```bash
npm publish --access public
```

Or use the npm script:

```bash
npm run publish
```

### 5. Verify the Publication

After publishing, verify that the package is available on npm:

```
https://www.npmjs.com/package/@kernel.salacoste/n8n-workflow-builder
```

## Troubleshooting

### Unable to Login

If you have issues logging in:

```bash
npm login --registry=https://registry.npmjs.org/
```

### Publication Errors

Common errors include:

1. **Version already exists**: Update the version in package.json
2. **Permission denied**: Ensure you have the right access level to publish
3. **Package name conflicts**: Check that the package name is available and you have rights to publish to that scope

## Future Updates

To update the package in the future:

1. Make your code changes
2. Update the version using `npm version`
3. Build and publish as described above 
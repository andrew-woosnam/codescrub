# CodeScrub

**CodeScrub** is a Visual Studio Code extension that helps you safely copy source code containing sensitive information, such as proprietary company IP, and paste it elsewhere with sensitive content automatically replaced by generic placeholders. It allows you to easily configure replacement mappings and switch between original and scrubbed code effortlessly.

## Features

- **Sensitive Data Replacement**: Automatically replace sensitive identifiers (e.g., class names, function names) with generic ones while copying code.
- **Custom Mapping Configuration**: Set up and manage custom mappings between sensitive names and generic names in the extension's sidebar.
- **Re-translate**: Revert scrubbed code back to the original sensitive content using the configured mappings.
- **Seamless Clipboard Integration**: Copy scrubbed code directly to the clipboard for easy pasting into public forums, code sharing sites, or documentation.

## Example

- **Before Scrub**: 
  ```typescript
  class AbcTransmissionService { ... }  
  ```

- **After Scrub**: 
  ```typescript
  class ATService { ... } 
  ```

// Function to perform the scrubbing (translate secret => generic or vice versa)
function scrubCode(code, mappings, caseSensitive, wholeWord) {
    let scrubbedCode = code;
    for (const [sensitive, generic] of Object.entries(mappings)) {
        const escapedSensitive = sensitive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        const regexPattern = wholeWord ? `\\b${escapedSensitive}\\b` : escapedSensitive;
        const regex = new RegExp(regexPattern, flags);
        scrubbedCode = scrubbedCode.replace(regex, generic);
    }
    return scrubbedCode;
}

// Function to handle scrubbing/unscrubbing direction
function translate(direction) {
    const code = document.getElementById('codeInput').value;
    const mappingInput = document.getElementById('mappingInput').value;
    const caseSensitive = document.getElementById('caseSensitive').checked;
    const wholeWord = document.getElementById('wholeWord').checked;

    let mappings = {};
    try {
        mappings = JSON.parse(mappingInput);
    } catch (e) {
        alert('Invalid JSON format. Please check your mappings.');
        return;
    }

    if (direction === 'unscrub') {
        const reversedMappings = {};
        for (const [secret, generic] of Object.entries(mappings)) {
            reversedMappings[generic] = secret;
        }
        mappings = reversedMappings;
    }

    const result = scrubCode(code, mappings, caseSensitive, wholeWord);
    document.getElementById('resultOutput').value = result;
}

// Add event listeners to scrub and unscrub buttons
document.getElementById('scrubBtn').addEventListener('click', () => translate('scrub'));
document.getElementById('unscrubBtn').addEventListener('click', () => translate('unscrub'));

// Function to copy content of the given textarea and update button text
function copyToClipboard(textareaId, buttonId) {
    const textarea = document.getElementById(textareaId);
    const copyButton = document.getElementById(buttonId);

    // Copy text to clipboard
    textarea.select();
    document.execCommand('copy');

    // Temporarily change the button content to "Copied!" with capitalized text
    const originalContent = copyButton.innerHTML;
    copyButton.style.textTransform = 'none'; // Remove uppercase styling temporarily
    copyButton.innerHTML = 'Copied!';

    // Revert the button content back to the original after 2 seconds
    setTimeout(() => {
        copyButton.innerHTML = originalContent;
        copyButton.style.textTransform = ''; // Reset to original styling
    }, 2000);
}

// Add event listeners to copy buttons for input and output areas
document.getElementById('copyInputBtn').addEventListener('click', () => {
    copyToClipboard('codeInput', 'copyInputBtn');
});

document.getElementById('copyOutputBtn').addEventListener('click', () => {
    copyToClipboard('resultOutput', 'copyOutputBtn');
});

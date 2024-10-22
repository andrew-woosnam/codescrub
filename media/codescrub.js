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

document.getElementById('scrubBtn').addEventListener('click', () => translate('scrub'));
document.getElementById('unscrubBtn').addEventListener('click', () => translate('unscrub'));

// Copy input code to clipboard
document.getElementById('copyInputBtn').addEventListener('click', () => {
    const inputCode = document.getElementById('codeInput');
    inputCode.select();
    document.execCommand('copy');
});

// Copy output result to clipboard
document.getElementById('copyOutputBtn').addEventListener('click', () => {
    const outputCode = document.getElementById('resultOutput');
    outputCode.select();
    document.execCommand('copy');
});

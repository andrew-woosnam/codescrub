import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const provider = new ReplaceSensitiveViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ReplaceSensitiveViewProvider.viewType, provider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('codeScrub.copyWithReplacements', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) { return; }

            const selectedText = editor.document.getText(editor.selection);
            const mappings = provider.getMappings();

            // Perform the replacements
            let replacedText = selectedText;
            for (const [sensitive, generic] of Object.entries(mappings)) {
                replacedText = replacedText.replace(new RegExp(sensitive, 'g'), generic);
            }

            // Copy replaced text to clipboard
            await vscode.env.clipboard.writeText(replacedText);
            vscode.window.showInformationMessage('Code copied with replacements!');
        })
    );
}

export function deactivate() { }

export class ReplaceSensitiveViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeScrubConfigView';

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {

        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'saveMapping') {
                this.saveMapping(message.data);
            }
        });

        webviewView.onDidChangeVisibility(() => {
            if (this._view?.visible) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        });
    }


    public getMappings(): { [key: string]: string } {
        return vscode.workspace.getConfiguration().get<{ [key: string]: string }>('codeScrub.mappings') || {};
    }

    private saveMapping(data: { sensitive: string, generic: string }) {
        const mappings = vscode.workspace.getConfiguration().get<{ [key: string]: string }>('codeScrub.mappings') || {};
        mappings[data.sensitive] = data.generic;
        vscode.workspace.getConfiguration().update('codeScrub.mappings', mappings, vscode.ConfigurationTarget.Global);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Scrub Configuration</title>
        </head>
        <body>
            <h2>Configure CodeScrub Replacement</h2>
            <form>
                <label for="sensitive">Sensitive Name:</label>
                <input type="text" id="sensitive" />
                <label for="generic">Generic Name:</label>
                <input type="text" id="generic" />
                <button type="button" onclick="addMapping()">Add Mapping</button>
            </form>

            <script>
                const vscode = acquireVsCodeApi();
                function addMapping() {
                    const sensitive = document.getElementById('sensitive').value;
                    const generic = document.getElementById('generic').value;
                    vscode.postMessage({ command: 'saveMapping', data: { sensitive, generic } });
                }
            </script>
        </body>
        </html>`;
    }
}


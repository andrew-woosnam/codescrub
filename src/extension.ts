import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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

        // Load HTML content from file
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

    // Load the HTML file content
    private _getHtmlForWebview(webview: vscode.Webview): string {
        const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'codescrub.js'));
        const htmlPath = path.join(this._extensionUri.fsPath, 'media', 'codescrub.html');

        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Replace placeholders for script and css URIs
        htmlContent = htmlContent.replace(/\${cssUri}/g, cssUri.toString());
        htmlContent = htmlContent.replace(/\${scriptUri}/g, scriptUri.toString());

        return htmlContent;
    }

    public getMappings(): { [key: string]: string } {
        return vscode.workspace.getConfiguration().get<{ [key: string]: string }>('codeScrub.mappings') || {};
    }

    private saveMapping(data: { sensitive: string, generic: string }) {
        const mappings = vscode.workspace.getConfiguration().get<{ [key: string]: string }>('codeScrub.mappings') || {};
        mappings[data.sensitive] = data.generic;
        vscode.workspace.getConfiguration().update('codeScrub.mappings', mappings, vscode.ConfigurationTarget.Global);
    }
}
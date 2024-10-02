import * as vscode from 'vscode';

export class ReplaceSensitiveView {
    private _view?: vscode.WebviewView;

    constructor(private readonly _context: vscode.ExtensionContext) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        this._view.webview.options = { enableScripts: true };
        this._view.webview.html = this._getHtmlForWebview();

        this._view.webview.onDidReceiveMessage(message => {
            if (message.command === 'saveMapping') {
                this.saveMapping(message.data);
            }
        });
    }

    private _getHtmlForWebview() {
        return `
        <html>
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
                function addMapping() {
                    const sensitive = document.getElementById('sensitive').value;
                    const generic = document.getElementById('generic').value;
                    vscode.postMessage({ command: 'saveMapping', data: { sensitive, generic } });
                }
            </script>
        </body>
        </html>`;
    }

    saveMapping(data: { sensitive: string, generic: string }) {
        const mappings = this._context.globalState.get<{ [key: string]: string }>('mappings', {});
        mappings[data.sensitive] = data.generic;
        this._context.globalState.update('mappings', mappings);
    }

    getMappings(): { [key: string]: string } {
        return this._context.globalState.get('mappings', {});
    }
}

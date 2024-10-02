import * as vscode from 'vscode';
import { ReplaceSensitiveView } from './views/ReplaceSensitiveView';

export function activate(context: vscode.ExtensionContext) {
	const view = new ReplaceSensitiveView(context);

	context.subscriptions.push(
		vscode.commands.registerCommand('codeScrub.copyWithReplacements', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) { return; }

			const selectedText = editor.document.getText(editor.selection);
			const mappings = view.getMappings();

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

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('codeScrubConfigView', view)
	);
}

export function deactivate() { }

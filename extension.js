// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const cheerio = require('cheerio');
const path = require('path');
const axios = require('axios');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

async function getHtml(problemNumber) {
	const customHeaders = {
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
	};
	// Get the page source
	const res = await axios.get('https://boj.kr/' + problemNumber, {headers: customHeaders});

	// Parse the HTML using cheerio
	const $ = cheerio.load(res.data);

	// Find the div with id 'problem-body' and extract the text
	const problemHtml = $('#problem-body').html();
	console.log(problemHtml);
	return problemHtml;
}

function extractFirstNumberFromString(inputString) {
	const regex = /^(\d+)/;
	const match = inputString.match(regex);

	if (match) {
			return match[1];
	} else {
			return null; // No digits found in the string
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "boj-ex" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('boj-ex.helloWorld', async function () {
		// The code you place here will be executed every time your command is executed
		try {
				const activeEditor = vscode.window.activeTextEditor;

				let problemNumber;
				if (activeEditor) {
					const currentFileName = path.parse(activeEditor.document.fileName).name;
					problemNumber = extractFirstNumberFromString(currentFileName);
				} else {
					vscode.window.showErrorMessage('No active editor found.');
					return;
				}

				const res = await getHtml(problemNumber);

				const panel = vscode.window.createWebviewPanel(
					'htmlViewer', // ID of the panel.
					'HTML Viewer', // Title of the panel.
					vscode.ViewColumn.One, // Editor column to show the panel in.
					{
							enableScripts: true, // Enable JavaScript in the WebView.
					}
			);

			// Load your HTML content into the WebView.
			panel.webview.html = res;
		} catch (error) {
				vscode.window.showErrorMessage(error);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

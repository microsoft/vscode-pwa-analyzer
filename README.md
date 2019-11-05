# vscode-pwa-analyzer

This repo contains a simple tool to help view log files emitted by the [vscode-pwa extension](https://github.com/microsoft/vscode-pwa). We use it to debug issues with the adapter, and you might find it useful as well if you want to contribute to the extension.

First, you'll need to create a log file, which you can do by setting `trace: true` in your `launch.json`. The next time you debug your code, the debug console will print where the log file is stored. You can upload that file to this tool. To do that:

 1. Clone this repository;
 2. Open the repository in your terminal, and run `npm install`;
 3. Run `npm start`, which will open the web UI on localhost:8080.

The web UI will contain a field where you can upload your collected log file.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

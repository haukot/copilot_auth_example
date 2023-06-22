import fetch from 'node-fetch'; // for node 16
import { v4 as uuidv4 } from 'uuid';
import { request as octokitRequest } from "@octokit/request"; // for node 16

import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";

const auth = createOAuthDeviceAuth({
  clientType: "oauth-app",
  clientId: "Iv1.b507a08c87ecfe98", // copilot app client_id
  scopes: ["read:user"],
  onVerification(verification) {
    console.log("Open %s", verification.verification_uri);
    console.log("Enter code: %s", verification.user_code);
  },
});

(async function() {
  const tokenAuthentication = await auth({
    type: "oauth",
    request: { fetch },
  })
  console.log(tokenAuthentication)

  // let tokenAuthentication = {
  //   type: 'token',
  //   tokenType: 'oauth',
  //   clientType: 'oauth-app',
  //   clientId: 'Iv1.b507a08c87ecfe98',
  //   token: 'ghu_SLvmytokennnnnnnnnnnnnn',
  //   scopes: []
  // }

  let copilot_token_url = 'https://api.github.com/copilot_internal/v2/token'
  let params = {
    method: "GET",
    headers: {
      authorization: `token ${tokenAuthentication.token}`,
      "editor-plugin-version": "copilot-intellij/1.2.8.2631",
      "editor-version": "JetBrains-IC/231.9011.34"
    }
  }

  const copilotToken = await fetch(copilot_token_url, params)
    .then(response => response.json())
  console.log(copilotToken)

  // const copilotToken =
  //       {
  //         chat_enabled: true,
  //         code_quote_enabled: false,
  //         copilotignore_enabled: false,
  //         expires_at: 1687437066,
  //         public_suggestions: 'disabled',
  //         refresh_in: 1500,
  //         sku: 'monthly_subscriber',
  //         telemetry: 'disabled',
  //         token: 'tid=999mytokenasht;exp=1687437066;sku=monthly_subscriber;st=dotcom;chat=1:c999mytokena3aeashtasht074e6c22c1eashtasht280789ashtashtd',
  //         tracking_id: '9999mytokenf7210d37b'
  //       }

  const completionsUrl = 'https://copilot-proxy.githubusercontent.com/v1/engines/copilot-codex/completions'

  // TODO: you need to add that
  const machineId = "" // generated from mac address, created in EditorSession in agent.js

  const completionParams = {
    "method": "POST",
    "headers": {
      "Authorization": `Bearer ${copilotToken.token}`,
      "X-Request-Id": uuidv4(),
      "Openai-Organization": "github-copilot",
      "VScode-SessionId": uuidv4() + Date.now(),
      "VScode-MachineId": machineId,
      "Editor-Version": "JetBrains-IC/231.9011.34", // TODO
      "Editor-Plugin-Version": "copilot-intellij/1.2.8.2631", // TODO
      "OpenAI-Intent": "copilot-ghost"
    },
    "json": {
    "prompt": "// Path: app/my_file.js\nfunction fetch_tweet() {\nva",
    "suffix": "}",
    "max_tokens": 500,
    "temperature": 0,
    "top_p": 1,
    "n": 1,
    "stop": [
        "\n"
    ],
    "nwo": "my_org/my_repo",
    "stream": true,
    "extra": {
        "language": "javascript",
        "next_indent": 0,
        "trim_by_indentation": true,
        "prompt_tokens": 19,
        "suffix_tokens": 1
    }
},
    "body": JSON.stringify({
      "prompt": "// Path: app/my_file.js\nfunction fetch_tweet() {\nva",
      "suffix": "}",
      "max_tokens": 500,
      "temperature": 0,
      "top_p": 1,
      "n": 1,
      "stop": [
        "\n"
      ],
      "nwo": "my_org/my_repo",
      "stream": true,
      "extra": {
        "language": "javascript",
        "next_indent": 0,
        "trim_by_indentation": true,
        "prompt_tokens": 19,
        "suffix_tokens": 1
      }
    })
  }
  console.log(completionParams)


  // TODO: we need to handle stream here
  const completions = await fetch(completionsUrl, completionParams)
    // .then(response => response.json())
        .then(response => console.log(response))
  console.log(completions)
})()

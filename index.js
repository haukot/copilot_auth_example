import fetch from 'node-fetch'; // for node 16
// commented in waiting PR to be merged
// https://github.com/Azure/fetch-event-source/pull/28
// import { fetchEventSource } from '@microsoft/fetch-event-source';
import { fetchEventSource, EventStreamContentType } from 'fetch-event-source-hperrin';

import { v4 as uuidv4 } from 'uuid';
import { networkInterfaces } from 'os';
import crypto from 'crypto';

import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";


function getMacAddress() {
  const invalidMacAddresses = new Set(["00:00:00:00:00:00", "ff:ff:ff:ff:ff:ff", "ac:de:48:00:11:22"]);

  function isValidMac(mac) {
    const normalizedMac = mac.replace(/-/g, ":").toLowerCase();
    return !invalidMacAddresses.has(normalizedMac);
  }

  let macAddress = null;
  const interfaces = networkInterfaces();

  for (const interfaceKey in interfaces) {
    const interfaceValue = interfaces[interfaceKey];
    if (interfaceValue) {
      for (const { mac } of interfaceValue) {
        if (isValidMac(mac)) {
          return mac;
        }
      }
    }
  }
}

function getMachineId() {
  let machineId = null;
  try {
    const macAddress = getMacAddress();
    machineId = crypto.createHash("sha256").update(macAddress, "utf8").digest("hex")
  } catch (error) {
    console.log("Error getting mac address: %s", error.message);
  }
  return machineId || uuidv4();
}

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

  const completionParams = {
    "method": "POST",
    "headers": {
      "Authorization": `Bearer ${copilotToken.token}`,
      "X-Request-Id": uuidv4(),
      "Openai-Organization": "github-copilot",
      "VScode-SessionId": uuidv4() + Date.now(),
      "VScode-MachineId": getMachineId(),
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


  const completionsResponse = await fetchEventSource(completionsUrl, {
    ...completionParams,
    fetch: fetch,
    async onopen(response) {
        if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
            return; // everything's good
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // client-side errors are usually non-retriable:
            // throw new FatalError();
          console.log(response)
        } else {
            // throw new RetriableError();
          console.log(response)
        }
    },
    onmessage(msg) {
      console.log("Got message")
      console.log(msg)
    },
    onclose() {
      console.log('onclose')

      // throw new RetriableError();
    },
    onerror(err) {
      console.log(err)

      // if (err instanceof FatalError) {
      // throw err; // rethrow to stop the operation
      // } else {
      //   // do nothing to automatically retry. You can also
      //   // return a specific retry interval here.
      // }
    }
  })

  console.log(completionsResponse)
})()

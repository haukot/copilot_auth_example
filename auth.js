https://github.com/login/oauth/access_token

{
    "method": "POST",
    "headers": {
        "accept": "application/json",
        "editor-version": "JetBrains-IC/231.9011.34",
        "editor-plugin-version": "copilot-intellij/1.2.8.2631",
        "content-type": "application/json"
    },
    "body": {
        "client_id": "Iv1.b507a08c87ecfe98",
        "scope": "read:user"
    },
    "compress": true,
    "decode": true,
    "follow": 20,
    "redirect": "follow"
}


params = {
    "method": "POST",
    "headers": {
        "Accept": "application/json",
        "Editor-Version": "JetBrains-IC/231.9011.34",
        "Editor-Plugin-Version": "copilot-intellij/1.2.8.2631"
    },
    "json": {
        "client_id": "Iv1.b507a08c87ecfe98", // , a = "Iv1.b507a08c87ecfe98";
        "scope": "read:user"
    },
    "timeout": 30000
}

// https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
// client_id -  The client ID you received from GitHub when you registered.(registered an app)
url = 'https://github.com/login/device/code'


let params = {
    method: "POST",
    headers: {
        "Accept": "application/json",
        "Editor-Version": "JetBrains-IC/231.9011.34",
        "Editor-Plugin-Version": "copilot-intellij/1.2.8.2631"
    },
    body: JSON.stringify({
        client_id: "Iv1.b507a08c87ecfe98", // a = "Iv1.b507a08c87ecfe98";
        scope: "read:user"
    }),
    timeout: 30000
}

let url = 'https://github.com/login/device/code'

let result = null;
fetch(url, params)
    .then(response => result = response.json())
    .then(data => console.log(data))
    .catch((error) => console.error('Error:', error));

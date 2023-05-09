## Installation

```bash
$ pnpm i --frozen-lockfile
```

## Running

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Replace ChatGPT Token

Replace **YOU_ARE_CHATGPT_TOKEN** in this project with your own ChatGPT token.

## Configure GitLab in the project

Generate an `Access Token` in the GitLab project and check the **"read and write"** permissions.
Configure the webhook in the GitLab project, and select the **Merge request event**.
- The webhook URL requires three parameters:
    - token: The Access Token generated in step 1.
    - language: Choose between ZH and EN. If set to EN, ChatGPT will comment in English.
    - projectId: Can be found in GitLab project -> general.
The webhook URL looks like: https://www.asxf.com/gitlab-review/webhook?projectId=234&token=sadfgfd23v62g&language=EN

After deploying the service, ChatGPT can comment on code when a `Merge Request` is created in the corresponding GitLab project.

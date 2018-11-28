# Export Front Emails

[Front](https://frontapp.com/) is awesome but it's locking your emails into their system.

If you want to keep your email messages backed up or you want to switch away from Front,
this package helps you to export your messages.

The script exports all messages (including attachments) to a JSON file
and to `.eml` files which you can import to apps like Outlook or Thunderbird.

## Usage

Install dependencies for this package with NPM:

`$ npm install`

You need to set an environment variable by creating a `.env` text file in the
root directory of this project. It contains your Front JSON Web Token which you
have to copy from your [Front API Preferences](https://app.frontapp.com/settings/tools/api).

The `.env` file should look like this:

```
FRONT_JSON_WEB_TOKEN: pasteYourJsonWebTokenHere
```

With these environment variable in place, run the script:

`$ npm start your@email.com`

You have to replace `your@email.com` with an email address from your [Front inboxes](https://app.frontapp.com/settings/tim:21314/inboxes).

This will create a directory with a `conversations.json` file containing all conversations from the inbox. Per message a directory is created containing all attachments for the message.

It will also create a `sent/` and `received/` folder with the corresponding `.eml` files which you can import to other mail apps.

### How do I export individual inboxes

The Front API only shows team inboxes. There is a workaround though:

1. In Front settings create a new folder
2. Go to your individual inbox settings and click `Move channel` at the bottom
3. Move it to the created folder inbox

Now you can export the inbox just like any other.

## Disclaimer

Use this at your own risk. I'm not associated in any way with Front.

## Thanks

Thanks to [Leon de Rijke](https://github.com/leonderijke) who provided an awesome basis for this package using the old Front API. I ported it to the new API version 2 and added the `.eml` export.

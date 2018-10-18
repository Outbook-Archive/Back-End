# Outbook.us

For those on the outbook.us team, feel free to get the .env credentials from Ansel.

## Steps to get Started:
1. Go to https://apps.dev.microsoft.com and sign in.
2. Create an app by clicking on the "Add an app" button, entering a name, and finally, clicking the "Create application" button.
3. Get a password.
  1. Go to "Application Secrets" area.
  2. Click "Generate New Password" button.
  3. Copy and paste it next to "APP_PASSWORD=" in your .env file.
4. Get the application ID and set the redirect URI.
  1. Go to "Platforms" area.
  2. Click "Add Platform" button.
  3. Select "Web".
  4. Enter your redirect URI (this is the route that the OAuth will post to in order to give you the Auth code).
  5. Copy and paste the redirect URI next to "REDIRECT_URI=" in your .env file.
  6. Click the "Save" button.
  7. Copy and paste the Application Id next to "APP_ID=" in your .env file.
5. You can now run the app by going to this app's directory and running ```npm install && npm start``` in your command line.

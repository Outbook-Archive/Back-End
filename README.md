# Outbook.us

## Steps to get Started:
*These steps were completed on MacOS and may vary with what operating system you are running.*
1. Clone this repository locally and run `npm install` while in your apps's directory in your terminal.
2. Go to https://apps.dev.microsoft.com and sign in.
3. Create an app by clicking on the "Add an app" button, entering a name, and finally, clicking the "Create application" button.
4. Get a password.
   1. Go to "Application Secrets" area.
   2. Click "Generate New Password" button.
   3. Copy and paste it next to "APP_PASSWORD=" in your .env file.
5. Get the application ID and set the redirect URI.
   1. Go to "Platforms" area.
   2. Click "Add Platform" button.
   3. Select "Web".
   4. Enter your redirect URI (this is the route that the OAuth will post to in order to give you the Auth code). If you want to use the app without any changes, your redirect URI must be YOUR_DOMAIN + /authorize.
   5. Copy and paste the redirect URI next to "REDIRECT_URI=" in your .env file.
   6. Go back to your web browser and click the "Save" button.
   7. Copy and paste the Application Id next to "APP_ID=" in your .env file.
6. It is recommended that you specify the "Delegated Permissions" to match the permissions listed next to `APP_SCOPES` in your `.env` file.
7. The app currently uses a MongoDB database. You may reference this [Stack Overflow answer](https://stackoverflow.com/questions/18452023/installing-and-running-mongodb-on-osx) or the internet when installing and running this database.
8. You can now run the app by going to this app's directory and running ```npm start``` in your command line.

## Routes that are available:
*If you are running this API with our [front end client](https://github.com/Outbook-Archive/Front-End-Web), you don't need to worry about these routes.*
- ```GET /``` - Redirects to the login on Outlook. You can go to the URL to login and then get redirected back to the app.
- ```GET /authorize/``` - The URI that Microsoft will redirect to after logging in.
- ```GET /authorize/calendar``` - Uses a cookie stored on the front end to find the corresponding user name and unique id, and sends it back
- ```GET /authorize/signout``` - Removes the cookie associated with the signed in account.
- ```GET /calendar/interviewer/:interviewerId``` - Returns the upcoming calendar events based on the passed in `interviewerId`. You can change how many events (```numberOfEvents```), how many days from the current date to start looking for events (```startDaysIntoFuture```), and how many days from the starting day to look for events (```endDaysIntoFuture```) in ```routes/calendar.js``` and ```helpers/cal.js```
- ```POST /calendar/interviewer/:interviewerId``` - Receives fullName, email, phoneNumber, startDateTime, and eventId and uses that data to update the calendar that corresponds to the `interviewerId`.



## Things to note:
- According to this [Quora answer](https://www.quora.com/When-using-node-js-do-you-still-need-Nginx-or-Apache), you may run Node.js by itself, with nginx, or even with Apache in a production environment.
- The app uses a cron job that runs every hour to refresh the tokens. As the app is currently built, if the refresh tokens expire, the user must be manually deleted from the database in order for them to log in again. [Robo 3T](https://robomongo.org/) is a great database tool to handle this until the issue is sorted out.
- The Microsoft permissions currently granted through this app are:
   - openid
   - profile
   - offline_access
   - User.Read
   - Mail.Read
   - Calendars.Read
   - Contacts.Read
- What is each `.env` variable for?
   - PORT - The port that the app runs on
   - APP_ID - The application ID registered with Microsoft
   - APP_PASSWORD - The application password registered with Microsoft
   - APP_SCOPES - The Microsoft permissions that this app requests from each user
   - REDIRECT_URI - The URI that Microsoft redirects too after logging in. Instead of `localhost` as it is currently specified in the `sample.env`, it will be your domain that is associated with your copy of the backend server.
   - CROSS_ORIGIN - The domain that is associated with the front end server.

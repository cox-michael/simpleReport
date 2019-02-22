# simpleReport-portal
Web portal and repository for [simpleReport.js](https://github.com/ldsmike88/simpleReport.js)

simpleReport is designed to be a quick and easy solution to distributing data in the form of Excel workbooks. The bare minimum is a title and a query, and viola, you have a report ready to distribute. Of course, the report can be customized further by adding more tables, more worksheets, descriptions, etc.

simpleReport Portal makes it easy for anyone to utilize the power of simpleReport through a GUI.

## Installation

### Prerequisites
You'll need the following installed and running. I'm not going to specify how to do that here, but you can follow the links.
- Crontab or another method to schedule the report generator
- [MongoDB](https://docs.mongodb.com/manual/tutorial/getting-started/) 3.6 or newer
- [Node.js & NPM](https://www.npmjs.com/get-npm)
- Write your own authenticate.js script with methods get_user and auth
- Drivers for whatever databases you'll be querying (all db connections are made via ODBC)

#### 1. Clone this repo
With git bash:

`git clone https://github.com/ldsmike88/simpleReport-portal.git`

If you need more help:
https://help.github.com/articles/cloning-a-repository/

#### 2. Setup Environment
Create a `.env` file based off of `DOTENV_EXAMPLE.txt`

You could simply rename `DOTENV_EXAMPLE.txt` to `.env`, but not everything will work.

If you're not familiar with environments in Node.js you can get more help here:
https://www.npmjs.com/package/dotenv

#### 3. Schedule the generator
Schedule the generator to run in the morning, afternoon, and evening. Here's an example of how it's done in cron:

`50 6,12,16 * * * python3 /path/to/simpleReport/server/runScheduledReports.js &>> /path/to/simpleReport/server/runScheduledReports/log/txt`

#### 3. Install dependencies

Go to the directory where you cloned the repo and run:

`npm install`

This will install all of the dependencies required for simpleReport.

#### 4. Build the app

Before you run the app for the first time you have to build it using webpack.

Run `npm run build`

After the first time you can run `npm run watch &` if you are going to be making changes to the JavaScript. `watch` is for development and will monitor for file changes, but it doesn't build the html index. `build` will build the html files as well as optimize `main.js` for production.

## Usage

Run `node app.js` and enjoy!

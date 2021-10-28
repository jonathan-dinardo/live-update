# Getting started

Live Update is a service to provide a quick update of your ionic apps. Ionic use a "deploy cli" to access to appflow. If your app is using appflow you don't need to change your code to connect to liveupdate. Just change URL, application and channel of your configuration to point lo liveupdate.

# For impatients... Docker!
```bash
docker-compose up
```
It will creare a mysql database with a container nestjs. Next Open swagger docs:
http://localhost:3000/docs
 
# Configuration file

The are multiple configuration env.prod or .env.dev (if you start the application locally). Additionally there's a file .env that has a  common configuration. 
```bash
   
    #temporany directory
    TEMP_DIR=/tmp
    #This is really important! It's the url used to privide to the ionic app. 
    # Be sure that url is avaiable from you mobile app. If you have this application behind the reverse proxy, you must provide the url exposed by the reverse proxy.   
    UPDATE_API=http://0.0.0.0:3000
    #the database configuration
    TYPEORM_HOST = db
    TYPEORM_USERNAME = liveupdate
    TYPEORM_PASSWORD = mDtCaRy9x6A9rVxw
    TYPEORM_DATABASE = liveupdate
    TYPEORM_PORT = 3306
    TYPEORM_LOGGING = true
    #the local repository. Every version of your build will be saved here
    PUBLISH_REPO=/tmp/published/{{appId}}/channels/{{channelId}}/
    FILE_REPOSITORY=/tmp
    #port exposed 
    EXPRESS_PORT=3000
    #environment description. It is used by swagger
    ENV_DESCRIPTION=Production
```
  .env  Normally you don't need to change it
```bash
    # Url provided to ionic app. The placeholder are dynamic values.
    UPDATE_API_RESOURCE_URL={{updateApi}}/resources/{{appId}}/channels/{{channelId}}/builds/{{buildId}}
    # The message helper for the deplyment
    UPDATE_MESSAGE=ionic deploy add --app-id "{{appId}}" --channel-name "{{channelId}}" --update-api "{{updateApi}}" --update-method="auto"
    # The basic database information
    TYPEORM_CONNECTION = mysql
    TYPEORM_SYNCHRONIZE = false
    TYPEORM_ENTITIES = "dist/**/*.entity.js"
    TYPEORM_MIGRATIONS = dist/migrations/*.js
    TYPEORM_MIGRATIONS_RUN = true
    TYPEORM_MIGRATIONS_TABLE_NAME = __migrations
    # The swagger url
    DOC_API=http://0.0.0.0:3000
```

## Quick start
 
If you take a look on USERS table you know that the migration process has added a default user with the api key 
ea1f02a5-e02b-4ffc-9c36-c0f1a2f134c4. Later you can use this key (header x-api-key) with the api

Before configuring your ionic app, you need to do a few things
* Create an application.<br>
  Simply execute post to http://localhost:3000/apps giving a name like "my eCommerce app"

```bash
url --request POST 'http://localhost:3000/apps' 
  --header 'x-api-key: ea1f02a5-e02b-4ffc-9c36-c0f1a2f134c4' 
  --header 'Content-Type: application/json' 
  --data-raw '{ "name": "myecommerce app" }'
```
The rest API returns an application ID
```json
{
    "id": "abeb2440-da79-4e54-8614-9324e9faa930",
    "name": "myecommerce app",
    "createdAt": "2021-05-20T13:13:02.000Z",
    "updatedAt": "2021-05-20T13:13:02.000Z"
}
```
* Create a channel.<br>
  A channel is an environment and that's associated to the application. The application can have several channels like production, development, etc.
  Using the application ID as part of the path, execute a http POST to http://localhost:3000/apps/{{applicationId}}/channels to create a new channel.
  The example below uses abeb2440-da79-4e54-8614-9324e9faa930 as application ID.

```bash
curl --request POST 'http://localhost:3000/apps/abeb2440-da79-4e54-8614-9324e9faa930/channels' \
  --header 'x-api-key: xxxxxxxxxxx' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "name": "Production" }'
```

The rest API will return a channel ID.

```json
{
  "id": "66f47e25-4e9a-430d-9bd3-134817f8f9b8",
    "name": "Production",
    "createdAt": "2021-05-20T13:17:36.000Z",
    "updatedAt": "2021-05-20T13:17:36.000Z"
}
```

You have just created an application and channel. Your has now enough information to configure your ionic project. Execute a http get to http://localhost:3000/apps/{{applicationId}}/channels/{{channelId}}/updateinfo.
For example:
```bash
curl --request GET 'http://localhost:3000/apps/abeb2440-da79-4e54-8614-9324e9faa930/channels/66f47e25-4e9a-430d-9bd3-134817f8f9b8/updateinfo' \
--header 'x-api-key: xxxxxxxxxxx'
```
The response is a text with the statement used to configure the ionic deploy.

```clike
ionic deploy add --app-id "abeb2440-da79-4e54-8614-9324e9faa930" --channel-name "66f47e25-4e9a-430d-9bd3-134817f8f9b8"
--update-api "https://mywebsite.org" --update-method "auto"
```
Copy this statement and open the terminal, go to the directory where the package.json of your ionic project is located and runs it.
To be sure that everything is OK, let's check these files: package.json, fetch.json and the file of your platform build if present (e.g. android.json)
```json
{
    "APP_ID": "abeb2440-da79-4e54-8614-9324e9faa930",
    "CHANNEL_NAME": "66f47e25-4e9a-430d-9bd3-134817f8f9b8",
    "UPDATE_METHOD": "auto",
    "UPDATE_API": "https://mywebsite.org"
} 
```
After. Check the config.xml add this row to the preferences.
```xml
<preference name="DisableDeploy" value="false" />
```
### Create a build
Before creating a build, edit your ionic project's package.json file to allow the file pro-manifest.json file to be updated with each build run. Open the file package.json of your ionic project  and locate the build script.

```text
"scripts" : {
    ....
    "build": "ng build",
    ...
  },
```
Change to
```text
"scripts": {
    ....
    "build": "ng build && ionic deploy manifest",
    ...
  },
```
* Now open the terminal and run
```bash
npm run-script build
```
* Create a zip file with all contents of the www directory with subdirectories. The zip file name is not important. For Unix like systems from the root of your ionic project execute this statement:
```bash
cd www
zip ../myliveupdate.zip -r . 
```
! Remember, www directory must not be in the zip file, but only the contents.

* Upload a zip using the API as follows. The process could be a little slow.

```bash
curl --request POST 'http://localhost:3000/apps/abeb2440-da79-4e54-8614-9324e9faa930/channels/66f47e25-4e9a-430d-9bd3-134817f8f9b8/builds' \
--header 'x-api-key: xxxxxxxxxxx' \
--form 'file=@"/myliveupdates/myliveupdate.zip"'
```

The rest API will return a build ID. Notice that the last uploaded build has always activated by default

```json
{
"id": "5376e517-4ddb-472d-87f5-0ed07647cab4"
}
```
Your update is ready. You can build the ionic app and test if your update works.
Normally, all builds are saved to the history, and your app get update form only the active build
Execute a http GET using the applicationId and the channelId like the example below. Probably you have noticed that the URL is same to create a build.

```bash
curl --request GET 'http://localhost:3000/apps/abeb2440-da79-4e54-8614-9324e9faa930/channels/66f47e25-4e9a-430d-9bd3-134817f8f9b8/builds' \
--header 'x-api-key: xxxxxxxxxxx'
```
It returns a list of builds.
```json
[
    {
        "id": "e592c3da-6718-4e2c-a0cd-06592743f410",
        "name": "e592c3da-6718-4e2c-a0cd-06592743f410",
        "active": true,
        "createdAt": "2021-05-20T13:40:05.000Z",
        "updatedAt": "2021-05-20T13:40:09.000Z"
    },
    {
        "id": "5376e517-4ddb-472d-87f5-0ed07647cab4",
        "name": "5376e517-4ddb-472d-87f5-0ed07647cab4",
        "active": false,
        "createdAt": "2021-05-20T13:36:21.000Z",
        "updatedAt": "2021-05-20T13:40:08.000Z"
    }
]
```
If you want to delete a build, execute an HTTP DELETE to http://localhost:3000/apps/{{appId}}/channels/{{channelId}}/builds/{{buildId}}
Only one build can be active, in this case it is e592c3da-6718-4e2c-a0cd-06592743f410. Your apps will get an update from this build.
You can change the active build, executing an HTTP PUT a different build.
The URL is http://localhost:3000/apps/{{appId}}/channels/{{channelId}}/builds/{{buildId}}/active like the example below:
The operation could be a little slow.
```bash
curl --request PUT 'http://localhost:3000/apps/abeb2440-da79-4e54-8614-9324e9faa930/channels/66f47e25-4e9a-430d-9bd3-134817f8f9b8/builds/5376e517-4ddb-472d-87f5-0ed07647cab4/active' \
--header 'x-api-key: xxxxxxxxxxx'
``` 

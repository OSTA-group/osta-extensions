# OSTA Extensions
This project hosts a list of all available extensions in the OSTA marketplace alongside tools for creating, publishing and testing your own extensions.

# Creating a new extension
There are multiple types of extensions, so which one should you choose?

A web extension is the simplest option and requires almost no knowledge of our app's internal workings. You simply provide an OSTA-compliant API endpoint that can be used to find information about landmarks.

A Python extension, on the other hand, is more powerful but also more complex. This option requires you to write the code for fetching the data yourself. It is particularly useful if the desired API (e.g., Wikipedia API) does not easily map to our data structure.

## Parameters
The user can select an area on the map, this area will be sent to each extension. How this is done is specified separately for each extension type (see [Instructions per extension type](#instructions-per-extension-type)).

The 2 parameters sent to each extension are: a bounding box (top left and bottom right coordinates), and a bounding circle (the centre coordinates and a radius in kilometres).

We recommend using the bounding box as this closely matches what the user selected, while the circle reaches a bit outside of the selected area. Some api’s might only support the circular selection, but try to use the bounding box where possible.

## Expected return format
Each extension should return an array of SourceInformation. Any landmarks in this array that do not contain the following properties will not be saved in the app. Extra properties will also be ignored:
- __lat__ (number): Latitude coordinate of the landmark.
- __lng__ (number): Longitude coordinate of the landmark.
- __name__ (string): Name of the landmark.
- __description__ (string): Description or additional information about the landmark.
- __types__ (string[]): Types or categories associated with the landmark (e.g., historical, natural, cultural).

The 'types' field is required, but the array can be of length 0 for extensions that do not provide landmark type information. If there is already a landmark at a certain location, the types of the existing and new landmarks will be concatenated.

The returned data should look like this:
```json
[
    {
        "lat": 51.29475969153302,
        "lng": 4.28563820751224,
        "types": [
            "Historical"
        ],
        "name": "Fort Liefkenshoek",
        "description": "Fort Liefkenshoek is …"
    },
    { "..." }
]
```

## Variables
Some extensions might require additional information that we do not provide by default, such as an API available in multiple languages or an API key. To pass this information to an extension, you can utilise variables.

These variables need to be defined in a JSON file. Our app will then generate a form based on the variables specified in this configuration file. Here's a breakdown of the necessary fields:
- __name__ (string): The name of the variable.
- __title__ (string): The label displayed for the variable on the form.
- __type__ (string): The input type, which can be any HTML input type such as text, number, date, etc.
- __required__ (boolean): Indicates if the variable is required for the adapter to function.
- __options__ ({name: string, value: string}[]): A list of options for a select input; this property is only needed if the type is 'select'.

An example config file for an extension might look like this:
```json
[
    {
   	 "name": "language",
   	 "title": "Language",
   	 "type": "select",
   	 "required": true,
   	 "options": [
   		 {"name": "English", "value": "en"},
   		 {"name": "Nederlands", "value": "nl"},
   		 {"name": "Français", "value": "fr"},
   		 {"name": "Español", "value": "es"}
   	 ]
    },
    {
   	 "name": "api-token",
   	 "title": "Wikimedia Personal Access Token",
   	 "type": "text",
   	 "required": false
    }
]
```

## Submitting a new api for review
Adding a new extension to our marketplace is a straightforward process. Head over to the osta-extensions project on GitHub (accessible [here][1]) and initiate a new pull request. Within the pull request, you'll find a pre-existing template designed for submitting new extensions.

Ensure your pull request includes the following details: the extension's name, a brief description outlining its functionality or the latest updates, the URL leading to the extension, the URL directing to the configuration file, the languages supported by the extension, its applicable area, and any other options dictated by the extension type.

If you prefer not to self-host the configuration and extension code files, you have the option to host them elsewhere, such as GitHub. Simply provide us with the corresponding links to the files. It's important to note that the source code file should remain unchanged, as we store the hash per version. 

Instructions may vary based on the extension type, make sure to follow the instructions outlined below.

## Instructions per extension type
### Web-api extension
If you have a spreadsheet or something similar and you want to make it available as an extension, the web adapter is the best solution. It is also possible to host a more complex web api, as long as it returns the correct data.

#### Options
The only required option is urlFilterable. This indicates if the bounding box and bounding circle parameters should be sent as query parameters. If you are hosting the json file on a file server, sending these query parameters might cause the server to return an error.

#### Variables
The extensions variables will be sent to the API as query parameters. If you build your own API this might be useful to extend filtering over the default bounding box and circle. If urlFilterable is set to false, variables will still be sent as query parameters.

If we have a local web API that also accepts a language parameter, our network request would look like this:
```
http://localhost:8080/landmarks?language=en
```

#### Submitting web-api extensions
When submitting your web-api extension, make sure to provide the following information:
- Name
- Description
- Url: the url for the api (in our example: http://localhost:8080/landmarks)
- Config url: url where the config file can be found, if you are hosting a file server, you can also host this on the same server. This field can be left empty if no variables are needed
- Languages: a list of languages supported by the API
- Area: the area the extension applies to (use global if there is no specific region)
- urlFilterable: if the API endpoints support query params


### Python extension
If the API doesn't return the data in the required format, whether due to lack of ownership or the inability to update the API, you have the option to create your own converter using Python code.

Our python extension adapter utilises [JSPython][3] to interpret the written Python code. This interpreter does not fully support all Python functionality, so make sure to read the documentation carefully. You can also refer to our [wikipedia extension][2] as an example.

#### Available libraries
Web requests in our app are done using the [axios][4] library. This library is fully accessible in your Python code. A function fetching data from a test api might might look something like this:
```python
import axios

async def get_cat_fact():
    params = {"max_length": 30}
    return axios.get("https://catfact.ninja/fact", {params: params}).data
    
return get_cat_fact()
```

#### Options
No additional options are required for a Python extension. The file hash will be automatically calculated upon submission to the marketplace.

#### Parameters
The bounding box and bounding circle parameters are accessible as objects in the python code, no imports are needed to access them.
```python
return {
  "top-left": boundingBox.topLeft.lat,
  "top-right": boundingBox.topLeft.lng,
  "bounding-radius": boundingCircle.radius
}
```

#### Variables
You can access your custom variables using the 'getVariableFromStorage’ function. This function does not need to be imported. Say we have a variable called language with value english, this is what the code for getting the language variable would look like:
```python
async def get_language_variable():
    return getVariableFromStorage("language")
    
return get_language_variable()
```

#### Testing
In order to test a python extension, we provide a simple testing app, this can be found in the extensions project [here][1], under the ExtensionTester directory. This is a simple react app that provides the same functionality for extensions as the app.

To run the project, follow these steps:

1. Clone the Git project.
2. Open a terminal and navigate to the directory of the testing project.
3. Run the following command to install the necessary dependencies:
    ```bash
    npm install
    ```
4. After the installation is complete, start the development server with:
    ```bash
    npm run dev
    ```
The testing project should now be available at http://localhost:5173.

#### Submitting python extensions
When submitting your python extension, make sure to provide the following information:
- Name
- Description
- Url: the url where the python file can be downloaded from
- Config url: url where the config file can be found
- Languages: a list of supported languages
- Area: the area the extension applies to (use global if there is no specific region)

[1]: https://github.com/BauwenDR/osta-extensions
[2]: https://github.com/BauwenDR/osta-wikipedia-extension
[3]: https://jspython.dev/docs/intro
[4]: https://axios-http.com/docs/intro

## OSTA Projects
- [OSTA App](https://github.com/BauwenDR/osta)
- [OSTA Marketplace](https://github.com/BauwenDR/osta-marketplace)
- [OSTA Wikipedia Extension](https://github.com/BauwenDR/osta-wikipedia-extension)

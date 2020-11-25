<p align="center">
  <img src="/preview/icon.png?raw=true" alt="" height="100" />
</p>

# Spotter

Spotter is a productivity tool, the main function is to search and launch external application actions and applications themselves. (e.g. switch the next song or set a timer...) so you can stay focused on your current task. Kind of Spotlight or Alfred alternative.

* ❤️&nbsp;&nbsp;&nbsp;<b>Open source</b>
* 🤖&nbsp;&nbsp;&nbsp;<b>Native</b>
* 🔌&nbsp;&nbsp;&nbsp;<b>Plugin system</b>
* ⌨️&nbsp;&nbsp;&nbsp;<b>Custom hotkeys</b>

## Usage
[Beta versions](https://github.com/spotter-application/spotter/releases)

#### Сurrently supports the following plug-ins:
* <b>Applications</b><br/>
· Search / run by all installed applications<br/>
· Saving / restoring positions and sizes of running applications<br/>

* <b>Spotify</b><br/>
· Basic player functionality<br/>

* <b>Calculator</b><br/>
· Basic calculator functionality<br/>

#### Hotkeys
To run the app, press ```option + s```

## The main idea

* 🔮&nbsp;&nbsp;&nbsp;Provide an api on the native level
* ⚛️&nbsp;&nbsp;&nbsp;React app uses it and implements various plugins

It will allow the application to remain native and be available for developing javascript/typescript plugins.

## Contributing
After cloning & setting up the local project you can push the changes to your github fork and make a pull request.

Contributions are always welcome, no matter how large or small.

## How to develop
**React native requirements:**
*  [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)  version 11.3.1 or newer

* Ensure to install Xcode Command Line Tools. Open Xcode, then choose “Preferences…” from the Xcode menu. Go to the Locations panel and install the tools by selecting the most recent version in the Command Line Tools dropdown.

* Install  [CocoaPods](https://guides.cocoapods.org/using/getting-started.html)
`sudo gem install cocoapods`

* Install  [Node.js](https://nodejs.org/)  version 12 LTS or newer via  [HomeBrew](https://brew.sh/)
 `brew install node`

* Install  [Watchman](https://facebook.github.io/watchman)
`brew install watchman`


**Project**
* Clone repo
`git clone  https://github.com/spotter-application/spotter.git`

* Install node modules
`cd spotter && npm i`

* Install pods
`npm run install:macos`

* Run project
`npm start`

## License
GNU General Public License

# BrowserPuppeteer v0.1.0pre-alpha - Firefox extension 
Complete text command-based extention to control browser. It provides tab numbering functionality, allows user to quickly jump from tab-to-tab within numbers. 

## Features
1. Tabs, windows and groups numbering

 | Vertically aligned tabs | Horizontally aligned tabs |
 |:-----------------------:|:-------------------------:|
 ![Vertical numbered tabs][vertical tabs screenshot] | ![Horizontal numbered tabs][horizontal tabs screenshot]
 
 You can easily jump to that tabs by numbers, perform most of the available actions (See 3 section).

2. Ability to scroll overflowed TabBar with hotkeys without changing any focus. 

 - <kbd>Shift</kbd> + <kbd>PageUp</kbd> to scroll Top/Left;
 - <kbd>Shift</kbd> + <kbd>PageDown</kbd> to scroll Bottom/Right.

3. Text-based browser control with specific commands

 Call CommandsPopup with <kbd>Shift</kbd> + <kbd>Enter</kbd> and input what the browser should do, no more extra mouse movements.
 You can switch to, close, bookmark, move, reload/stop load, open, pin browser items with appending of some filters. Basically, you allowed to manipulate tabs, windows and groups ([TabGroups][tabgroups link] extension).
 
 For example: 
 
  - `x25-30,"example.com"!26,27,<study>` - this command will force browser to close tabs from 25 to 30, also ttabs with domain example.com, but will ignore 26,27 items and tabs, with word "study" in title;
  - `b"wikipedia.org","youtube.com"/work/neural networks/` - this command will bookmark all opened tabs with wikipedia.org and youtube.com in bookmark directory tree "work" -> "neural networks".

  | CommandsPopup with progress info | CommandsPopup with "list groups" command output info |
  |:--------------------------------:|:----------------------------------------------------:|
  ![Close windows command with progress displayed][commandspopup progress screenshot] | ![List groups command][commandspopup output screenshot]


[vertical tabs screenshot]:/../screenshots/vertical_tabs_numbered.png?raw=true "Numbering for vertical tabs"
[horizontal tabs screenshot]:/../screenshots/horizontal_tabs_numbered.png?raw=true "Numbering for horizontal tabs"
[tabgroups link]:https://addons.mozilla.org/uk/firefox/addon/tab-groups-panorama/
[commandspopup progress screenshot]:/../screenshots/cmd_progress_demo.png?raw=true "CommandsPopup with 'x10-e' - [Close tabs from 10 to the End] command output"
[commandspopup output screenshot]:/../screenshots/cmd_lg_output.png?raw=true "CommandsPopup with 'lg' - [List Groups] command output"

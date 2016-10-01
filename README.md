# BrowserPuppeteer v0.1.0pre-alpha - Firefox extension 
Complete text command-based extension to control browser. It provides tab numbering functionality, allows user to quickly jump from tab-to-tab within numbers. 

## Features
1. Tabs, windows and groups numbering

 | Vertically aligned tabs | Horizontally aligned tabs | Window/group |
 |:-----------------------:|:-------------------------:|:------------:|
 ![Vertical numbered tabs][vertical tabs screenshot] | ![Horizontal numbered tabs][horizontal tabs screenshot] | ![Current window/group buttons][state buttons screenshot]
 
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


***
## Commands structure
Each command consists of several sections : action to do, target to act with, action specific flags and additional (global) flags. Number of sections is variable and depends on action type.

<pre>

							          ┌─┬─────┬──┬───┐
							          │m│25-40│@2│!30│
							          └┬┴──┬──┴─┬┴─┬─┘
							           │   │    │  │
							          s1  s2   s3  sN <- sections
							           │   │    │  │
							   Action <┘   │    │  └> Additional flags
							   Target <────┘    │
							   Flags  <─────────┘

</pre>

`m25-40@2!30` - Move tabs from 25 to 40 at position with index 2, exclude from this action tab with index 30.

### Actions

 - [Switch to (default)](/docs/COMMANDS.md#switch-to-default)
 - [List items](/docs/COMMANDS.md#list-items)
 - [Create item](/docs/COMMANDS.md#create)
 - [Stop tab loading](/docs/COMMANDS.md#stop-loading)
 - [Reload tab](/docs/COMMANDS.md#reload)
 - [Pin/unpin tab](/docs/COMMANDS.md#pinunpin)
 - [Close item](/docs/COMMANDS.md#close)
 - [Bookmark tab](/docs/COMMANDS.md#bookmark)
 - [Move tab](/docs/COMMANDS.md#move)
 

### Targets
```
							  +-----------------------------------------------------+
                              |              	Multiple vlaues                     |
   +--------------------------+--------------+-------+--------------+---------------+
   |       Target             |Several values| Range |  Host search |  Title search |
   +-----------------+--------+--------------+-------+--------------+---------------+
   | Tab modifier    |  1..N  |    1, 2, 3   |  1-4  | "example.com"|    <word>     |
   | Window modifier | w1..wN |   w1, w2, w5 | w1-w5 |       -      |       -       |
   | Group modifier  | g1..gN |   g1, g2, g5 | g1-g5 |       -      |       -       |
   +-----------------+--------+--------------+-------+--------------+---------------+
                     |		   	 Explicit            |           Implicit           |
                     +-------------------------------+------------------------------+
```
Types:
 - tab - number from 1 to N;
	* 1, 2, 55, 100;
 - window - w + number from 1 to N;
	* w1, w2, w55, w100;
 - group - g + number from 1 to N;
	* g1, g2, g55, g100.

Multiple targets are supported, and can be specified in explicit and implicit ways.
 - Explicitly: 
	- comma separated values - "several value";
		* 1, 2, 3, 4, 5;
	- range specific values with reverse range support  - "range";
		* 1-5 or 5-1;

 - Implicitly:
	- by searching matches in url, currently are supported only host matches - "host search";
		* "google.com";
	- by searching matches in tab title - "title search";
		* \<some phrase in title>.


Targets, that are being current items, are substituted automatically, the same with last existing item modifier. For example, we need to move current tab with position 25 to the position(index) 40, that is the last one, so can write:
 - `m25@40` - its without substitution;
 - `m@e` - its with substitution.

Both above commands are same.


More examples: 
 - `xw` - close current window;
 - `xg` - close current group;
 - `x` - close current tab;
 - `x-e` - close tabs from the current (including) to the end;
 - `xe-` - close tabs from the end to the current (including);
 - `x""` - close tabs with host of current tab;
 - `x""5` - close tabs with host of the tab 5.

Also note two things about title searches:
 1. You can provide nested searches in tab title:
  - `< word 1 >,< word 2>` - means to search " word 1 " OR " word 2 ";
  - `< word 1 & word 2 >` - means to search " word 1 " AND " word 2 ".

 2. Beware logical ambiguity in title searches:
  - `<eat>` - will match both "eat" and "neat";
  - `< eat >` - will match only "eat" and will match anywhere, except the beggining or the end of the line (its because of spaces).

### Additional flags
Currently there are only one type of additional flags: exclude specified targets from command.
Syntax is the same,as for targets, except control character - `!`. Excluding list should always be the last in the whole command.

Examples:
 - `x-e!` - close tabs from the current (excluding) to the end;
 - `m"youtube.com"g5!<music>` - move tabs with host "youtube.com" to the group 5, exclude tabs with word "music" in title.


## Useful examples            

 - `b` - bookmark current tab;
 - `c` - create new tab;
 - `23` - switch to tab with index 23;
 - `cg` - create new tabs group;
 - `cw` - create new window;
 - `g7` - switch to group with index 7; 
 - `lg` - list currently opened groups with index info;
 - `lw` - list currently opened windows with index info;
 - `w5` - switch to window with index 5;
 - `xw` - close current window;
 - `m@e` - move current tab to the end;
 - `x""` - close all tabs with currenly opened host (like youtube.com etc);
 - `x-e` - close all tabs from current(including) to the end;
 - `p1-3` - toggle pinning of tabs from 1 to 3;
 - `s1-e` - stop loading of the tabs from first to the last;
 - `x""3` - close all tabs with host, opened in tab with index 3;
 - `x-e!` - close all tabs from current(excluding) to the end;
 - `m25@1` - move tab with index 25 on to position 1;
 - `xw2-w5` - close windows from 2 to 5;
 - `m<.pdf>w3` - move all tabs with ".pdf" word in title to the window 3;
 - `x22-35,w1,g5` - close tabs from 22 to 35, also close window 1 and group 5;
 - `r"github.com"` - reload all tabs, with github.com site;
 - `x"youtube.com"` - close all tabs with opened youtube.com site;
 - `x22,34,45-60!51` - close tabs 22,23, from 45 to 60, except 51;
 - `x-e!"youtube.com"` - close all tabs from current to the end, except tabs with opened youtube.com;
 - `b1-e/toRead/genetics/` - bookmark tabs from first to last into folder tree "toRead"->"genetics";
 - `x""5,""2,<cooking>!23-40` - close all tabs with hosts, opened in tab 5 and in tab 2, also close tabs with word "cooking" in title, but exclude from closing tabs from 23 to 40;
 - `m<funny & cats>,<funny & dogs>w2` - move all tabs with words in title "funny " AND " cats" or "funny " AND " dogs" to the window 2 (note spaces usage);
 - `x1-e!"google.com","wikipedia.org",<work>` - close tabs from first to the last one, except tabs with opened google.com site, wikipedia.org site, and except tabs with word "work" in title.

***

[vertical tabs screenshot]:/../screenshots/vertical_tabs_numbered.png?raw=true "Numbering for vertical tabs"
[horizontal tabs screenshot]:/../screenshots/horizontal_tabs_numbered.png?raw=true "Numbering for horizontal tabs"
[state buttons screenshot]:/../screenshots/state_buttons.png?raw=true "Current window/group buttons with identificators"
[tabgroups link]:https://addons.mozilla.org/uk/firefox/addon/tab-groups-panorama/
[commandspopup progress screenshot]:/../screenshots/cmd_progress_demo.png?raw=true "CommandsPopup with 'x10-e' - [Close tabs from 10 to the End] command output"
[commandspopup output screenshot]:/../screenshots/cmd_lg_output.png?raw=true "CommandsPopup with 'lg' - [List Groups] command output"

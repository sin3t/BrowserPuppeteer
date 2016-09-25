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

 - [Switch to (default)](#switch-to-default)
 - [List items](#list-items)
 - [Create item](#create)
 - [Stop tab loading](#stop-loading)
 - [Reload tab](#reload)
 - [Pin/unpin tab](#pinunpin)
 - [Close item](#close)
 - [Bookmark tab](#bookmark)
 - [Move tab](#move)
 

### Targets
Types:
 - tab - number from 1 to N
	* 1, 2, 55, 100 
 - window - w + number from 1 to N
	* w1, w2, w55, w100
 - group - g + number from 1 to N
	* g1, g2, g55, g100

Multiple targets are supported, and can be specified in explicit and implicit ways.

 - Explicitly: 
	- comma separated values - "several value" 
		* 1, 2, 3, 4, 5;
	- range specific values with reverse range support  - "range" 
		* 1-5 or 5-1;

 - Implicitly:
	- by searching matches in url, currently are supported only host matches - "host search" 
		* "google.com"
	- by searching matches in tab title - "title search" 
		* \<some phrase in title>


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



***

## Actions list
### Switch to [default] 
```
   +-----------------------------------------------------+
s1 | Switch to specific item			    		     |
   +---------------------+-------+-------+------+--------+
   |       Target        |Several| Range | Host | Title  |
   |---------------------|values |       |search| search |
s2 | Tab modifier    | + |   -   |   -   |  -   |   -    |
   | Window modifier | + |   -   |   -   |  -   |   -    |
   | Group modifier  | + |   -   |   -   |  -   |   -    |
   +---------------------+-------+-------+------+--------+
   |25                                                   |
   |    Go to the tab with number 25				     |
   |w3                                                   |
   |    Go to the window 3							     |
   |g5                                                   |
   |    Go to the group 5							     |
   +-----------------------------------------------------+
```

### List items 
```
   +-----------------------------------------------------+
s1 | l - list items 					    		     |
   +---------------------+-------+-------+------+--------+
   |       Target        |Several| Range | Host | Title  |
   |---------------------|values |       |search| search |
s2 | Tab modifier    | - |   -   |   -   |  -   |   -    |
   | Window modifier | + |   -   |   -   |  -   |   -    |
   | Group modifier  | + |   -   |   -   |  -   |   -    |
   +---------------------+-------+-------+------+--------+
sN | Not supported                                       |
   +-----------------------------------------------------+
   |lw                                                   |
   |    Load and show list of the opened windows in      |
   |	format "Index:Count of tabs:Title: Thumbail".    |
   |lg                                                   |
   |    Load and show list of the opened groups in       |
   |	format "Index:Count of tabs:Title: Thumbnail".   |
   +-----------------------------------------------------+
```

### Create 
```
   +-----------------------------------------------------+
s1 | c - create item					    		     |
   +---------------------+-------+-------+------+--------+
   |       Target        |Several| Range | Host | Title  |
   |---------------------|values |       |search| search |
s2 | Tab modifier    | + |   +   |   +   |  -   |   -    |
   | Window modifier | + |   +   |   +   |  -   |   -    |
   | Group modifier  | + |   +   |   +   |  -   |   -    |
   +---------------------+-------+-------+------+--------+
sN | Not supported                                       |
   +-----------------------------------------------------+
   |c                                                    |
   |    Create new tab 								     |
   |c5                                                   |
   |    Create new tab in specific position. This feature|
   |	is supported only by tabs (now). 				 |
   |cw                                                   |
   |    Create new window							     |
   +-----------------------------------------------------+
```

### Stop loading
```
   +-----------------------------------------------------+
s1 | s  - stop loading of the tab					     |
   +---------------------+-------+-------+------+--------+
   |       Target        |Several| Range | Host | Title  |
   |---------------------|values |       |search| search |
s2 | Tab modifier    | + |   +   |   +   |  +   |   +    |
   | Window modifier | - |   -   |   -   |  -   |   -    |
   | Group modifier  | - |   -   |   -   |  -   |   -    |
   +---------------------+-------+-------+------+--------+
sN | Supported                                           |
   +-----------------------------------------------------+
   |s1-60                                                |
   |    Stop loading tabs  from 1 to 60				     |
   +-----------------------------------------------------+
```

### Reload
```
   +-----------------------------------------------------+
s1 | r  - reload tab		   							 |
   +---------------------+-------+-------+------+--------+
   |       Target        |Several| Range | Host | Title  |
   |---------------------|values |       |search| search |
s2 | Tab modifier    | + |   +   |   +   |  +   |   +    |
   | Window modifier | - |   -   |   -   |  -   |   -    |
   | Group modifier  | - |   -   |   -   |  -   |   -    |
   +---------------------+-------+-------+------+--------+
sN | Supported                                           |
   +-----------------------------------------------------+
   |r-e                                                  |
   |    Force reloading tabs from current to the end     |
   +-----------------------------------------------------+
```

### Pin/unpin
```
   +-----------------------------------------------------+
s1 | p - toggle pinning of the tab 						 |	
   +---------------------+-------+-------+------+--------+
   |       Target        |Several| Range | Host | Title  |
   |---------------------|values |       |search| search |
s2 | Tab modifier    | + |   +   |   +   |  +   |   +    |
   | Window modifier | - |   -   |   -   |  -   |   -    |
   | Group modifier  | - |   -   |   -   |  -   |   -    |
   +---------------------+-------+-------+------+--------+
sN | Supported                                           |
   +-----------------------------------------------------+
   |p1,3                                                 |
   |    Toggle pinning of the tabs 1 and 3				 |
   +-----------------------------------------------------+
```

### Close
```
   +-----------------------------------------------------+
s1 | x - close item                						 |	
   +---------------------+-------+-------+------+--------+
   |       Target        |Several| Range | Host | Title  |
   |---------------------|values |       |search| search |
s2 | Tab modifier    | + |   +   |   +   |  +   |   +    |
   | Window modifier | + |   +   |   +   |  -   |   -    |
   | Group modifier  | + |   +   |   +   |  -   |   -    |
   +---------------------+-------+-------+------+--------+
sN | Supported                                           |
   +-----------------------------------------------------+
   |x                                                    |
   |    Close current tab								 |
   |xw                                                   |
   |    Close current window							 |
   |x1-5,w2-w6,g1,g3-g5                                  |
   |    Close tabs from 1 to 5, windows from 2 to 6, and |
   |    group 1 and groups from 3 to 5					 |
   +-----------------------------------------------------+
```

### Bookmark
```
   +-----------------------------------------------------+
s1 | b - bookmark tab              						 |
   +---------------------+-------+-------+------+--------+
   |       Target        |Several| Range | Host | Title  |
   |---------------------|values |       |search| search |
s2 | Tab modifier    | + |   +   |   +   |  +   |   +    |
   | Window modifier | - |   -   |   -   |  -   |   -    |
   | Group modifier  | - |   -   |   -   |  -   |   -    |
   +---------------------+-------+-------+------+--------+
s3 | /folder/subfolder/ 					   [optional]|
   |	| Bookmark at specific folder in tree.  		 |
   |	| Default is root folder, and it is "unfilled".  |
   |	| If folder not exists, extension will create it.|
   +-----------------------------------------------------+
sN | Supported                                           |
   +-----------------------------------------------------+
   |b1-5,<.pdf>,"wikipedia.org"/work/data for report/    |
   |    Bookmark tabs from 1 to 5, tasb with ".pdf" in   |
   |    title, and tabs with opened wikipedia.org domain |
   |    into folder tree "work"->"data for report".      |
   |b1-e                                                 |
   |	Bookmark tabs from 1 to the last one into root.  |
   +-----------------------------------------------------+
```

### Move
```
   +-----------------------------------------------------+
s1 | m - move tab               						 |
   +---------------------+-------+-------+------+--------+
   |       Target        |Several| Range | Host | Title  |
   |---------------------|values |       |search| search |
s2 | Tab modifier    | + |   +   |   +   |  +   |   +    |
   | Window modifier | - |   -   |   -   |  -   |   -    |
   | Group modifier  | - |   -   |   -   |  -   |   -    |
   +---------------------+-------+-------+------+--------+
s3 | @4 | Move AT speicifc position                      |
   | a4 | Move AFTER specific position                   |
   | b4 | Move BEFORE specific position                  |
   | g4 | Move at specific GROUP                         |
   | w4 | Move at specific WINDOW, tab will be moved     |
   | 	| without statate change (form data, state of the| 
   | 	| window player won't be interrupted)            |
   +-----------------------------------------------------+
sN | Supported											 |
   +-----------------------------------------------------+
   |m24-50,72,"ex.com",<word>@5                          |
   |    Move tabs from 24 to 50 and 72, also tabs witg   |
   |    opened host "ex.com", and tabs with word "word"  |
   |    in title to the position 5.    				     |
   |                                                     |
   | m1-ew3!<needed info>                                |
   |     Move tab from 1 to the last to the window 3     |
   |     except tabs with word "needed info" in title.   |
   |                                                     |
   | m@e                                                 |
   |     Move current tab to the end.                    |
   +-----------------------------------------------------+
```




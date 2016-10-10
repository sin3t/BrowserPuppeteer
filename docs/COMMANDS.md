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
```
                              +-----------------------------------------------------+
                              |                 Multiple vlaues                     |
   +--------------------------+--------------+-------+--------------+---------------+
   |       Target             |Several values| Range |  Host search |  Title search |
   +-----------------+--------+--------------+-------+--------------+---------------+
   | Tab modifier    |  1..N  |    1, 2, 3   |  1-4  | "example.com"|    <word>     |
   | Window modifier | w1..wN |   w1, w2, w5 | w1-w5 |       -      |       -       |
   | Group modifier  | g1..gN |   g1, g2, g5 | g1-g5 |       -      |       -       |
   +-----------------+--------+--------------+-------+--------------+---------------+
                     |           Explicit            |           Implicit           |
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
    - direct item modifier;
        * 15;
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
 - `x22,34,45-60!51` - close tabs 22,34, from 45 to 60, except 51;
 - `x-e!"youtube.com"` - close all tabs from current to the end, except tabs with opened youtube.com;
 - `b1-e/toRead/genetics/` - bookmark tabs from first to last into folder tree "toRead"->"genetics";
 - `x""5,""2,<cooking>!23-40` - close all tabs with hosts, opened in tab 5 and in tab 2, also close tabs with word "cooking" in title, but exclude from closing tabs from 23 to 40;
 - `m<funny & cats>,<funny & dogs>w2` - move all tabs with words in title "funny " AND " cats" or "funny " AND " dogs" to the window 2 (note spaces usage);
 - `x1-e!"google.com","wikipedia.org",<work>` - close tabs from first to the last one, except tabs with opened google.com site, wikipedia.org site, and except tabs with word "work" in title.

***

## Actions list
### Switch to [default] 
```
+----+-----------------------------------------------------+
| s1 |   - switch to specific item                         |
+----+---------------------+-------+-------+-------+-------+
|    |       Target        |Several| Range |Host   |Title  |
|    |                     |values |       |search |search |
|    +-----------------+---+-------+-------+-------+-------+
| s2 | Tab modifier    | ✔ |   ✘   |   ✘   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Window modifier | ✔ |   ✘   |   ✘   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Group modifier  | ✔ |   ✘   |   ✘   |   ✘   |   ✘   |
+----+-----------------+---+-------+-------+-------+-------+
|    |25                                                   |
|    |    Go to the tab with number 25.                    |
|e.g.|w3                                                   |
|    |    Go to the window 3.                              |
|    |g5                                                   |
|    |    Go to the group 5.                               |
+----+-----------------------------------------------------+
```

### List items 
```
+----+-----------------------------------------------------+
| s1 | l - list items                                      |
+----+---------------------+-------+-------+-------+-------+
|    |       Target        |Several| Range |Host   |Title  |
|    |                     |values |       |search |search |
|    +-----------------+---+-------+-------+-------+-------+
| s2 | Tab modifier    | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Window modifier | ✔ |   ✘   |   ✘   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Group modifier  | ✔ |   ✘   |   ✘   |   ✘   |   ✘   |
+----+-----------------+---+-------+-------+-------+-------+
| sN | Not supported                                       |
+----+-----------------------------------------------------+
|    |lw                                                   |
|    |    Load and show list of the opened windows in      |
|e.g.|    format "Index:Count of tabs:Title: Thumbail".    |
|    |lg                                                   |
|    |    Load and show list of the opened groups in       |
|    |    format "Index:Count of tabs:Title: Thumbnail".   |
+----+-----------------------------------------------------+
```

### Create 
```
+----+-----------------------------------------------------+
| s1 | c - create item                                     |
+----+---------------------+-------+-------+-------+-------+
|    |       Target        |Several| Range |Host   |Title  |
|    |                     |values |       |search |search |
|    +-----------------+---+-------+-------+-------+-------+
| s2 | Tab modifier    | ✔ |   ✔   |   ✔   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Window modifier | ✔ |   ✔   |   ✔   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Group modifier  | ✔ |   ✔   |   ✔   |   ✘   |   ✘   |
+----+-----------------+---+-------+-------+-------+-------+
| sN | Not supported                                       |
+----+-----------------------------------------------------+
|    |c                                                    |
|    |    Create new tab.                                  |
|    |c5                                                   |
|e.g.|    Create new tab in specific position. This feature|
|    |    is supported only by tabs (now).                 |
|    |cw                                                   |
|    |    Create new window.                               |
+----+-----------------------------------------------------+
```

### Stop loading
```
+----+-----------------------------------------------------+
| s1 | s - stop loading of the tab                         |
+----+---------------------+-------+-------+-------+-------+
|    |       Target        |Several| Range |Host   |Title  |
|    |                     |values |       |search |search |
|    +-----------------+---+-------+-------+-------+-------+
| s2 | Tab modifier    | ✔ |   ✔   |   ✔   |   ✔   |   ✔   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Window modifier | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Group modifier  | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
+----+-----------------+---+-------+-------+-------+-------+
| sN | Supported                                           |
+----+-----------------------------------------------------+
|e.g.|s1-60                                                |
|    |    Stop loading tabs  from 1 to 60.                 |
+----+-----------------------------------------------------+
```

### Reload
```
+----+-----------------------------------------------------+
| s1 | r - reload tab                                      |
+----+---------------------+-------+-------+-------+-------+
|    |       Target        |Several| Range |Host   |Title  |
|    |                     |values |       |search |search |
|    +-----------------+---+-------+-------+-------+-------+
| s2 | Tab modifier    | ✔ |   ✔   |   ✔   |   ✔   |   ✔   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Window modifier | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Group modifier  | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
+----+-----------------+---+-------+-------+-------+-------+
| sN | Supported                                           |
+----+-----------------------------------------------------+
|e.g.|r-e                                                  |
|    |    Force reloading tabs from current to the end.    |
+----+-----------------------------------------------------+
```

### Pin/unpin
```
+----+-----------------------------------------------------+
| s1 | p - toggle pinning of the tab                       |
+----+---------------------+-------+-------+-------+-------+
|    |       Target        |Several| Range |Host   |Title  |
|    |                     |values |       |search |search |
|    +-----------------+---+-------+-------+-------+-------+
| s2 | Tab modifier    | ✔ |   ✔   |   ✔   |   ✔   |   ✔   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Window modifier | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Group modifier  | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
+----+-----------------+---+-------+-------+-------+-------+
| sN | Supported                                           |
+----+-----------------------------------------------------+
|e.g.|p1,3                                                 |
|    |    Toggle pinning of the tabs 1 and 3.              |
+----+-----------------------------------------------------+
```

### Close
```
+----+-----------------------------------------------------+
| s1 | x - close item                                      |
+----+---------------------+-------+-------+-------+-------+
|    |       Target        |Several| Range |Host   |Title  |
|    |                     |values |       |search |search |
|    +-----------------+---+-------+-------+-------+-------+
| s2 | Tab modifier    | ✔ |   ✔   |   ✔   |   ✔   |   ✔   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Window modifier | ✔ |   ✔   |   ✔   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Group modifier  | ✔ |   ✔   |   ✔   |   ✘   |   ✘   |
+----+-----------------+---+-------+-------+-------+-------+
| sN | Supported                                           |
+----+-----------------------------------------------------+
|    |x                                                    |
|    |    Close current tab.                               |
|    |xw                                                   |
|e.g.|    Close current window.                            |
|    |x1-5,w2-w6,g1,g3-g5                                  |
|    |    Close tabs from 1 to 5, windows from 2 to 6, and |
|    |    group 1 and groups from 3 to 5.                  |
+----+-----------------------------------------------------+
```

### Bookmark
```
+----+-----------------------------------------------------+
| s1 | b - bookmark tab                                    |
+----+---------------------+-------+-------+-------+-------+
|    |       Target        |Several| Range |Host   |Title  |
|    |                     |values |       |search |search |
|    +-----------------+---+-------+-------+-------+-------+
| s2 | Tab modifier    | ✔ |   ✔   |   ✔   |   ✔   |   ✔   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Window modifier | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Group modifier  | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
+----+-----------------+---+-------+-------+-------+-------+
|    |/folder/subfolder/                       [optional]  |
| s3 |    Bookmark at specific folder in tree.             |
|    |    Default is root folder, and it is "unfilled".    |
|    |    If folder not exists, extension will create it.  |
+----+-----------------------------------------------------+
| sN | Supported                                           |
+----+-----------------------------------------------------+
|    |b1-5,<.pdf>,"wikipedia.org"/work/data for report/    |
|    |    Bookmark tabs from 1 to 5, tasb with ".pdf" in   |
|e.g.|    title, and tabs with opened wikipedia.org domain |
|    |    into folder tree "work"->"data for report".      |
|    |b1-e                                                 |
|    |    Bookmark tabs from 1 to the last one into root.  |
+----+-----------------------------------------------------+
```

### Move
```
+----+-----------------------------------------------------+
| s1 | m - move tab                                        |
+----+---------------------+-------+-------+-------+-------+
|    |       Target        |Several| Range |Host   |Title  |
|    |                     |values |       |search |search |
|    +-----------------+---+-------+-------+-------+-------+
| s2 | Tab modifier    | ✔ |   ✔   |   ✔   |   ✔   |   ✔   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Window modifier | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
|    +-----------------+---+-------+-------+-------+-------+
|    | Group modifier  | ✘ |   ✘   |   ✘   |   ✘   |   ✘   |
+----+-----------------+---+-------+-------+-------+-------+
|    | @4 - Move AT specifc position.                      |
|    +-----------------------------------------------------+
|    | a4 - Move AFTER specific position.                  |
|    +-----------------------------------------------------+
|    | b4 - Move BEFORE specific position.                 |
| s3 +-----------------------------------------------------+
|    | g4 - Move at specific GROUP.                        |
|    +-----------------------------------------------------+
|    | w4 - Move at specific WINDOW, tab will be moved     |
|    |      without statate change (form data, state of the|
|    |      window player won't be interrupted).           |
+----+-----------------------------------------------------+
| sN | Supported                                           |
+----+-----------------------------------------------------+
|    |m24-50,72,"ex.com",<word>@5                          |
|    |    Move tabs from 24 to 50 and 72, also tabs witg   |
|    |    opened host "ex.com", and tabs with word "word"  |
|    |    in title to the position 5.                      |
|e.g.|m1-ew3!<needed info>                                 |
|    |    Move tab from 1 to the last to the window 3      |
|    |    except tabs with word "needed info" in title.    |
|    |m@e                                                  |
|    |    Move current tab to the end.                     |
+----+-----------------------------------------------------+
```




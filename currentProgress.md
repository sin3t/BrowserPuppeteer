        TODO: Provide ability to create aliases -> :acloseRight -> :x-e
                alias begins with :a -> alias need storage API/prefs API? 
                ex -> :aneedToWork -> :x"youtube.com","twitter.com","vk.com", "reddit.com"
                ex -> :aneedToRelax -> :o/youtube.com/, /reddit.com/
                ex -> :atimeToWTF   -> :od02m
                                       :oddmm
                                       :o03dd05mm
        TODO: Add TreeStyleTab API support, for tree manipulation

```

 So, basic command patterns 

State| Cmd                  |  Description  
|----|----------------------|-------------------------------------------------------------
| +  |5                     | goes to the 5 tab
| +  |g1                    | goes to the 1 group
|    |g/oldName/->/newName/ | rename group?
|    |15g1"                 | goest the 1 group, 15 tab in THAT group
|    | x<some content>      | hiden action, dont show in cmd history
| +  |x125                  | close 125 tab
| +  |x125-150              | close tabs from 125 to 150
| +- |m105g1                | move 105th tab to the group 1
| +- |m105-110g1            | move 105-110 tabs to the group 1
| +- |m105,106,102,5g1      | move this tabs to the group 1
| +- |m101,102g1            | move 102,102 to g1
| +- |m101,102,103-110g1    |
| +- |m10,12a5              | after 5
| +- |m10,12b5              | before 5
| +  |m15@5                 | move 15th tab at 5, actually the same as m15b5
| +  |ma5                   | move current after 5
| +  |m10b5                 | move 10th tab before 5
| +  |mae                   | move current to the end
| +  |mbe                   | move current tab before the last one
| +  |m@5                   | move current tab at 5th tab position
| +- |m"google.com"a5       | move all google.com sites after 5 tab
| +- |m"google.com"g5       | move all google.com sites into the group 5
| +  |mw5                   | move tab to the 5-th window
| +  |m25@1                 |
| +  |m25w2                 |
|    |m25@5w2               | @NUMBER - specify position
|    |m25@ew2               |
|    |m25w2@5               |
| +  |m25g5                 |
|    |u25                   | unload 25th tab
|    |u10-40                | unload tabs from 10 to 40
| +  |r10-20                | reload tabs from 10 to 20
| +  |s10-20                | stop reloading tabs from 10 to 20
| +- |c15                   | create tab with index 15, if there will <15, set tab the last
|    |c1g1                  | create tab with index 1 in group 1
| +- |cg1                   | create tab in group 1
| +  |b1-15                 | bookrmark 1-15 tabs
| +  |b/dir/subDir/1-9      | go dir, then subDir, and then save 1-9 tab 
|    |bg1                   | bookrmark all group 1
|    |bg                    | bookmark current group in new folder with group name
| +  |b123,25/BookmarkFolderName/
| +  |b/BookmarkFolderName/23,25
| +  |b""                   | bookmark all tabs, that belongs to the currently opened host
|    |b/oldDirName/->/newDirName/
| +  |xg1                   | close all group 1
| +  |xg                    | close current group
|    |X                     | undo last closing  |  can be done with remmembering last position + url pairs
| +  |x101,102,g1           | close 102,102 and group1
|    |c10g1                 | create 10 in g1
| +  |x""                   | close all tabs, that include current domain
|    |x""!1-5,10-30         | close all host in specific diapason  |  [6-9]
|    |x""[6-9]              | close all host in specific diapason?
| +  |x"google.com"         |
| +  |x""5,""4              | close tabs with host, opened in 5 and 4th tabs?
| +  |x"google.com",23,25   |
| +  |x"google.com"!        | close all google.com sites except active 
| +  |x"google.com"!52      | close all google.com sitex exept with id 52
| +  |x"google,com"!52-72   | close all google.com sites except range 52-72
| +  |!52                   | exclude tab with id 52
| +  |!                     | exclude current active tab
| +  |x15-e                 | close from 15th tab to the end
| +  |x-e                   | close from the current to the end
| +  |x1-                   | close from the beggining to the current tab including
| +  |x1-!                  | close from beggining to the current tab excluding it
| +  |x30-10                | close from 10 to 30 (reverse order)
| +  |w1                    | go the window 1
| +  |xw1                   | close window 1
|    |x.                    | close all tabs, specified in previous command, actually must work only after "b" and "?"
| +- |gn                    | next tab Group
|    |gp                    | previous tabGroup
| +- |cg                    | create new tab Group
|    |cg/GroupName/         | create specific group with name
| +  |cw                    | create new window
| +  |p                     | toggle pinning of the current tab
| +  |p4                    | toogle pinning of the tab with index 4
|    |3,5,7                 | onKeyPress circle navigation, alt+tab?, F1,F2,F3?, Ctrl-[1,2,3]
| +- |lw                    | list [id|title] windows pairs
|    |lt                    | list [id|tabTitle] pairs, can be columned
| +- |lg                    | list [id|groupName] pairs
|    |?t"inURL"             | search in tabs urls
|    |?<title>,<title>      |
|    |?<title>w             | search tab in opened windows
|    |?<title>b             | search tab in bookmarkings
|    |?<title>g             | search tab in all window' groups
|    |?<title>b/dir/subDir/ | search tab by word "title" in Bookmars dir/subDir
| +  |b<title>/dir/subDir/  | bookmark tabs with word "title" in title to the dir/subDir
| +  |x<title>              | close tabs with "title" word in title
| +  |x<word 1>,<word 2>    | close with word 1 OR word 2
| +  |x<word 1 & word 2>    | close with word 1 AND word 2
|    |?<>                   | search in current visible window/group
|    |?<>w                  | search in all visible tabs of the all windows; can be implmented only after adding remote commands feature
|    |?<>g                  | search in all groups of the current window <br> -> need to map all the groups? -> go by 15g3, 15g/media/
|    |?<>wg                 | search in all groups of the all windows  <br> -> go by 15w3g5 -> w3+g5+15 OR w3,g5,15
|    |?<>h                  | search in history -> cannt be mapped to idexes -> go/open by URL
|    ||TREE STYLE TAB dependent -> begins with t
|    |tt25,26,28            | create tree 
|    |tc25                  | collapse tree with 25th tab
|    |tut25                 | uncollpase tree with 25-th tab (in head or in body?)
|    |tx25                  | close tree with 25-th tab
|    |tm25b                 | move tree one level higher
|    |tm25a                 | move tree one level lower
|    ||REMOTE COMMANDS SUPPORT
|    |w3x5                  | delete tab 5 in window 3 ->  can be done with translating <br> messages between tabsManagers w3[smth]? -> send to w3 manager [smth]
|    ||SYNCED TABS SUPPORT
|    |o%sync                |
|    |h                     | display help or history ?
|    |f                     | force focus change?
|    |m25g1f                | move 25th tab into group 1 and focus it

```

```
  Feature request: highlight tabs, passed to the cmd window
                     reg - on close, blue - on move, green - on bookmarking

  Numeration states:
      Reservational   -> keep tab index until close
      Reservationaless-> change tab index on tab open/close/move? events
  Numeration behaviours:
      Global      -> 1-N tabs ; Group (1-K), Group(K++ - M), Group(M++ - N)
          |- Relative     (5 3 1 [0] 2 4 6)
          |- Sequiental   (1 2 [3] 4 5 6)
       PerGroup   -> Group(1-N tabs), Group(1-N tabs) etc 
          |- Relative
          |- Sequiental



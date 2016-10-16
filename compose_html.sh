#!/bin/bash
# Usage
# 1. Generate html with styles into generated-docs.html
#   bash compose_html.sh > generated-docs.html
# a2. Commit changes to current branch
# a3. Switch to main branch (development), and sync documentation versions
#   OR
# b2. Copy changes files directrly in main branch -> NOT Recommended

CSS_FILE="implied_style.css"
HTML_TEMPLATE_FILE="html_struct_template.txt"
rst2htmlCMD="rst2html2 -v --template=$HTML_TEMPLATE_FILE"
META_DATA="<meta charset="UTF-8">"

COMMANDS=$(git show develoment:docs/COMMANDS.md)

read -r -d '' STYLE <<- EOP
	<style type='text/css'>
	$(cat $CSS_FILE)
	</style>
EOP

echo "$META_DATA"
echo "$STYLE"
echo "$COMMANDS" \
    | sed -n '/^## Actions list$/,/^## /{/^## \|```\|^###/!p;}' \
    | awk -v genhtmlcom="$rst2htmlCMD" \
        'BEGIN \
        {print "<h3> Actions list </h3>";
         print "<ul>";
         FS="\n";
         RS="";
         counter=0;}
            {rstTable=$0;
             accesskey=substr($2,8,1);
             actionDescr=substr($2,7,1)"<u>"accesskey"</u>"substr($2,9,35);
             print "<li>";
             print "<input type=checkbox id=item-"counter" oninput=\"!this.checked || this.scrollIntoView()\">";
             print "<label for=item-"counter"></label>";
             print "<label for=item-"counter" class=data accesskey=\""accesskey"\"> "actionDescr" </label>";
             print "<div>";
             cmd=genhtmlcom" << EOF\n"rstTable"\nEOF";
             system(cmd);
             close(cmd);
             print "</div>";
             print "</li>"
             counter++;}
        END \
        {print "</ul>"}'

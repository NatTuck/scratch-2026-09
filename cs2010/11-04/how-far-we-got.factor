USING: io io.encodings.utf8 io.files io.files.private
  prettyprint sequences splitting unicode ;
IN: hello

: clean-word ( x -- y ) [ letter? ] filter ;

: clean-words ( x -- y ) [ clean-word ] map ;

: main ( -- ) "document.txt" utf8 file-lines 
  [ >lower " " split clean-words . ] each ;

MAIN: main

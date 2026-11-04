USING: io io.encodings.utf8 io.files io.files.private kernel
  prettyprint containers sequences splitting unicode ;
IN: hello

: >word-list ( lines -- words )
  " " join
  >lower
  " " split
  [ [ letter? ] filter ] map ;

: read-words ( path -- words ) 
  utf8 file-lines
  >word-list ;

: spellcheck ( dict doc -- bads )
  [ over contains? not ] filter nip ;

: main ( -- )
  "/usr/share/dict/words" read-words
  "document.txt" read-words
  spellcheck
  [ print ] each
  ;

MAIN: main

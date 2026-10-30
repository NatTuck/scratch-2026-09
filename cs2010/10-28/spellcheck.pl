#!/usr/bin/perl
use 5.30.0;
use warnings FATAL => 'all';

my @EXTRA_WORDS = qw(stabby);

open my $wf, "<", "/usr/share/dict/words";

my %idx = ();

my $posn = 0;
my $letter = "";
for (<$wf>) {
  my $line = $_;

  y/A-Z/a-z/;
  /^(\w)/;
  my $first = $1;

  unless ($first eq $letter) {
    $letter = $first;
    #say "First letter: $first";
    $idx{$letter} = $posn;
  }

  $posn += length($line);
}

sub check_word {
  my ($ww) = @_;
  
  $ww =~ /^(\w)/;
  my $first = $1;
  
  my $valid = 0;
 
  seek($wf, $idx{$first}, 0); # Reset the file to the beginning.
  while(<$wf>) {
    chomp;
    if ($ww eq $_) {
      $valid = 1;
      last;
    }
  }

  for (@EXTRA_WORDS) {
    $valid = 1 if ($ww eq $_);
  }

  unless ($valid) {
    say "Unknown word: $ww";
  }
}

while (<>) {
  chomp;
  y/A-Z/a-z/;
  my @words = split /\W+/;

  map { check_word($_) } @words;

  #for my $ww (@words) {
  #  check_word($ww);
  #}
}


close $wf;

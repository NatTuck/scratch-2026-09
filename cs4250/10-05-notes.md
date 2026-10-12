
```C
loop() { // 1Hz
  digitalWrite(PIN0, 1);
  delay(500);
  digitalWrite(PIN0, 0);
  delay(500);
}

loop() {  // 3/2 Hz
  digitalWrite(PIN1, 1);
  delay(333);
  digitalWrite(PIN1, 0);
  delay(333);
}

// both, by building a state machine
int s0 = 0;
int s1 = 0;

loop() {

  if (toggle0) {
    s0 = !s0;
    digitalWrite(PIN0, s0);
  }

  if (toggle1) {
    s1 = !s1;
    digitalWrite(PIN1, s1);
  }

  delay(time_until_next_event);
}



```

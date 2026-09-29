
# What's on the Exam?

- The solar system
- How can dogs use powershell without fingers?
- Finite math
  - Evaluate the Ackerman function
- RISC-V Assembly, including different privilege modes
  - Calling conventions
  - Memory (what is physical memory?)
  - Given assembly, what happens?
  - Given instructions, what instructions to we need to
    do thing.
- Computer (sbc / embedded) boot sequence
- Ohm's Law
  - I'll give a formulation of Ohm's law and then
    ask a couple questions
- Maybe another electronics thing. I might give you the
capacitor formulas and ask you voltage at time.
  - Everyone's finished Calc 1, yay!
- Three vote for nap time.

Allowed materials:

- Paper notes
- Pencil
- Drink
- Non-internet calculator

## Example Quesitons

We have a GPIO with the following base addresses:

- IO base: 0x8300
- Direction base: 0x8400

We want to set pin 6 to output and then output 1. How?

  setup() {
    setPinMode(6, OUTPUT);
    digitalWrite(6, 1);
  }

But what if we don't have the arduino headers?

- b = Load the byte at 0x8400
- b = b | (1 << 6)   // assume out is 1
- Store b at byte at 0x8400
- b = Load the byte at 0x8300
- b = b | (1 << 6)   // assume high is 1
- Store b at byte at 0x8300

```
addi s0, zero, 0x8400
lb t0, 0(s0)
li t1, 1
sli t1, t1, 6
```

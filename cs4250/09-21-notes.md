
# Code that interacts with hardware?

- Last time, assembly for user-mode.
- In user mode, we're prevented from doing stuff because the operating system
assumes that we need to be protected from:
  - Malicious or incompetent users.
  - Software bugs (which is kind of the same thing).
  - Multiple program trying to share hardware at the same time.
- In M mode (where the OS kernel runs), we aren't constrained in the same way.
  - So we can directly access most devices.

## How do we access GPIO pin 7?

**From Linux**

- Three memory mapped hardware registers:
  - SWPORTA_DR - where we write the output data - 0x3021000
  - SWPORTA_DDR - direction (in or out) - 0x3021004
  - EXT_PORTA - where we read input data - 0x3021050

From Linux, three interfaces:

- libgpiod
- sysfs
- pinmux - (duo-pinmux)

**Code Executing without an OS**

- We can run whatever code on the RT core.
- It runs in M mode.
- Easiest way: Arduino sketch


## CPU execution loop

- Load the instruction at the instruction pointer (IP register)
- Decode it
- Do the thing
- Update the IP (probably increment)
- loop

## Registers

Risc-V 64 has 32 registers

Why less registers:

- Simpler code?
- Faster execution?

Why more registers:

- Simpler code?
- Faster execution?

In registers we store:

- Pointers
- Data (probably numbers)

**Our registers on Risc-V**

Hardware names: x0 .. x31

ABI names:

- zero: (x0), always zero
- ra: return address
- sp: stack pointer
- a0-a1: Function args and return values
- a2-a7: More arguments
- t0-t6: temporary
- s0-s11: saved / safe registers
- s0/fp: frame pointer
- global pointer, thread pointer: used for compilers
to make stuff like global variables work

Calling convention:

- On platforms like amd64 we'd need a whole list of
which registers are for what during function calls
(e.g. arg registers are %rdi, %rsi, etc)
- One important trick: stack pointer must be 16-byte
aligned on function call

```
function add_two(a, b) {
  return a + b
}
a is a0
b is a1
a0 = a0 + a1
```

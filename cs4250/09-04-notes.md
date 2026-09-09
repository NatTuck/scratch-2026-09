
- A computer program is a sequence of instructions in memory.
- A CPU has a register, the instruction pointer, that points
to the current instruction.

The CPU needs to:

- Load the current instruction
- Decode the instruction
  - Figure out what it wants to do
  - An instruction says: which instruction is this, which registers,
    any immediate values, which memory address, etc
- Fetch args
  - Registers? pretty fast
  - Memory? slow
- Do the thing
- Store results
  - Registers? pretty fast
  - Memory? slow
- Update the instruction pointer
  - Usually, to the next instruction
  - Branches, jumps, etc may do some other thing

Design questions:

- How big is an instruction?
  - On RISC-V 32, it's 32 bits (RV64 = 64 bits)
  - On AMD64, it's 1-15 bytes
  - On Intel's old Itanium arch, always 128 bits
  - On AMD's GPUs from 2022, either 32 or 64 bits
- Why?
  - Bigger instructions can do more.
    - We can have more register operands
      (e.g. add 3 registers, add two pairs in parallel, etc)
    - More bits give space for more instructions. E.g. old Intel
      had a string length instruction.
    -
  - Smaller instructions
    - Takes up less space
    - Faster, just because we need to load less data from slow RAM
  - Fixed length
    - The hardware to load is simple, it always requests a fixed number
      of bits from RAM
    - Hardware to evaluate is simple, all bits are immediately available
      for decode
  - Variable length
    - Can have some instructions that are smaller than a reasonable
      fixed-size scheme
    - Some instructions are *much* more common in code than others, so
      this can be like compression if you're clever about picking
      the encoding

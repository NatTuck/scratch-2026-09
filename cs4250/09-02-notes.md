
# Computer Architecture

## Electronics Review

- Volts - How angry the electrons are
- Amount of power - Watts
- How many electrons are going by - Amps
- `Watts = Volts * Amps`
- Watts is power = Heat

Luckily for us, our goal is pretty simple:

- We've got electronic components.
- We want them to work.
- They've got a volts number printed on them.
- Not enough volts -> Doesn't work
- Too many volts -> Blow up, get on fire, melt,
let out the magic smoke. Then doesn't work.

## Resistors

Resistors are characterized by a number: Resistance, in Ohms

Resistors do three things:

- Voltage drop (V = IR)
- Prevent things from blowing up, buy limiting current (amps), (I = V/R)
- Generate heat (W = V(V/R) = (V^2)/R

This is all calculable with one formula: V=IR, Ohm's Law

## Capacitors

- Do all kinds of crazy neat stuff if you have AC.
- One way if DC
- They store power (specifically, they store electric charge)
- They can be used to smooth out signals that aren't smooth but
should be

## Inductors?

- Who knows.
- I don't think they do anything without AC, and I'm going to
avoid AC.

## Diodes

- From the name, I predict there are two wires going into this thing.
- Headline function: One-way current only.
- Gives a voltage drop, but not like a resistor.

How diodes work is neat and relevant.

- For a material to conduct electricity, it needs to let electrons move
through it.
- That happens between atoms in a crystal-type lattice structure.
- Atoms have electron shells.
  - Electrons live in rings around atoms.
  - Chemical bonds involve the outer ring - typically an extra electron
    in one atom being shared with a missing electron on a neighbor.
  - For electrons to move, we need to have both an electron that can move (outer
    shell can't be empty) and a space for it to go (outer-ish shell can't be full).
- Conductive materials (e.g. many metals) are right in the middle of the periodic
table and have plenty of mobile electrons and empty spots.
- Insulators have full outer electron shells, when considering the chemical
bonds.
- Semi-conductors

## Transistor

- Diode went PN
- Transistor is PNP or NPN

## Nand Gate

- Two transistors

## Up from nand gates

- (A NAND B) can be built as (A NAND B)
- Not gate? (A NAND A) = NOT A
- And gate? NOT (A NAND B)
- Or gate? ((NOT A) NAND (NOT B))

## With those, you know how to

- Build an ALU
- Build a register file
  - It's just a RAM
  - On real CPUs, typically SRAM
  - That's an array of flip-flops, ends up
    being about 6 transistors per bit
  - For 32 32-bit registers:
    - 5 inputs to select a register
    - 1 input to select read or write
    - 5 input/output lines for data
    - clock line
  - We know we want two registers a lot of
    the time. Can you build a SRAM that reads
    two registers in one clock?

## Now we need an ISA

- Risc-V

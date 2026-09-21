.global main
.section .text

/* Options for where to put stuff:
 * - In the register we found it in.
 * - In a temp register.
 * - In a saved register (if it needs to survive a fn call)
 * - On the stack (if we're out of saved registers)
 * - In a memory address (if it's a global or we're doing something
 *   wacky)
 */

/* fact(x):
 *   if x <= 1:
 *      return 1
 *   return x * fact(x-1)
 *
 * Variable (and temp) mappings:
 *  - x is t4
 *  - result goes in a0
 *  - x-1 goes in a0
 */

// Only call this on positive integers.
// If you call on 0, you'll get 0, and we told you.
fact:
    addi sp, sp, -16
    sd ra, 8(sp)
   
    # Move x to where it lives
    mv t4, a0

    li t0, 1
    ble a0, t0, fact_done
else_branch:

    addi a0, a0, -1
    sd t4, 0(sp)
    call fact
    ld t4, 0(sp)

    mul a0, a0, t4

fact_done:
    ld ra, 8(sp)
    addi sp, sp, 16
    ret



main:
    # Prologue (set up the stack frame)
    # no local vars on the stack
    # Still need to save return address
    addi sp, sp, -16
    sd ra, 8(sp)

    # Body
    li a0, 5

    call fact   // pseudoinstruction
                // we really have "jalr"
                // jalr reg, immediate
                //
                // two variants:
                // if distance to fact < max immediate value
                // jalr sa, (ip - fact)
                //
                // if too far away, two instructions
    
    mv a1, a0
    la a0, long_fmt

    call printf

    #return 0
    mv a0, zero

    # Epilogue (clean up the stack frame)
    ld ra, 8(sp)
    addi sp, sp, 16
    ret

.section .data

long_fmt: .string "fact(y) = %ld\n"



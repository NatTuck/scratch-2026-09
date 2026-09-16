.global main
.section .text

# long
# add2(long x)
# {
#    return x + 2;
# }

add2:
    addi a0, a0, 2
    ret

#int
#main(int argc, char* argv[])
#{
#    long y = 5;
#    long z = add2(y);
#
#    printf("y + 2 = %ld\n", z);
#
#    return 0;
#}

main:
    # Prologue (set up the stack frame)
    # no local vars on the stack
    # Still need to save return address
    addi sp, sp, -16
    sd ra, 8(sp)

    # Body
    li a0, 5

    call add2
    
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

long_fmt: .string "y + 2 = %ld\n"



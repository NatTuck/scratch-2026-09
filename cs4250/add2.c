
#include <stdio.h>

long
add2(long x)
{
    return x + 2;
}

int
main(int argc, char* argv[])
{
    long y = 5;
    long z = add2(y);

    printf("y + 2 = %ld\n", z);

    return 0;
}

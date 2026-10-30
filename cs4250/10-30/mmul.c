

typedef struct {
    long size;
    float* data; // data[ii, jj] = data[ii * size + jj]
} matrix;

matrix*
mmul(matrix* aa, matrix* bb)
{
    long nn = aa->size;
    matrix* cc = alloc_matrix(nn);

    for (long ii = 0; ii < nn; ++ii) {
        for (long jj = 0; jj < nn; ++jj) {
            cc->data[ii * nn + jj] = 0.0f;
            for (long kk = 0; kk < nn; ++kk) {
                cc->data[ii * nn + jj] += aa->data[ii * nn + kk] * bb->data[kk * nn + jj];
            }
        }
    }

    return cc;
}

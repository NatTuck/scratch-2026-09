#define _GNU_SOURCE
#include <pthread.h>
#include <sched.h>
#include <stdatomic.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#define CACHELINE   64
#define LINE_U64    (CACHELINE / sizeof(uint64_t))   /* 8 words */
#define RING_LINES  (64 * 1024)                      /* 64K lines = 4 MB */
#define BUF_SIZE    (RING_LINES * CACHELINE)
#define TEST_NS     100000000L                       /* 0.1 s */
#define WARMUP_NS   20000000L                        /* 20 ms */

static uint64_t *buffer;
static _Atomic uint64_t write_seq;
static _Atomic uint64_t read_seq;
static _Atomic int running;

static inline void cpu_pause(void) {
#if defined(__x86_64__) || defined(__i386__)
    __asm__ volatile("pause");
#endif
}

static void pin(int cpu) {
    cpu_set_t set;
    CPU_ZERO(&set);
    CPU_SET(cpu, &set);
    if (pthread_setaffinity_np(pthread_self(), sizeof(set), &set) != 0)
        perror("pthread_setaffinity_np");
}

/* Writer: core 0. Writes one cache line at a time into a ring,
 * stalling if it gets RING_LINES ahead of the reader. */
static void *writer(void *arg) {
    pin(*(int *)arg);
    uint64_t pos = 0;
    while (atomic_load_explicit(&running, memory_order_relaxed)) {
        uint64_t w = atomic_load_explicit(&write_seq, memory_order_relaxed);
        uint64_t r = atomic_load_explicit(&read_seq, memory_order_acquire);
        if (w - r >= RING_LINES) { cpu_pause(); continue; }

        volatile uint64_t *line = buffer + (pos % RING_LINES) * LINE_U64;
        for (int i = 0; i < LINE_U64; i++) line[i] = pos;
        atomic_store_explicit(&write_seq, pos + 1, memory_order_release);
        pos++;
    }
    return NULL;
}

/* Reader: core N. Reads a cache line only after the writer has
 * published it. */
static void *reader(void *arg) {
    pin(*(int *)arg);
    uint64_t pos = 0;
    uint64_t sink = 0;
    while (atomic_load_explicit(&running, memory_order_relaxed)) {
        uint64_t w = atomic_load_explicit(&write_seq, memory_order_acquire);
        if (w > pos) {
            volatile uint64_t *line = buffer + (pos % RING_LINES) * LINE_U64;
            for (int i = 0; i < LINE_U64; i++) sink += line[i];
            atomic_store_explicit(&read_seq, pos + 1, memory_order_release);
            pos++;
        } else {
            cpu_pause();
        }
    }
    __asm__ volatile("" : : "r"(sink) : "memory");  /* keep sink alive */
    return NULL;
}

int main(void) {
    int ncpu = (int)sysconf(_SC_NPROCESSORS_ONLN);
    if (ncpu < 2) { fprintf(stderr, "Need >= 2 CPUs, have %d\n", ncpu); return 1; }

    buffer = aligned_alloc(CACHELINE, BUF_SIZE);
    if (!buffer) { perror("aligned_alloc"); return 1; }
    memset(buffer, 0, BUF_SIZE);

    printf("CPUs: %d   ring: %d KiB (%d lines)   test: %.3f s\n\n",
           ncpu, (int)(BUF_SIZE / 1024), RING_LINES, TEST_NS / 1e9);
    printf("  core0 -> coreN   :        words   :     GB/s\n");
    printf("  -------------------------------------------------\n");

    for (int c = 1; c < ncpu; c++) {
        atomic_store(&write_seq, 0);
        atomic_store(&read_seq, 0);
        atomic_store(&running, 1);

        int cpu_w = 0, cpu_r = c;
        pthread_t wt, rt;
        if (pthread_create(&wt, NULL, writer, &cpu_w) != 0 ||
            pthread_create(&rt, NULL, reader, &cpu_r) != 0) {
            perror("pthread_create");
            atomic_store(&running, 0);
            return 1;
        }

        struct timespec ts = { .tv_sec = 0, .tv_nsec = WARMUP_NS };
        nanosleep(&ts, NULL);                      /* warm-up, not counted */

        uint64_t r0 = atomic_load(&read_seq);
        struct timespec t0, t1;
        clock_gettime(CLOCK_MONOTONIC, &t0);

        ts.tv_nsec = TEST_NS;
        nanosleep(&ts, NULL);

        clock_gettime(CLOCK_MONOTONIC, &t1);
        uint64_t r1 = atomic_load(&read_seq);

        atomic_store(&running, 0);
        pthread_join(wt, NULL);
        pthread_join(rt, NULL);

        double secs = (t1.tv_sec - t0.tv_sec) + (t1.tv_nsec - t0.tv_nsec) * 1e-9;
        uint64_t words = (r1 - r0) * LINE_U64;
        double gbs = (double)words * sizeof(uint64_t) / secs / 1e9;

        printf("  core 0 -> core %2d : %12lu   : %6.2f\n",
               c, (unsigned long)words, gbs);
    }

    free(buffer);
    return 0;
}

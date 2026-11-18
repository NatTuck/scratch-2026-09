
# Next Two Weeks

Nov 16: Project Work Day
Nov 18: Lecture
Nov 20: Exam 2

Thanksgiving week:

Nov 23: Project Work Day

## What's on this Exam

- Realtime OS scheduling
- Pipeline
- Caches
- Multiprocessors & GPUs

We should:

- Fix code

## OS Scheduling

The thing we're working with is tasks, which are statically executed threads.

Each task has a priority, higher numbers go first.

The scheduler is a function which runs the highest priority ready task.

A task can be: ready or blocked

**Example**

Tasks:

- Idle task, priority 0, `while (1) { wait_for_interrupt(); yield(); }`
- Worker task, prio 1, `while (1) { compute_game_update(); update_state();
yield(); }`
- Network driver, prio 2 `while (1) { get_network_event(); update_state();
yeild();`
- UI task, prio 3, `while (1) { get_touch_event_or_state_change(); update_ui();
update_state(); yield();`

Interrupts:

- Can happen at any time.
- Run interrupt handler functions.
- Might unblock stuff.
- We call yield() at the end of every interrupt handler to trigger a reschedule.
- We have a timer interrupt that runs periodically, mostly to switch between
same priority tasks.

Critical sections:

- Because we have logical concurrency from interrupts, we need to worry about
data races.
- We solve that by marking atomic operations as critical sections.
- We execute them atomically:
  - With multiple cores, that's a mutex or a spin lock or something.
  - With one core, we can just mask interrupts.
- Critical sections need to be fast:
  - Everything else gets paused, we don't want to be laggy
- Why are all interrupt handlers critical sections?
  - The whole point of an interrupt handler is to update a shared data structure
  - Trying to nest interrupts is crazytimes (although it does sometimes happen)
- When an interrupt triggers and interrupts are masked, what must happen
immediately after interrupts are unmasked?
  - We run the interrupt handler for the missed interrupt (usually).
- Why must interrupt handlers / drivers check for more than one event and handle
all of them when only one interrupt handler call occurs?
  - Two events could have occurred while interrupts were masked.
  - Interrupts are flags, not counters.

## Caches

...

## Pipelines

Why can stalls happen? How do we fix it?

## Multiprocessors and GPUs

# Licensing and Deps pt2

## Proprietary Licenses

Two different scenarios:

- Software that you use.
- Dependencies for the program you're building.

**Zero-Price Proprietary Licenses**

These fall into two categories:

- Abandoned historical artifacts.
- Traps

Specific things to watch for:

- Figure out what the conditions are on how the software can be used. Ask if
you'll ever hit the limits.
- Are there any conditions under which you need to pay for the license? If
so probably treat this as a paid license.
- If source code is not included you may not be able to fix bugs or even figure
out what the code does.
- If full source code isn't included, you may not be able to run the software on
different hardware in the future.
- If there are restrictions on use, you can't do those things.
- If the software is provided by Oracle, they will send you a bill for $30,000
per CPU core times the number of users you have and send their lawyers after
you if you don't pay up.

**Payware Proprietary Software**

This software requires purchasing a license to use.

They want different people to buy different licenses, so there will be some
licensing scheme where that's enforced. It's really important to figure out
what the model is and how it matches your business model.

Adding deps like this is a business tradeoff, but it's an extremely expensive
one: once you do it, you no longer own your program.

**Proprietary Platforms**

When we build software, we pick both dependencies and typically one platform.

Grange runs on a browser and a Linux server. Those are both commodity platforms.

If you had written Grange to be tightly bound to Amazon AWS or Unreal Engine,
you'd be stuck there. Proprietary platforms exist to be sticky.

## Conclusions

Licensing recommendation:

- Permissive open source is safe to use license-wise.
- Copyleft open source needs a policy decision.
- Proprietary dependences are a bad idea unless you can't avoid them.

## Non-software licenses

There are open content licenses that provide open-source like reusability
for non-software assets:

- Stuff like the Open Font License
- In general, look for Creative Commons Licenses, but be careful - some of
them have tags like "Non Commercial".

## Preview of Friday

npm library called left-pad

This library included one function, leftPad, which took a string and
a length and padded the string to the length by adding spaces on the left.

leftPad("Bob", 10) -> "Bob       "

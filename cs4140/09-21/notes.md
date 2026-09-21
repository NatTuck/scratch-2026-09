
# Using A Database

We talked about four kinds of application state:

- Browser, Transient (e.g. React useState, browser JS vars)
- Browser, Persistent (e.g. localStorage)
- Server, Transient (e.g. server vars)
- Server, Persistent (e.g. database or files)

For the farm game, some persistent server state:

- user accounts
- goods to sell or something

## Today's game: Clickboard

- Users create accounts
- When you're logged in, there's a "click me" button.
- Clicking the button gets you one point.
- There's a realtime leaderboard

## Software Stack

- Botbash has the most boring software stack:
  - JS in the browser.
  - Can have JS on the server, so why not? Express.js
  - Second most boring thing, we're using TypeScript
- We can run any software stack on the server.
- Let's use something fun instead: Elixir / Phoenix
  - Gives a good database interface
  - Gives database migrations
  - We'll be seeing some other benefits later

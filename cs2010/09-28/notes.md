
# Large Language Models

## Way too much history of computing

- Most major computing concepts were around by 1970.
- By 1990, we had massively parallel supercomputers with graphic
user interfaces that could do realtime 3D rendering.

Artificial intelligence

- It seems like every piece of science fiction involving computers in the 20th
century had a talking computer or robot.
- MIT opened their AI lab in 1959
- The first neural network type machine learning algorithm was
described in 1958

As of 1995, there were a bunch of unsolved problems that made sci-fi
robots seem unlikely:

- Computers couldn't beat humans at chess.
  - Computer first beat champion human in 1997, human last beat champion computer 2005
  - Mechanism: Brute computational force
- You couldn't write a computer program that could tell the difference
between a picture of a cat and a picture of a dog.
  - This problem *requires* machine learning.
  - The pattern here: You get a bunch of cat pictures and a bunch of dog
  pictures, and you train a model to distinguish.
  - Solved with Machine Learning by 2013 (over 99% accuracy)
- A computer program couldn't immitate a human in text conversation well
enough to trick another human: the Turing Test.
  - In 2017, Google reearchers released a paper describing the modern
  Generative Pre-trained Transformer, or GPT.
  - March 2025, OpenAI showed that their GPT 4.5 model tricked a human
  in a turing test text chat into thinking it was the human and the actual human
  wasn't like 73% of the time.

## What is a model?

- Something that looks / acts like the real thing.
- A mathematical model is a mathematical description of somehting that lets
you make predictions.

Model example:

Every night, Alice goes to the bar and buys everyone a beer.

On Monday, there are 5 people at the bar and Alice's tab is 25 dollars.
On Tuesday, 8 people, tab is 40 dolllars.
On Wednesday, 3 people, we predict 15 dollars.

Your model: A beer costs 5 dollars.

This is a model:

- Type of model: Linear relationship
- One model parameter: Price of a beer.
  - We need this to define the model.
- One input parameter: Number of people.
  - We need this to use the model.

What if she buys everyone under 40 a beer and everyone over 40 a
glass of whiskey.

Model Parameters:

- Price of beer
- Price of whiskey

Input parameters:

- People under 40
- People over 40

Alice goes to a different bar on Monday, 3 young people, 4 old people,
her bar tab is 58 dollars
Alice goes to the bar on Tuesday, 2 young people, 7 old people,
tab is 82 dollars

Model that we need here:

- Multiple linear equations
  - `beer_price = beer * X`
  - `whiskey_price = whisky * Y`
  - `tab = beer_price + whiskey price`

To successfully distinguish cats and dogs, you need thousands to millions
of model parameters. That means you need thousands to millions of cat / dog
pictures as sample inputs.

## Large Language Models

Generative Pre-Trained Transformers

- Given a bunch of words in a coherent natural language sequence, which
word comes next?
- Deep neural network, the parameters are neuron weights.
- Recognizably works at 100 million weights (paremters)
  - A weight is naturally a 16-bit floating point numbers
- Pretty useful at ~10 billion
- Scales to at least a couple trillion

## Operation

An LLM consists of:

- A token dictionary
- Weights
- Model archetecture (shape)

Dictinary translates text -> numbers. A token is a word or symbol.

Then we do a bunch of matrix math to simulate neurons operating on
that series of numbers.

This produces a sequence of predicted tokens, ranked. We take the top one,
or maybe randomly one of the top few.

## Training

Start with an archetecture (how many neurons, how many layers, etc).

Start with random weights.

Have a bunch of training data (text).

Feed in the first word, pass through the network forward, get a (wrong)
prediciton. Figure out if it was wrong high or wrong low, and then for each
weight in the network backwards, adjust slightly in the right direction.

Feed through like 100 - 1000 tokens per weight, get a trained neural network
that makes good predictions.

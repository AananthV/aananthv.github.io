---
layout: post
title: "How LLMs Work - Part 1: Attention"
date: 2026-06-06
categories: machine learning
---

## Writing an LLM from "scratch"

Recently, I found myself becoming a "script kiddie" by following HuggingFace tutorials to try and post-train models. With the advent of coding agents, it has unfortunately become easier than ever to implement something without understanding what is happening under the hood. I am writing these (manually typed) notes to further my understanding.

### A quick digression on the Occam's Razor

While we may not be able to perfectly model the behavior and state of a [chaotic](https://en.wikipedia.org/wiki/Chaos_theory) system, we should be able to define the set of constraints that govern the system. And, almost all of the chaos in the universe is governed by a set of simple, symetrical laws.

I firmly believe (albeit without proof) that the same must apply to the building blocks of life, consciousness, and intelligence (biological or otherwise). As an extension to the [Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html), I would bet that the algorithm that would eventually create general intelligence must be simple, easy to understand and easy to implement. Throughout these notes, I will only be discussing the algorithms that follow these principles.

### The Elegance of Neural Attention

#### Fundamentals

Quoting [Wikipedia](https://en.wikipedia.org/wiki/Attention): 

> Attention is the concentration of awareness directed at some task or phenomenon while mostly excluding others.

Given a collection of input signals, how can a neural network learn to direct its focus on the relevant signals?

Consider that we represent signals in an abstract vector space with $N$ dimensions:

$$S_1 = (x_1, x_2, \dots, x_N)$$

$$S_2 = (y_1, y_2, \dots, y_N)$$

To figure out how related these signals are, we can compute their similarity. 

While we could use cosine similarity (calculated as $\frac{S_1 \cdot S_2}{\|S_1\| \|S_2\|}$) neural networks typically use the raw **dot product** for efficiency. Geometrically, the dot product measures how much two vectors align or point in the same direction, essentially capturing the overlapping "footprint" of one signal projected onto another.

$$\text{Similarity} = S_1 \cdot S_2$$

Given a set of signals $S_1, S_2, \dots, S_M$, we can efficiently compute the pairwise attention scores between all the signals using matrix multiplication.

If we stack the $M$ signals into an $M \times N$ matrix called $S$, we can compute:

$$D = S S^T$$

Let's build an intuition of what this matrix $D$ signifies. $D$ is an $M \times M$ matrix, and each element $D_{ij}$ represents how similar $S_i$ and $S_j$ are. Ultimately, it tells us how much "attention" signal $S_i$ must pay to signal $S_j$.

Next, we normalize these attention scores by performing a softmax operation so that the sum of the attention scores for any particular vector is exactly 1.

$$A = \text{softmax}\left(\frac{S S^T}{\sqrt{N}}\right)$$

Notice that we scale the $D$ matrix by dividing it by $\sqrt{N}$ (the square root of the dimensions). We do this because large dot products can push the softmax function into unstable regions with extremely low gradients, which stalls the learning process.

We can then pull in the contributions of each signal $S_j$ into $S_i$ by computing a new composite signal, $O_i$, which is a weighted sum of all signals based on their attention scores:

$$O_i = \sum_{j} A_{ij} S_j$$

Using matrix multiplication once again to calculate this for all signals simultaneously, we arrive at our final output matrix:

$$O = \text{softmax}\left(\frac{S S^T}{\sqrt{N}}\right) S$$

If the $S$ matrix represents signals in isolation, and the $A$ matrix represents the instructions on who should listen to whom, the $O$ matrix represents the fully contextualized signals. Each row of O represents a contextualized version of the corresponding row in S.

Elegant, isn't it?

#### Queries and Keys

Until now, a signal was comparing itself directly to other raw signals using $S S^T$. There is a teeny tiny issue with this approach: It assumes that "what a word is" is exactly the same as "what a word is looking for." 

If we compared raw signal values, we would always end up with the highest Dot Product for the same signal. Take the following phrase: 

> The heavy box fell on the fragile table, and **it** crushed **it**

If we compared the raw signal values of the second "**it**", it would show highest similarity to the first "**it**". However, we want each "**it**" to *attend* to a corresponding noun ("box", "table").

To make the network truly powerful, we want it to actively *learn* how to direct its attention. We do this by projecting our raw signals into a query dimentsion using learnable weight matrices: $W_Q$ and $W_K$.

When we multiply our input matrix $S$ by these weights, we generate new matrices:

$$Q = S W_Q$$

$$K = S W_K$$

These stand for **Queries** and **Keys**. The easiest way to build intuition for this is through a retrieval system:

* **The Query ($Q$):** This is what a signal is *looking for*.
* **The Key ($K$):** This is what the signal *represents*.

If we do this for our original sentence, the Query for the "**it**" might map it to a latent vector corresponding to *noun*. At the same time, Key vector will also map the nouns in the sentence to the same region. This makes the Attention mechanism serve more like a latent retreival than a raw similarity comparison.

Rewriting some of our equations from before:

$$\text{Attention Scores} = Q K^T$$

$$O = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) S$$

*(Note: We scale by $\sqrt{d_k}$, which represents the dimension of the Key vectors, ensuring our softmax gradients remain stable).*

Another advantage of the projection is that they allow us to compute the Attention Score in a latent space with a different (lower) cardinality than the original Signals. This can make our computation faster!

#### Values

Currently, we calculated the Output matrix by multiplying the Attention Scores with the raw signals. While this would work in theory, we can do better. Consider the following sentence:

> She matched her new **paint** to the sweet **apple** she was eating.

Assuming the attention scores between "**paint**" and "**apple**" are high, what would we want "**apple**" to contribute to "**paint**"? If our Key vector mapped "**apple**" to "**color**", we would want that *aspect* of "**apple**" to contribute to the Output for "**paint**". That is we would want a corresponding mapping from "**apple**" to "**red**".

We achieve this corresponding mapping using another set of trainable weights $W_V$ and compute the *Value* Matrix ($V$) as 

$$V = S W_V$$

Substituting $Q$, $K$, and $V$ into our previous formula, we arrive at:

$$O = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$

*(Note: $V$ needs to be the same dimensions as $S$ to satisfy the equation above, but this is not always a requirement).*

By separating the inputs into Queries, Keys, and Values, the network is no longer just calculating blind similarity. It has learnable parameters that allow it to actively ask questions, advertise its own contents, and selectively share information across the sequence.

This exact mechanism, formally known as **Scaled Dot-Product Attention**, was introduced in the now ubiquitous "Attention Is All You Need" paper. By allowing networks to efficiently weigh the importance of different inputs, this mathematical operation became the foundation of the modern Transformer architecture.

#### Multi Head Attention

Consider the same sentence as before

> She matched her new **paint** to the sweet **apple** she was **eating**.

The **Scaled Dot-Product Attention** we described is perfectly capable of computing the Contextualized Output for the word "**paint**" by computing a vector corresponding to the color "**red**". 

But a single word can convey more information! In the same sentence, what if we want to compute the output score for the word "**eating**"? In this case, we can imagine that the Key for "**apple**" must correspond to something like "**food**" and the corresponding value must represent the "**apple**" itself.

We achieve this by having different sets of trainable weights $W_Q^i$, $W_K^i$, $W_V^i$ that "specialize" in extracting a different *aspect* of the input signal.

Subsituting into the earlier equations,

$$Q_i = S W_Q^i$$

$$K_i = S W_K^i$$

$$V_i = S W_V^i$$

$$\text{Attention Scores}(i) = Q_i K_i^T$$

$$\text{head}_i = \text{softmax}\left(\frac{Q_i K_i^T}{\sqrt{d_k}}\right) V_i$$

$\text{head}_i$ is the output of a single ***Attention Head***. 

Once all the heads have done their specialized extractions, their outputs are concatenated (glued together) and passed through one final weight matrix ($W_O$) to blend the insights of the entire committee back together into a single, incredibly rich contextual signal.

$$O = \text{Concat}(\text{head}_1, \text{head}_2, ..., \text{head}_H)W_O$$

Usually, to keep the amount of compute roughly constant, we make the dimension of each head:

$$d_{head} = N / H$$

*(Note: Recall that $V_i$ need not be the same dimension as $S$)*

By using multiple heads, the network doesn't have to compromise. It can look at the word "apple" from 96 different perspectives simultaneously, extracting every nuance needed to understand the full picture.
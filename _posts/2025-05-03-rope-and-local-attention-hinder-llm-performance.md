---
layout: post
title: "RoPE and Local Attention hinder LLM performance"
date: 2025-05-03
categories: machine learning
---

### The probability of answering a list of questions

The `gemma-2-2b-it` model achieves a 56% score (5-shot)[^gemma2] on the MMLU. **What would we expect to happen if we asked it a batch of N questions at a time?** In the ideal case, each of the questions would be answered correctly 56% of the time and this probability would simply be a independent variable that depends on the "intelligence" of the model.

However, this is not what we see!

![correct answers in batch of 50]({{ site.baseurl }}/images/rope/50.webp)

When given a list of questions, the model gets the last question correct **twice as often as the first question**. The first few questions are pretty much guessed correctly with a random chance (25%).

Note: I ran these experiments using `gemma-2-2b-it` due to hardware limitations. Please try to run them on bigger models if you have the resources - I would love to see the results :)

<details markdown="1">

<summary markdown="span"> Example Prompt </summary>

<blockquote>
Read the following multiple choice questions and answer them one by one. Your answer for each question should be in following format: <question_number>. <the index of the correct option (1, 2, 3, or 4)>

1.	Question: A family therapist using the structural approach of Salvador Minuchin would most likely:  
	Choices:  
		1. clarify boundaries between family members in order to reduce enmeshment.  
		2. work initially with the most differentiated family member.  
		3. "use a multiple-therapist team to prevent any one therapist from becoming ""triangulated"" into the family system."  
		4. "issue specific ""directives"" designed to counteract dysfunctional processes."  

2.	Question: Which of these countries was not a member of the Axis alliance during World War II?  
	Choices:  
		1. Germany  
		2. Italy  
		3. Spain  
		4. Japan  

(..the other questions, in a similar format)

Here are the answers to the multiple-choice questions, one index per line:
</blockquote>

</details>

<details markdown="1">

<summary markdown="span">Pseudocode</summary>

The evaluation loop is fairly straightforward:

```py
N_q = 50      # number of questions in a batch
N_iters = 100 # number of iterations

scores = [0 for i in 1..N_iters]
for i in 1..N_iters:
    # batch is an array of size N_q containing (Q, A) tuples
    batch = get_random_batch()

    # concatenate questions and add instructions for the model
    prompt = format_prompt(batch)

    # generate output from the LLM
    out = generate(prompt)

    # returns a boolean array
    is_correct = check_answers(batch, out)
    
    # scores[i] += 1 if is_correct[i]
    update_scores(scores, is_correct)
```
</details>

### Why might this be happening?

I believe that there are two _optimizations_ here that are bottlenecking LLM performance.

#### 1. Local Attention

Standard self-attention is powerful, letting every token "attend" to every other token in the context. However, this global view becomes computationally expensive (O(n^2)) as context length grows. Enter Local Attention[^longformer]. It's an efficiency optimization technique. Instead of looking everywhere, each token only attends to a fixed-size window of its neighboring tokens. For decoder-only transformers like current LLMs, each token attends to a fixed-size window of preceeding tokens. This drastically reduces the computational cost (O(n)) and memory required, especially for long documents.

![sliding window attention]({{ site.baseurl }}/images/rope/sliding-window-1.webp)

Gemma2 alternates between a 4096-token sliding window local attention layer and a global attention layer (8192 tokens, since that is the full context window). This interleaving allows the model to attend to the global state while being slightly computationally efficient.

This means that Gemma2 should be able to answer all the questions within the 4096-token window with the same accuracy. This seems to hold for the most part - when batches of <20 questions are supplied, Gemma2 answers each question correctly with roughly the same probability.

![correct answers in batches of 10 to 50]({{ site.baseurl }}/images/rope/10-50-2.webp)

However, I would imagine the graph to look more like a [step-function](https://en.wikipedia.org/wiki/Heaviside_step_function) where questions within the 4096 context window are answered with probability P and the others are answered with a lower probability P'. This doesn't seem to be happening - something else is causing the ~linear decrease in probability with distance within the 4096 sliding window.

#### 2. RoPE: Rotary Positional Embedding

The attention mechanism is order-invariant, so it can't distinguish _"boy eats sandwich"_ from _"sandwich eats boy"_ without positional information. This is generally performed by adding a _positional embedding_ to the embedded tokens. Rotary Positional Embedding (RoPE)[^rope] is used in pretty much all the SOTA open-source models including Gemma3, Llama4, and Qwen3. It is also used in Gemma2 - the model we're testing. I found this [youtube video by Efficient NLP](https://youtu.be/o29P0Kpobz0?si=V0s7GqXxPk6nhrUB) a great explanation of the different positional embeddings used in transformer architectures, including RoPE. RoPE also has advantages like context-window expansion, which makes it attractive for LLMs.

RoPE is applies a rotation to the Query (Q) and Key (K) vectors within the self-attention mechanism. The angle of rotation is determined by the token's absolute position. The crucial insight is that when these rotated Q and K vectors interact via the dot product during attention calculation, the result naturally depends only on their relative distance.

However, since the attention between two tokens in a sequence is scaled by their dot product, RoPE causes a decay in attention between distant tokens. This is explained in the original paper that introduces RoPE as well.

For a simpler derivation, consider that tokens are represented in a 2d embedding space. To apply positional embedding, the token embeddings are rotated by some angle $$\theta = i\delta$$ where $$i$$ denotes the positon of the token in the sequence. It is clear that the dot-product between two _similar_ embeddings spaced N tokens apart will scale by approximately $$\cos(N\delta)$$.

![sliding window attention with RoPE]({{ site.baseurl }}/images/rope/sliding-window-with-rope.webp)

This $$\cos(N\delta)$$ decrease might explain the decrease within the 4096 sliding window.

### What does this mean for LLM performance?

A core assumption behind both of these optimizations is that **most relevant context for predicting a token lies nearby**. I imagine this is true for learning linguistic representations while pre-training LLMs to do next-token prediction, but does it still apply for the **agentic tasks** that we want these models to perform? I don't think so. Agentic tasks generally do not differentiate between different parts of the context.

More recent architectures like Gemma3[^gemma3] have both decreased the sliding token window to 1024 and decreased the frequency of the global attention layers to 1 in 5. While the Gemma3 paper reports no loss in perplexity due to this, I suspect the model will perform worse on this test. I wasn't able to test on `gemma3-1b-it` because it wasn't able to format the answers correctly according to the prompt (even when supplying just 1-2 questions) and the 4b+ models were too big to run.

While the open source world has not found any new alternatives to this issue, large labs might have. The Gemini models especially seem to support a 2M context window while simultaneously performing well on the [needle in the haystack test](https://cloud.google.com/blog/products/ai-machine-learning/the-needle-in-the-haystack-test-and-how-gemini-pro-solves-it). Regardless, this is certainly an important bottleneck that needs to be solved on the path to AGI.

----

[^gemma2]: Gemma 2: Improving Open Language Models at a Practical Size. [arXiv:2408.00118](https://arxiv.org/abs/2408.00118)
[^gemma3]: Gemma 3 Technical Report. [arXiv:2503.19786](https://arxiv.org/abs/2503.19786)
[^longformer]: Longformer: The Long-Document Transformer. [arXiv:2004.05150](https://arxiv.org/pdf/2004.05150)
[^rope]: RoFormer: Enhanced Transformer with Rotary Position Embedding. [arXiv:2104.09864](https://arxiv.org/abs/2104.09864)
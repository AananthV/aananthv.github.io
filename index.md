---
layout: default
title: Home
---

<section class="intro" aria-labelledby="intro-title">
  <img class="portrait" src="{{ '/images/aananth.jpg' | relative_url }}" alt="Aananth V standing in front of the Golden Gate Bridge" width="176" height="220">
  <div class="intro__copy">
    <h1 id="intro-title">Aananth V</h1>
    <p class="intro__tagline">Software engineer interested in systems, networking, and machine learning.</p>
    <p class="intro__body">
      I’m currently pursuing a master’s in computer science at UT Austin. Before that, I spent four years at Google working on production RPCs, Cloud TPU networking, and the Linux networking stack.
    </p>
    <p class="intro__links">
      <a href="https://github.com/aananthv">GitHub</a>
      <a href="https://www.linkedin.com/in/aananthv/">LinkedIn</a>
      <a href="https://x.com/aananth_">X / Twitter</a>
      <a href="{{ '/assets/Aananth_V_Resume.pdf' | relative_url }}">Résumé</a>
    </p>
  </div>
</section>

<section class="details" id="experience" aria-labelledby="experience-title">
  <h2 id="experience-title">Experience</h2>
  <div class="detail-list">
    <article class="detail-item">
      <div class="detail-item__heading">
        <h3>Google</h3>
        <p>Senior Software Engineer</p>
      </div>
      <time>2022–2026</time>
      <p class="detail-item__body">
        I worked on the Prod RPCs team, developing the foundational Stubby and gRPC stacks that carry more than 95% of Google’s exabyte-scale network traffic.
      </p>
      <div class="google-work" aria-label="Selected work at Google">
        <p><strong>Cloud TPU networking.</strong> Improved training and inference goodput by approximately 50–100% through changes spanning XLA collectives, a new gRPC transport, and the Linux networking stack.</p>
        <p><strong>TCP visibility.</strong> Tech led Fathom, a TCP observability effort for high-performance workloads; upstreamed Linux kernel telemetry and helped identify and fix a TCP Fast Open bug in mainline.</p>
        <p><strong>Open-source gRPC.</strong> Contributed vulnerability fixes, performance optimizations, and telemetry improvements to the <a href="https://github.com/grpc/grpc">gRPC repository</a>.</p>
        <p><strong>Reliability and modernization.</strong> Led a two-year removal of a legacy streaming protocol and rebuilt RPC benchmarking, reducing test flakiness from roughly 10% to under 2%.</p>
      </div>
    </article>
    <article class="detail-item">
      <div class="detail-item__heading">
        <h3>Samsung R&amp;D Institute</h3>
        <p>Research and software engineering intern</p>
      </div>
      <time>2020–2022</time>
      <p class="detail-item__body">
        Developed a knowledge-graph recommendation system using graph convolutional networks, and an earlier simulator for DAG-based blockchain protocols.
      </p>
    </article>
    <article class="detail-item">
      <div class="detail-item__heading">
        <h3>Arcesium</h3>
        <p>Software engineering intern</p>
      </div>
      <time>2021</time>
      <p class="detail-item__body">
        Built a configuration-driven search framework that reduced the time needed to deploy new search functionality by 20×.
      </p>
    </article>
  </div>
</section>

<section class="details" id="education" aria-labelledby="education-title">
  <h2 id="education-title">Education</h2>
  <div class="detail-list detail-list--compact">
    <article class="detail-item">
      <div class="detail-item__heading">
        <h3>University of Texas at Austin</h3>
        <p>MS in Computer Science</p>
      </div>
      <time>2026–2027</time>
    </article>
    <article class="detail-item">
      <div class="detail-item__heading">
        <h3>National Institute of Technology, Tiruchirappalli</h3>
        <p>BTech (Honors) in Computer Science · Institute Gold Medalist · Rank 1/119</p>
      </div>
      <time>2018–2022</time>
    </article>
  </div>
</section>

<section class="details publication" id="publication" aria-labelledby="publication-title">
  <h2 id="publication-title">Publication</h2>
  <a class="publication__link" href="https://openaccess.thecvf.com/content/ACCV2022W/TCV/html/Sridhar_Transformer_Based_Motion_In-Betweening_ACCVW_2022_paper.html">
    <div>
      <h3>Transformer Based Motion In-Betweening</h3>
      <p>With Pavithra Sridhar, Madhav Aggarwal, and R. Leela Velusamy. A transformer-based system for synthesizing 3D animation between sparse keyframes.</p>
      <span>ACCV Workshops, 2022</span>
    </div>
    <span aria-hidden="true">↗</span>
  </a>
</section>

<section class="writing" id="writing" aria-labelledby="writing-title">
  <h2 id="writing-title">Writing</h2>
  <div class="post-list">
    {%- for post in site.posts -%}
      <article class="post-item">
        <a href="{{ post.url | relative_url }}">
          <div>
            <h3>{{ post.title | escape }}</h3>
            <p>{{ post.description | default: post.excerpt | strip_html | truncatewords: 24 }}</p>
          </div>
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %Y" }}</time>
        </a>
      </article>
    {%- endfor -%}
  </div>
</section>

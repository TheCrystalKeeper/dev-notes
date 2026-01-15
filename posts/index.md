---
layout: default
title: Posts
nav: posts
permalink: /posts/
---

<section class="page-header">
  <h1>Posts</h1>
  <p>Thoughts, tutorials, and updates on my development journey.</p>
</section>

<section class="posts-list">
{% assign post_pages = site.pages | where_exp: "p", "p.dir contains '/posts/'" | where_exp: "p", "p.name != 'index.md'" | where_exp: "p", "p.name != 'index.html'" %}
{% if post_pages.size == 0 %}
  <div class="post-card">
    <h2>No posts yet</h2>
    <p class="post-date">—</p>
    <p>Add a markdown file under <code>posts/MM-YYYY/</code>.</p>
  </div>
{% else %}
  {% for p in post_pages %}
    <div class="post-card">
      <h2><a class="post-link" href="{{ p.url }}">{{ p.title | escape }}</a></h2>
      <p class="post-date">{{ p.month_year | default: '' | escape }}</p>
    </div>
  {% endfor %}
{% endif %}
</section>


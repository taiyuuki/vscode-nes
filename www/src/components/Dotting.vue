<template>
  <span class="dot">...</span>
</template>

<style scoped>
.dot {
  display: inline-block;
  height: 1em;
  line-height: 1;
  text-align: left;
  vertical-align: -0.25em;
  overflow: hidden;
}

.dot::before {
  display: block;
  content: '...\A..\A.';
  white-space: pre-wrap;
  /* 也可以是white-space: pre */
  animation: dotting 2s infinite step-start both;
}

@keyframes dotting {
  33% {
    transform: translateY(-2em);
  }

  66% {
    transform: translateY(-1em);
  }
}
</style>

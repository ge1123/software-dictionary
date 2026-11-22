import { createApp, computed, watch, onUnmounted, ref } from 'vue/dist/vue.esm-bundler.js';
import { sections, terms } from './terms.js';
import './style.css';

const sorted = [...terms].sort((a, b) => a.en.localeCompare(b.en, 'en'));
createApp({
  setup() {
    const query = ref('');
    const category = ref('全部');
    const categories = ['全部', ...Object.keys(sections)];
    const filtered = computed(() => {
      const text = query.value.trim().toLowerCase();
      return sorted.filter(term =>
        (category.value === '全部' || term.category === category.value) &&
        [term.en, term.zh, term.definition, term.example].some(value => value.toLowerCase().includes(text))
      );
    });
    function reset() {
      category.value = '全部';
      query.value = '';
    }
    const slug = ref(location.hash.slice(1));
    const title = ref(null);
    const selected = computed(() => terms.find(term => term.id === slug.value));
    function readHash() {
      slug.value = location.hash.slice(1);
    }
    window.addEventListener('hashchange', readHash);
    onUnmounted(() => window.removeEventListener('hashchange', readHash));
    watch(selected, (term, previous) => {
      document.title = term ? term.en + ' · SQL 詞典' : 'SQL 詞典 · Software Dictionary';
      if (term) {
        title.value?.focus({ preventScroll: true });
        window.scrollTo(0, 0);
      } else if (previous) {
        document.getElementById(previous.id)?.focus();
      }
    }, { immediate: true, flush: 'post' });
    return { query, category, categories, filtered, reset, selected, title };
  }
}).mount('#app');

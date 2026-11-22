import { createApp, computed, nextTick, onMounted, ref } from 'vue/dist/vue.esm-bundler.js';
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
    onMounted(async () => {
      await nextTick();
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    });
    return { query, category, categories, filtered, reset };
  }
}).mount('#app');

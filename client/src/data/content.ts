export interface Book {
  id: number
  title: string
  author: string
  description: string
  language: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  cover: string
  url: string
}

export interface Tutorial {
  id: number
  title: string
  description: string
  language: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  tags: string[]
  url: string
  slug?: string
  excerpt?: string
  content?: string
  author?: string
  coverImage?: string
  status?: 'published' | 'draft'
  createdAt?: string
  updatedAt?: string
}

export interface Article {
  id: number
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  tags: string[]
  url: string
  slug?: string
  content?: string
  coverImage?: string
  status?: 'published' | 'draft'
  createdAt?: string
  updatedAt?: string
}

export interface Video {
  id: number
  title: string
  description: string
  channel: string
  duration: string
  language: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  thumbnail: string
  url: string
}

// ─── Books ───────────────────────────────────────────────────────────────────
export const books: Book[] = [
  {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description: 'A handbook of agile software craftsmanship. Learn to write code that is readable, maintainable, and elegant.',
    language: 'General',
    level: 'Intermediate',
    tags: ['Best Practices', 'Refactoring', 'Design'],
    cover: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
    url: '#',
  },
  {
    id: 2,
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    description: 'From journeyman to master. A collection of tips and techniques that have stood the test of time.',
    language: 'General',
    level: 'Intermediate',
    tags: ['Career', 'Best Practices', 'Productivity'],
    cover: 'https://covers.openlibrary.org/b/id/8261422-L.jpg',
    url: '#',
  },
  {
    id: 3,
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    description: 'A modern introduction to programming using JavaScript. Covers the language and programming in general.',
    language: 'JavaScript',
    level: 'Beginner',
    tags: ['JavaScript', 'Web', 'Fundamentals'],
    cover: 'https://eloquentjavascript.net/img/cover.jpg',
    url: 'https://eloquentjavascript.net',
  },
  {
    id: 4,
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Cormen, Leiserson, Rivest & Stein',
    description: 'The definitive reference on algorithms. Covers sorting, graphs, dynamic programming, and much more.',
    language: 'Algorithms',
    level: 'Advanced',
    tags: ['Algorithms', 'Data Structures', 'Mathematics'],
    cover: 'https://covers.openlibrary.org/b/id/8091023-L.jpg',
    url: '#',
  },
  {
    id: 5,
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    description: 'A fast-paced, no-nonsense guide to programming in Python. Perfect for beginners.',
    language: 'Python',
    level: 'Beginner',
    tags: ['Python', 'Beginner', 'Projects'],
    cover: 'https://covers.openlibrary.org/b/id/10527843-L.jpg',
    url: '#',
  },
  {
    id: 6,
    title: 'You Don\'t Know JS',
    author: 'Kyle Simpson',
    description: 'A deep dive into JavaScript mechanics. A series covering scope, closures, types, and async patterns.',
    language: 'JavaScript',
    level: 'Advanced',
    tags: ['JavaScript', 'Deep Dive', 'Async'],
    cover: 'https://covers.openlibrary.org/b/id/8261426-L.jpg',
    url: 'https://github.com/getify/You-Dont-Know-JS',
  },
  {
    id: 7,
    title: 'Programming TypeScript',
    author: 'Boris Cherny',
    description: 'Making Your JavaScript Applications Scale. A thorough introduction to TypeScript for JavaScript developers.',
    language: 'TypeScript',
    level: 'Intermediate',
    tags: ['TypeScript', 'JavaScript', 'Types'],
    cover: 'https://covers.openlibrary.org/b/id/9325896-L.jpg',
    url: '#',
  },
  {
    id: 8,
    title: 'Grokking Algorithms',
    author: 'Aditya Bhargava',
    description: 'An illustrated guide to algorithms. Makes complex concepts approachable with clear visuals and examples.',
    language: 'Algorithms',
    level: 'Beginner',
    tags: ['Algorithms', 'Illustrated', 'Beginner'],
    cover: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
    url: '#',
  },
]

// ─── Tutorials ────────────────────────────────────────────────────────────────
export const tutorials: Tutorial[] = [
  {
    id: 1,
    title: 'Python for Absolute Beginners',
    description: 'Start from zero. Install Python, understand variables, loops, functions, and build your first project.',
    language: 'Python',
    level: 'Beginner',
    duration: '4 hours',
    tags: ['Python', 'Variables', 'Functions', 'Loops'],
    url: '#',
  },
  {
    id: 2,
    title: 'JavaScript Fundamentals',
    description: 'Master the core building blocks of JavaScript: types, closures, the event loop, and the DOM.',
    language: 'JavaScript',
    level: 'Beginner',
    duration: '5 hours',
    tags: ['JavaScript', 'DOM', 'Events', 'Closures'],
    url: '#',
  },
  {
    id: 3,
    title: 'TypeScript Deep Dive',
    description: 'Understand the TypeScript type system, generics, decorators, and advanced patterns.',
    language: 'TypeScript',
    level: 'Intermediate',
    duration: '6 hours',
    tags: ['TypeScript', 'Generics', 'Types'],
    url: '#',
  },
  {
    id: 4,
    title: 'Vue.js 3 — Zero to Hero',
    description: 'Build full-featured apps with Vue 3, Composition API, Pinia, and Vue Router.',
    language: 'Vue.js',
    level: 'Intermediate',
    duration: '8 hours',
    tags: ['Vue', 'Pinia', 'Router', 'Composition API'],
    url: '#',
  },
  {
    id: 5,
    title: 'Data Structures in Python',
    description: 'Implement linked lists, stacks, queues, trees, and graphs from scratch in Python.',
    language: 'Python',
    level: 'Intermediate',
    duration: '5 hours',
    tags: ['Python', 'Data Structures', 'Algorithms'],
    url: '#',
  },
  {
    id: 6,
    title: 'Algorithm Design & Analysis',
    description: 'Understand Big-O notation, divide & conquer, dynamic programming, and greedy algorithms.',
    language: 'Algorithms',
    level: 'Advanced',
    duration: '10 hours',
    tags: ['Algorithms', 'Big-O', 'Dynamic Programming'],
    url: '#',
  },
  {
    id: 7,
    title: 'Rust for Systems Programmers',
    description: 'Learn ownership, borrowing, lifetimes, and concurrency in Rust.',
    language: 'Rust',
    level: 'Advanced',
    duration: '9 hours',
    tags: ['Rust', 'Systems', 'Memory Safety'],
    url: '#',
  },
  {
    id: 8,
    title: 'Go — Practical Introduction',
    description: 'Build CLI tools and web services with Go. Understand goroutines, channels, and interfaces.',
    language: 'Go',
    level: 'Beginner',
    duration: '4 hours',
    tags: ['Go', 'Goroutines', 'CLI'],
    url: '#',
  },
]

// ─── Articles ─────────────────────────────────────────────────────────────────
export const articles: Article[] = [
  {
    id: 1,
    title: 'Understanding Big O Notation Once and For All',
    excerpt: 'Big O notation is the language we use to describe algorithm efficiency. This guide breaks it down visually with concrete Python and JavaScript examples.',
    author: 'Toscani Tenekeu',
    date: '2026-04-12',
    readTime: '7 min read',
    tags: ['Algorithms', 'Big-O', 'Performance'],
    url: '#',
  },
  {
    id: 2,
    title: 'Vue 3 Composition API: A Complete Guide',
    excerpt: 'The Composition API fundamentally changes how we organize Vue components. Learn setup(), ref, reactive, computed, and lifecycle hooks with practical examples.',
    author: 'Toscani Tenekeu',
    date: '2026-03-28',
    readTime: '10 min read',
    tags: ['Vue', 'JavaScript', 'Frontend'],
    url: '#',
  },
  {
    id: 3,
    title: 'TypeScript Strict Mode: Why You Should Enable It',
    excerpt: 'Strict mode in TypeScript catches a whole category of bugs at compile time. Here\'s what each flag does and why the tradeoff is always worth it.',
    author: 'Toscani Tenekeu',
    date: '2026-03-14',
    readTime: '5 min read',
    tags: ['TypeScript', 'Best Practices'],
    url: '#',
  },
  {
    id: 4,
    title: 'REST vs GraphQL: Choosing the Right API Design',
    excerpt: 'Both REST and GraphQL have their place. This article compares them on complexity, performance, caching, and developer experience.',
    author: 'Toscani Tenekeu',
    date: '2026-02-20',
    readTime: '8 min read',
    tags: ['API', 'REST', 'GraphQL', 'Backend'],
    url: '#',
  },
  {
    id: 5,
    title: 'Dynamic Programming: From Fibonacci to Knapsack',
    excerpt: 'Dynamic programming is about breaking problems into subproblems and caching results. Walk through 5 classic problems with step-by-step solutions.',
    author: 'Toscani Tenekeu',
    date: '2026-02-05',
    readTime: '12 min read',
    tags: ['Algorithms', 'Dynamic Programming', 'Python'],
    url: '#',
  },
  {
    id: 6,
    title: 'CSS Grid vs Flexbox: When to Use Which',
    excerpt: 'Both CSS layout systems are powerful but serve different purposes. A practical breakdown with real code examples for every scenario.',
    author: 'Toscani Tenekeu',
    date: '2026-01-18',
    readTime: '6 min read',
    tags: ['CSS', 'Frontend', 'Layout'],
    url: '#',
  },
]

// ─── Videos ───────────────────────────────────────────────────────────────────
export const videos: Video[] = [
  {
    id: 1,
    title: 'Python Full Course for Beginners',
    description: 'A comprehensive 6-hour Python course covering everything from variables to object-oriented programming.',
    channel: 'DevLibrary',
    duration: '6:12:00',
    language: 'Python',
    level: 'Beginner',
    tags: ['Python', 'OOP', 'Full Course'],
    thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
  },
  {
    id: 2,
    title: 'JavaScript Arrays Explained in Depth',
    description: 'Master every array method in JavaScript: map, filter, reduce, flatMap, find, and more with real-world use cases.',
    channel: 'DevLibrary',
    duration: '45:00',
    language: 'JavaScript',
    level: 'Beginner',
    tags: ['JavaScript', 'Arrays', 'Functional'],
    thumbnail: 'https://img.youtube.com/vi/R8rmfD9Y5-c/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=R8rmfD9Y5-c',
  },
  {
    id: 3,
    title: 'Sorting Algorithms Visualized',
    description: 'Bubble sort, merge sort, quick sort, and heap sort — visualized and explained with complexity analysis.',
    channel: 'DevLibrary',
    duration: '1:08:00',
    language: 'Algorithms',
    level: 'Intermediate',
    tags: ['Algorithms', 'Sorting', 'Visualization'],
    thumbnail: 'https://img.youtube.com/vi/kPRA0W1kECg/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=kPRA0W1kECg',
  },
  {
    id: 4,
    title: 'Vue.js 3 Tutorial — The Composition API',
    description: 'Deep dive into Vue 3 Composition API, script setup syntax, and building a real app from scratch.',
    channel: 'DevLibrary',
    duration: '2:30:00',
    language: 'Vue.js',
    level: 'Intermediate',
    tags: ['Vue', 'Composition API', 'Frontend'],
    thumbnail: 'https://img.youtube.com/vi/I_xLMmNeLDY/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=I_xLMmNeLDY',
  },
  {
    id: 5,
    title: 'TypeScript Crash Course',
    description: 'Everything you need to start using TypeScript today: types, interfaces, generics, and React with TS.',
    channel: 'DevLibrary',
    duration: '1:15:00',
    language: 'TypeScript',
    level: 'Beginner',
    tags: ['TypeScript', 'Types', 'Crash Course'],
    thumbnail: 'https://img.youtube.com/vi/BCg4U1FzODs/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=BCg4U1FzODs',
  },
  {
    id: 6,
    title: 'Graph Algorithms: BFS, DFS, Dijkstra',
    description: 'Understand graph traversal and shortest-path algorithms with step-by-step Python implementations.',
    channel: 'DevLibrary',
    duration: '1:45:00',
    language: 'Algorithms',
    level: 'Advanced',
    tags: ['Algorithms', 'Graphs', 'Python'],
    thumbnail: 'https://img.youtube.com/vi/tWVWeAqZ0WU/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU',
  },
]

// ─── Language list (for filters) ─────────────────────────────────────────────
export const languages = ['All', 'Python', 'JavaScript', 'TypeScript', 'Vue.js', 'Go', 'Rust', 'Algorithms', 'General']
export const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

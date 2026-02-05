---
name: Svelte 5 Expert
description: Authoritative guide for writing Svelte 5 code with Runes, verified against official migration guides.
---

# Svelte 5 Expert Guidelines

This skill provides the mandatory coding standards for Svelte 5 in the Antigravity project.
Ref: https://svelte.dev/docs/svelte/v5-migration-guide

## 1. Core Principles: Runes are Mandatory

**Strictly avoid legacy Svelte 4 APIs.**

- ❌ `export let prop` -> ✅ `let { prop } = $props()`
- ❌ `let count = 0; ... count += 1` -> ✅ `let count = $state(0)`
- ❌ `$: double = count * 2` -> ✅ `let double = $derived(count * 2)`
- ❌ `$: { console.log(count) }` -> ✅ `$effect(() => console.log(count))`

## 2. Props Interface

Always destructure props immediately.

```typescript
// BAD
export let title: string;
export let active = false;

// GOOD
interface Props {
	title: string;
	active?: boolean;
}
let { title, active = false }: Props = $props();
```

## 3. Event Handling (DEPRECATION WARNING)

`createEventDispatcher` is deprecated. Use callback props.

```typescript
// BAD
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();
dispatch('click');

// GOOD
let { onclick }: { onclick?: () => void } = $props();
// use onclick() directly in the template
```

## 4. Snippets (Render Props)

Slots (`<slot>`) are deprecated. Use Snippets.

```svelte
<!-- Child (Card.svelte) -->
<script>
	let { header }: { header: Snippet } = $props();
</script>

<!-- Parent -->
<Card>
	{#snippet header()}<h1>Title</h1>{/snippet}
</Card>
{@render header()}
```

## 5. Reactivity in Classes (.svelte.ts)

Components are no longer classes. Logic classes must use `.svelte.ts` extension to enable Runes.

```typescript
// input.svelte.ts
export class InputManager {
	currentKey = $state(''); // Universal reactivity
}
```

## 6. Linter & Type Safety

- Always use `lang="ts"`.
- Trust the Svelte check. If it flags a "reactive assignment to non-state", fixing it is higher priority than feature work.

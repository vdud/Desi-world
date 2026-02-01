// src/lib/stores/commonStores.ts
import { writable } from 'svelte/store';
import { Vector3 } from 'three';

export const isPlane = writable(false);
export const playerPosition = writable(new Vector3(0, 2, 0)); // Add this

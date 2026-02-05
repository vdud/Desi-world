// src/lib/stores/commonStores.ts
import { writable } from 'svelte/store';
import { Vector3 } from 'three';

export const isPlane = writable(true); // Toggle for Plane/Player view
export const playerPosition = writable<Vector3>(new Vector3(0, 0, 0));
export const audioListener = writable<any>(null);

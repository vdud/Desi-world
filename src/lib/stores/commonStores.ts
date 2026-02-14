// src/lib/stores/commonStores.ts
import { writable } from 'svelte/store';
import { Vector3, Euler, type AudioListener } from 'three';

export const isPlane = writable(true); // Toggle for Plane/Player view
export const playerPosition = writable<Vector3>(new Vector3(0, 5, 0));
export const playerRotation = writable<Euler>(new Euler(0, 0, 0));
export const audioListener = writable<AudioListener | null>(null);

export const navigationTarget = writable<{ x: number; y: number; z: number } | null>(null);

// Initialize player name from localStorage if available
const storedName = typeof window !== 'undefined' ? localStorage.getItem('root0_playerName') : null;
const initialName = storedName || 'Guest-' + Math.floor(Math.random() * 1000);
export const playerName = writable<string>(initialName);

// Subscribe to changes to persist name
if (typeof window !== 'undefined') {
	playerName.subscribe((value) => {
		localStorage.setItem('root0_playerName', value);
	});
}

// Chat Implementation
export const chatTarget = writable<string | null>(null);
export const isChatOpen = writable(false);

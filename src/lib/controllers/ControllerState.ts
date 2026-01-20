// lib/controllers/ControllerState.ts
import { writable } from 'svelte/store';
import { Vector3 } from 'three';
import type { RigidBody } from '@dimforge/rapier3d-compat';

export type ControllerState = 'idle' | 'walking' | 'running' | 'airborne' | 'locked';

export interface Velocity {
	x: number;
	y: number;
	z: number;
}

export interface InputVector {
	x: number;
	y: number;
	z: number;
	run: boolean;
}

export const controllerState = writable<ControllerState>('idle');
export const isLocked = writable(false);
export const movementVelocity = writable<Velocity>({ x: 0, y: 0, z: 0 });
export const isGrounded = writable(false);

export const rawInput = writable<InputVector>({ x: 0, y: 0, z: 0, run: false });
export const mouseDelta = writable({ x: 0, y: 0 });

export class PhysicsState {
	velocity = new Vector3();
	targetVelocity = new Vector3();
	grounded = false;
	jumpQueued = false;
}

// export class AnimationState {
// 	currentClip = 'idle';
// 	transitionTime = 0.2;
// 	weight = 1.0;
// }

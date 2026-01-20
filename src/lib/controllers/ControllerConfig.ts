export interface ControllerConfigType {
	// Movement
	acceleration: number;
	deceleration: number;
	maxWalkSpeed: number;
	maxRunSpeed: number;
	jumpImpulse: number;
	groundedThreshold: number;

	// Camera
	cameraArmLength: number;
	cameraHeight: number;
	cameraSpring: { stiffness: number; damping: number };
	cameraCollisionRadius: number;
	cameraMinPitch: number;
	cameraMaxPitch: number;

	// Input
	mouseSensitivity: number;
	gamepadDeadzone: number;
	keyboardDeadzoneMs: number;

	// States
	stateTransitionDelay: number;
}

// lib/controllers/ControllerConfig.ts
export const ControllerConfig = {
	// Movement
	acceleration: 15, // units/s² (soft start)
	deceleration: 25, // units/s² (responsive stop)
	maxWalkSpeed: 4,
	maxRunSpeed: 8,
	jumpImpulse: 5,
	groundedThreshold: 0.1, // Raycast distance for "is grounded"

	// Camera
	cameraArmLength: 4,
	cameraHeight: 2,
	cameraSpring: { stiffness: 60, damping: 10 }, // Critically damped
	cameraCollisionRadius: 0.3,
	cameraMinPitch: (-30 * Math.PI) / 180,
	cameraMaxPitch: (60 * Math.PI) / 180,

	// Input
	mouseSensitivity: 0.002,
	gamepadDeadzone: 0.15,
	keyboardDeadzoneMs: 16, // Ignore key repeat faster than 60fps

	// States
	stateTransitionDelay: 0.2 // Prevent animation flutter
} as const;

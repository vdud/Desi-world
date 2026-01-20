<script lang="ts">
	import { backward, forward } from '$lib/stores/characterControlMovement';
</script>

<div class="Abs">
	<button
		on:click={() => {
			if ($backward === 1) {
				$backward = 0;
				return;
			}
			if ($forward == 1) {
				$forward = 0;
				return;
			}
			$forward = 1;
		}}
		class="topCtrl">⬆️</button
	>
	<button
		on:click={() => {
			if ($forward === 1) {
				$forward = 0;
				return;
			}
			if ($backward == 1) {
				$backward = 0;
				return;
			}
			$backward = 1;
		}}
		class="bottomCtrl">⬇️</button
	>
</div>

<style>
	.Abs {
		display: none;
	}
	@media screen and (max-width: 768px) {
		.Abs {
			width: 30%;
			height: 160px;
			position: fixed;
			bottom: 0;
			right: 0;
			z-index: 10000;

			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-around;
		}
		.Abs button {
			font-size: 3rem;
			width: 100%;
			border: none;
			margin: 0;
			padding: 0;
			height: 100%;
			background-color: transparent;
			/* no text selection */
			-webkit-touch-callout: none;
			cursor: pointer;
		}
		.Abs button:active,
		.Abs button:focus,
		.Abs button:hover {
			border: none;
		}
	}
</style>

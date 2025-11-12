// Main entry point for BioSim4 Web

import { ConfigManager } from './config/config.js';
import { Simulation } from './core/Simulation.js';
import { Renderer } from './rendering/Renderer.js';
import { UIController } from './ui/UIController.js';

// Initialize application
class App {
    constructor() {
        this.config = new ConfigManager();
        this.simulation = new Simulation(this.config);

        const canvas = document.getElementById('simulationCanvas');
        this.renderer = new Renderer(canvas, this.config);

        this.ui = new UIController(this.simulation, this.renderer, this.config);

        this.running = false;
        this.lastTime = performance.now();

        // Start animation loop
        this.loop();

        console.log('🧬 BioSim4 Web initialized!');
        console.log('Press Play to start the simulation');
    }

    loop() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update simulation (if running)
        if (this.simulation.running) {
            // Run multiple updates per frame based on speed
            const updatesPerFrame = Math.max(1, Math.floor(this.simulation.speed));
            for (let i = 0; i < updatesPerFrame; i++) {
                this.simulation.update();
            }
        }

        // Render
        this.renderer.render(
            this.simulation.world,
            this.simulation.creatures,
            this.simulation.getStats()
        );

        // Update UI stats
        const stats = this.simulation.getStats();
        const fps = this.renderer.getFPS();
        this.ui.updateStats(stats, fps);

        // Continue loop
        requestAnimationFrame(() => this.loop());
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}

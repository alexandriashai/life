// UI Controller - binds UI to simulation

export class UIController {
    constructor(simulation, renderer, config) {
        this.simulation = simulation;
        this.renderer = renderer;
        this.config = config;
        this.selectedCreature = null;

        this.bindControls();
        this.bindCanvas();
    }

    bindControls() {
        // Play/Pause button
        const btnPlayPause = document.getElementById('btnPlayPause');
        btnPlayPause.addEventListener('click', () => {
            if (this.simulation.running) {
                this.simulation.pause();
                btnPlayPause.textContent = '▶ Play';
                btnPlayPause.classList.remove('active');
            } else {
                this.simulation.start();
                btnPlayPause.textContent = '⏸ Pause';
                btnPlayPause.classList.add('active');
            }
        });

        // Step button
        document.getElementById('btnStep').addEventListener('click', () => {
            this.simulation.step();
        });

        // Reset button
        document.getElementById('btnReset').addEventListener('click', () => {
            if (confirm('Reset simulation? This will start from generation 0.')) {
                this.simulation.reset();
                const btnPlayPause = document.getElementById('btnPlayPause');
                btnPlayPause.textContent = '▶ Play';
                btnPlayPause.classList.remove('active');
            }
        });

        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            this.simulation.setSpeed(speed);
            speedValue.textContent = speed.toFixed(1);
        });

        // Show pheromones checkbox
        document.getElementById('showPheromones').addEventListener('change', (e) => {
            this.config.set('rendering.showPheromones', e.target.checked);
        });

        // Show grid checkbox
        document.getElementById('showGrid').addEventListener('change', (e) => {
            this.config.set('rendering.showGrid', e.target.checked);
        });

        // Apply configuration button
        document.getElementById('btnApplyConfig').addEventListener('click', () => {
            this.applyConfiguration();
        });
    }

    bindCanvas() {
        const canvas = document.getElementById('simulationCanvas');

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const cellSize = this.config.get('rendering.cellSize');
            const gridX = Math.floor(x / cellSize);
            const gridY = Math.floor(y / cellSize);

            const creature = this.simulation.getCreatureAt(gridX, gridY);
            if (creature) {
                this.selectCreature(creature);
            }
        });
    }

    selectCreature(creature) {
        this.selectedCreature = creature;

        const creaturePanel = document.getElementById('creature-panel');
        const creatureInfo = document.getElementById('creature-info');

        creaturePanel.style.display = 'block';

        const info = creature.getInfo();
        creatureInfo.innerHTML = `
            <div><strong>Position:</strong> ${info.position}</div>
            <div><strong>Age:</strong> ${info.age}</div>
            <div><strong>Genome Length:</strong> ${info.genomeLength}</div>
            <div><strong>Internal Neurons:</strong> ${info.neurons}</div>
            <div><strong>Connections:</strong> ${info.connections}</div>
            <div><strong>Responsiveness:</strong> ${info.responsiveness}</div>
            <div><strong>Osc Period:</strong> ${info.oscPeriod}</div>
            <div><strong>Long Probe:</strong> ${info.longProbeDist}</div>
        `;

        const genomeCanvas = document.getElementById('genomeCanvas');
        this.renderer.renderGenomeVisualization(creature, genomeCanvas);
    }

    applyConfiguration() {
        // Read configuration from form
        const worldSize = parseInt(document.getElementById('cfgWorldSize').value);
        const population = parseInt(document.getElementById('cfgPopulation').value);
        const stepsPerGen = parseInt(document.getElementById('cfgStepsPerGen').value);
        const geneCount = parseInt(document.getElementById('cfgGeneCount').value);
        const mutationRate = parseFloat(document.getElementById('cfgMutationRate').value);
        const maxNeurons = parseInt(document.getElementById('cfgMaxNeurons').value);
        const challenge = parseInt(document.getElementById('cfgChallenge').value);
        const barrier = parseInt(document.getElementById('cfgBarrier').value);

        // Update configuration
        this.config.set('world.width', worldSize);
        this.config.set('world.height', worldSize);
        this.config.set('population.initialSize', population);
        this.config.set('simulation.stepsPerGeneration', stepsPerGen);
        this.config.set('genome.geneCount', geneCount);
        this.config.set('genome.mutationRate', mutationRate);
        this.config.set('genome.maxInternalNeurons', maxNeurons);
        this.config.set('selection.challengeType', challenge);
        this.config.set('barriers.barrierType', barrier);

        // Reset simulation with new config
        if (confirm('Apply configuration? This will reset the simulation.')) {
            this.simulation.reset();
            const btnPlayPause = document.getElementById('btnPlayPause');
            btnPlayPause.textContent = '▶ Play';
            btnPlayPause.classList.remove('active');
        }
    }

    updateStats(stats, fps) {
        document.getElementById('statPopulation').textContent = stats.population;
        document.getElementById('statSurvivors').textContent = stats.survivors;
        document.getElementById('statGeneration').textContent = stats.generation;
        document.getElementById('statGenomeLength').textContent = stats.avgGenomeLength;
        document.getElementById('statFPS').textContent = fps;
        document.getElementById('statUPS').textContent = stats.ups;

        const generationCounter = document.getElementById('generation-counter');
        generationCounter.textContent = `Generation: ${stats.generation} | Step: ${stats.step}`;
    }
}

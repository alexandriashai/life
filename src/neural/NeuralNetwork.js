// Neural Network for creature brains

export class NeuralNetwork {
    constructor() {
        this.neurons = new Map(); // neuronId -> output value
        this.connections = [];    // {source, sink, weight}
        this.neuronInputs = new Map(); // neuronId -> accumulated input
    }

    addNeuron(neuronId) {
        if (!this.neurons.has(neuronId)) {
            this.neurons.set(neuronId, 0.0);
            this.neuronInputs.set(neuronId, 0.0);
        }
    }

    addConnection(sourceType, sourceId, sinkType, sinkId, weight) {
        this.connections.push({
            sourceType,  // 'sensor', 'neuron'
            sourceId,
            sinkType,    // 'neuron', 'action'
            sinkId,
            weight
        });

        // If sink is a neuron, make sure it exists
        if (sinkType === 'neuron') {
            this.addNeuron(sinkId);
        }
    }

    // Forward propagation: sensors + neurons -> actions
    evaluate(sensorValues) {
        const numSensors = 21;  // Total number of sensors
        const numActions = 16;  // Total number of actions

        // Clear neuron inputs
        for (const neuronId of this.neuronInputs.keys()) {
            this.neuronInputs.set(neuronId, 0.0);
        }

        // Initialize action outputs
        const actionOutputs = new Float32Array(numActions);

        // Process connections
        for (const conn of this.connections) {
            let sourceValue = 0.0;

            // Get source value
            if (conn.sourceType === 'sensor') {
                sourceValue = sensorValues[conn.sourceId] || 0.0;
            } else if (conn.sourceType === 'neuron') {
                sourceValue = this.neurons.get(conn.sourceId) || 0.0;
            }

            // Apply weight
            const weightedValue = sourceValue * (conn.weight / 8192.0); // Normalize weight

            // Accumulate to sink
            if (conn.sinkType === 'neuron') {
                const current = this.neuronInputs.get(conn.sinkId) || 0.0;
                this.neuronInputs.set(conn.sinkId, current + weightedValue);
            } else if (conn.sinkType === 'action') {
                actionOutputs[conn.sinkId] += weightedValue;
            }
        }

        // Apply activation function (tanh) to neurons and update outputs
        for (const [neuronId, input] of this.neuronInputs.entries()) {
            this.neurons.set(neuronId, Math.tanh(input));
        }

        return actionOutputs;
    }

    clear() {
        for (const neuronId of this.neurons.keys()) {
            this.neurons.set(neuronId, 0.0);
        }
    }

    getConnectionCount() {
        return this.connections.length;
    }

    getNeuronCount() {
        return this.neurons.size;
    }
}

// Build neural network from genome
export function buildNeuralNetwork(genome, maxInternalNeurons, numSensors = 21, numActions = 16) {
    const network = new NeuralNetwork();

    // Renumber genes to valid ranges and build connections
    for (const gene of genome.genes) {
        let sourceType = gene.sourceType === 0 ? 'sensor' : 'neuron';
        let sinkType = gene.sinkType === 0 ? 'neuron' : 'action';

        let sourceId = gene.sourceNum;
        let sinkId = gene.sinkNum;

        // Renumber to valid ranges
        if (sourceType === 'sensor') {
            sourceId = sourceId % numSensors;
        } else {
            sourceId = sourceId % maxInternalNeurons;
        }

        if (sinkType === 'neuron') {
            sinkId = sinkId % maxInternalNeurons;
        } else {
            sinkId = sinkId % numActions;
        }

        network.addConnection(sourceType, sourceId, sinkType, sinkId, gene.weight);
    }

    // Prune neurons with no outputs (iterative process)
    let pruned = true;
    while (pruned) {
        pruned = false;
        const neuronsWithOutputs = new Set();

        for (const conn of network.connections) {
            if (conn.sourceType === 'neuron') {
                neuronsWithOutputs.add(conn.sourceId);
            }
        }

        // Remove connections to neurons with no outputs
        const newConnections = network.connections.filter(conn => {
            if (conn.sinkType === 'neuron' && !neuronsWithOutputs.has(conn.sinkId)) {
                pruned = true;
                return false;
            }
            return true;
        });

        network.connections = newConnections;
    }

    return network;
}

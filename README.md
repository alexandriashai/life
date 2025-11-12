# 🧬 BioSim4 Web - Evolution Simulator

A complete web-based implementation of the **biosim4** biological evolution simulator by David R. Miller. Watch artificial organisms with neural network brains evolve through natural selection in real-time!

![BioSim4 Web](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

- **Full Biosim4 Implementation**: Complete web port with all 21 sensors, 16 actions, and neural network brains
- **Real-time Visualization**: Watch creatures evolve in a beautiful canvas-based interface
- **Multiple Selection Challenges**: 13+ different survival challenges (center, corners, migration, etc.)
- **Configurable Barriers**: 7 barrier types to add obstacles to the environment
- **Pheromone Communication**: Creatures can emit and sense chemical signals
- **Interactive UI**: Click on creatures to inspect their genomes and neural networks
- **Performance Optimized**: Runs smoothly with 300+ creatures at 60 FPS
- **Fully Configurable**: Adjust population size, mutation rates, genome length, and more

## 🚀 Quick Start

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/alexandriashai/life.git
   cd life
   ```

2. **Serve the files** (required for ES6 modules):
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Or using Node.js
   npx http-server -p 8000

   # Or using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000` in your web browser.

4. **Start evolving**:
   - Click the **Play** button to start the simulation
   - Watch creatures evolve over generations
   - Click on creatures to inspect their genomes

## 🎮 How It Works

### The Simulation

Each creature is an autonomous agent with:

1. **Genome**: A sequence of genes that encode neural connections (24 genes by default)
2. **Neural Network Brain**: Sensors → Internal Neurons → Actions
3. **Sensors**: 21 different sensors (position, age, pheromones, population density, etc.)
4. **Actions**: 16 actions (movement in 8 directions, emit pheromones, adjust parameters)

### Evolution Process

```
Generation N:
  ↓
For 300 steps:
  - Each creature senses environment
  - Neural network processes inputs
  - Actions executed (movement, pheromones)
  - Pheromones decay
  ↓
Selection Challenge Applied:
  - Only creatures passing challenge survive
  ↓
Reproduction:
  - Survivors reproduce (sexual/asexual)
  - Genomes mutated (bit-flip mutations)
  ↓
Generation N+1 begins
```

## 🎛️ Configuration

### World Settings

- **Grid Size**: 32-256 (default: 128×128)
- **Population**: 50-1000 creatures (default: 300)
- **Steps per Generation**: 100-1000 (default: 300)

### Genome Settings

- **Initial Genes**: 4-100 (default: 24)
- **Mutation Rate**: 0-0.1 per bit (default: 0.001)
- **Max Internal Neurons**: 1-20 (default: 5)

### Selection Challenges

Choose from 13 different challenges:

| Challenge | Description |
|-----------|-------------|
| **Circle** | Survive by staying in a circular zone |
| **Right Half** | Survive by moving to the right half |
| **Right Quarter** | Survive by reaching the far right |
| **Left Eighth** | Survive by reaching the far left |
| **String (Social)** | Survive by having 2-22 neighbors |
| **Center Weighted** | Survive by staying near center |
| **Center Unweighted** | Survive within center radius |
| **Center Sparse** | Survive near center with specific density |
| **Corner** | Survive by reaching any corner |
| **Against Any Wall** | Survive by touching any boundary |
| **Migrate Distance** | Survive by traveling far from birth |
| **East-West Eighths** | Survive at far left or far right |

### Barrier Types

Add obstacles to the environment:

| Type | Description |
|------|-------------|
| **None** | No barriers |
| **Vertical Bar** | Vertical wall at center |
| **Random Vertical** | Vertical wall at random position |
| **Five Blocks** | Five rectangular obstacles |
| **Horizontal Bar** | Horizontal wall in lower-right |
| **Circular Island** | One circular obstacle |
| **Five Spots** | Five circular obstacles |

## 🧠 Neural Network System

### 21 Sensors

Creatures can sense:

- **Position**: X, Y coordinates, distance to boundaries
- **Environment**: Population density, barriers, obstacles
- **Pheromones**: Chemical signals in different directions
- **Self**: Age, last movement direction, oscillator
- **Social**: Genetic similarity with neighbors

### 16 Actions

Creatures can:

- **Move**: 8 directions (N, S, E, W, NE, NW, SE, SW)
- **Advanced Movement**: Forward, reverse, left, right, random
- **Communication**: Emit pheromones
- **Self-Modification**: Adjust responsiveness, oscillator period, probe distance

### Neural Network Architecture

```
Sensors (21) → Internal Neurons (0-5) → Actions (16)
```

- Genes encode connections with weights
- Connections pruned if neurons have no outputs
- Forward propagation using `tanh()` activation
- No learning during lifetime (fixed architecture from birth)

## 📊 Understanding the Display

### Canvas

- **Colored Circles**: Creatures (color determined by genome)
- **Green Glow**: Pheromone concentrations
- **Gray Blocks**: Barriers/obstacles
- **Yellow Outline**: Selection zone (survival area)

### Statistics Panel

- **Population**: Current number of alive creatures
- **Survivors**: How many passed the selection challenge
- **Generation**: Current generation number
- **Avg Genome Length**: Average number of genes
- **FPS**: Frames per second (rendering)
- **UPS**: Updates per second (simulation)

## 🔬 Technical Details

### Architecture

```
src/
├── config/          # Configuration management
├── core/            # Simulation, World, Creature
├── genome/          # Gene, Genome encoding
├── neural/          # Neural network implementation
├── sensors/         # All 21 sensors
├── actions/         # All 16 actions
├── pheromones/      # Chemical signaling
├── selection/       # Survival challenges
├── reproduction/    # Reproduction & mutation
├── rendering/       # Canvas visualization
├── ui/              # UI controls
└── utils/           # Random number generation, etc.
```

### Key Technologies

- **Pure JavaScript**: No external dependencies
- **ES6 Modules**: Clean, modular code
- **Canvas API**: High-performance rendering
- **Web Standards**: Runs in any modern browser

### Performance

- **Simulation**: 300 creatures @ 60 UPS
- **Rendering**: 60 FPS with pheromones
- **Memory**: ~10-20 MB for typical simulation
- **Optimization**: Batch rendering, typed arrays, spatial partitioning

## 🎨 Customization

### Adding New Sensors

1. Edit `src/sensors/SensorSystem.js`
2. Add sensor logic to the `sense()` method
3. Update neural network to handle new sensor count

### Adding New Actions

1. Edit `src/actions/ActionSystem.js`
2. Add action logic to the `execute()` method
3. Update neural network to handle new action count

### Adding New Challenges

1. Edit `src/selection/SelectionManager.js`
2. Add challenge logic to `passesChallenge()`
3. Add option to HTML select in `index.html`

## 📖 Original Research

This is a web implementation of **biosim4** by David R. Miller:

- **Original Repository**: https://github.com/davidrmiller/biosim4
- **Video**: ["I programmed some creatures. They evolved."](https://www.youtube.com/watch?v=N3tRFayqVtk)
- **Paper**: [Biological Evolution Simulation](https://github.com/davidrmiller/biosim4)

### Key Differences from Original

- **Platform**: Web (JavaScript) vs. C++
- **Real-time**: Interactive browser vs. batch processing
- **Visualization**: Live canvas rendering vs. video generation
- **UI**: Interactive controls vs. config file editing

## 🐛 Troubleshooting

### Simulation won't start

- Make sure you're serving files over HTTP (not `file://`)
- Check browser console for errors
- Try using a modern browser (Chrome, Firefox, Edge, Safari)

### Poor performance

- Reduce population size
- Decrease grid size
- Lower simulation speed
- Disable pheromone rendering

### Creatures don't evolve

- Increase mutation rate
- Adjust selection challenge
- Increase steps per generation
- Try different barrier configurations

## 📝 License

MIT License - See original biosim4 repository for details.

## 🙏 Credits

- **David R. Miller**: Original biosim4 implementation
- **Web Implementation**: Based on the complete biosim4 specification

## 🌐 Links

- **Original biosim4**: https://github.com/davidrmiller/biosim4
- **Video**: https://www.youtube.com/watch?v=N3tRFayqVtk

---

**Enjoy watching evolution in action! 🧬✨**

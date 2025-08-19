class MathSpace3DGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.currentProblem = null;
        this.currentNode = 0;
        this.visitedNodes = new Set([0]);
        this.playerStats = {
            correctAnswers: 0,
            wrongAnswers: 0,
            streakCount: 0,
            topicStrengths: new Map(),
            totalPlayTime: 0,
            difficultyPreference: 'easy',
            skillLevel: 1
        };
        this.gameStartTime = Date.now();
        this.dustWarningShown = false;
        this.gameInitialized = false;
        
        this.mindMapData = this.generateAdaptiveMindMapStructure();
        this.stars = [];
        this.connections = [];
        this.gravityFields = [];
        this.floatingParticles = [];
        this.spacePirates = [];
        this.intelligentDust = [];
        this.pirateSpawnTimer = 0;
        this.maxPirates = 2;
        this.maxDustPerPlanet = 8;
        this.frameCount = 0;
        this.lastPerformanceCheck = Date.now();
        
        this.initializeElements();
        this.init3DScene();
        this.create3DEnvironment();
        this.create3DMindMap();
        this.createGravitySystem();
        this.createIntelligentDust();
        this.generateNewProblem();
        
        this.bindEvents();
        this.animate();
        
        // Mark game as initialized after a short delay
        setTimeout(() => {
            this.gameInitialized = true;
        }, 2000);
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score-value');
        this.levelElement = document.getElementById('level-value');
        this.problemElement = document.getElementById('problem');
        this.answerInput = document.getElementById('answer-input');
        this.submitButton = document.getElementById('submit-answer');
        this.feedbackElement = document.getElementById('feedback');
        this.container = document.getElementById('three-scene');
    }
    
    init3DScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.maxDistance = 50;
        this.controls.minDistance = 10;
        
        this.camera.position.set(0, 5, 20);
        this.controls.update();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    create3DEnvironment() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
        
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 200;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const backgroundStars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(backgroundStars);
        
        const nebulaGeometry = new THREE.PlaneGeometry(100, 100);
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a0e4e,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        
        const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        nebula.position.z = -30;
        nebula.rotation.x = Math.PI / 4;
        this.scene.add(nebula);
    }
    
    generateAdaptiveMindMapStructure() {
        const baseNodes = [
            { id: 0, x: 0, y: 0, z: 0, label: "Aloitus", type: "start", difficulty: 1, connections: [] }
        ];
        
        return baseNodes;
    }
    
    generateNextPlanets(existingNodes) {
        const nodes = [...existingNodes];
        let nodeId = existingNodes.length;
        
        const lastNode = existingNodes[existingNodes.length - 1];
        const playerStrength = this.calculatePlayerStrength();
        const suggestedTopics = this.suggestNextTopics(lastNode, playerStrength);
        
        console.log('Generating planets:', {
            lastNode: lastNode.label,
            playerStrength,
            suggestedTopics
        });
        
        suggestedTopics.forEach((topic, index) => {
            const angle = (index / suggestedTopics.length) * Math.PI * 2;
            const radius = 8 + (index * 2);
            const height = 3 + Math.random() * 4;
            
            const newNode = {
                id: nodeId++,
                x: lastNode.x + Math.cos(angle) * radius,
                y: lastNode.y + height,
                z: lastNode.z + Math.sin(angle) * radius,
                label: topic.label,
                type: topic.type,
                difficulty: topic.difficulty,
                connections: [],
                parentId: lastNode.id,
                generatedAt: Date.now(),
                adaptedTo: {
                    skillLevel: this.playerStats.skillLevel,
                    strengths: Array.from(this.playerStats.topicStrengths.entries()),
                    preference: this.playerStats.difficultyPreference
                }
            };
            
            nodes.push(newNode);
            console.log('Generated planet:', newNode.label);
        });
        
        this.connectNodes(nodes);
        console.log('Final nodes after connection:', nodes.map(n => ({id: n.id, label: n.label, connections: n.connections})));
        return nodes;
    }
    
    calculatePlayerStrength() {
        const totalAnswers = this.playerStats.correctAnswers + this.playerStats.wrongAnswers;
        const accuracy = totalAnswers > 0 ? this.playerStats.correctAnswers / totalAnswers : 0.5;
        const streak = this.playerStats.streakCount;
        const playTime = (Date.now() - this.gameStartTime) / 60000;
        
        return {
            accuracy: accuracy,
            streak: Math.min(streak / 10, 1),
            experience: Math.min(playTime / 30, 1),
            overall: (accuracy * 0.6) + (Math.min(streak / 10, 1) * 0.3) + (Math.min(playTime / 30, 1) * 0.1)
        };
    }
    
    suggestNextTopics(fromNode, playerStrength) {
        const topicPool = this.getAvailableTopics();
        const playerWeaknesses = this.identifyWeaknesses();
        const suggestions = [];
        
        if (playerStrength.overall < 0.3) {
            suggestions.push(...this.generateEasierTopics(fromNode, playerWeaknesses));
        } else if (playerStrength.overall > 0.7) {
            suggestions.push(...this.generateHarderTopics(fromNode, playerStrength));
        } else {
            suggestions.push(...this.generateBalancedTopics(fromNode, playerStrength, playerWeaknesses));
        }
        
        return suggestions.slice(0, Math.min(3, 2 + Math.floor(playerStrength.overall * 3)));
    }
    
    getAvailableTopics() {
        return [
            { label: "Pienluvut", type: "addition", difficulty: 1, topics: ["1-10 yhteenlasku"] },
            { label: "Suuremmat luvut", type: "addition", difficulty: 2, topics: ["11-50 yhteenlasku"] },
            { label: "Vähennyslasku", type: "subtraction", difficulty: 2, topics: ["perusvähennys"] },
            { label: "Kertotaulu 2x", type: "multiplication", difficulty: 3, topics: ["2x kertotaulu"] },
            { label: "Kertotaulu 5x", type: "multiplication", difficulty: 3, topics: ["5x kertotaulu"] },
            { label: "Kertotaulu 10x", type: "multiplication", difficulty: 3, topics: ["10x kertotaulu"] },
            { label: "Kertotaulu 3x", type: "multiplication", difficulty: 4, topics: ["3x kertotaulu"] },
            { label: "Kertotaulu 4x", type: "multiplication", difficulty: 4, topics: ["4x kertotaulu"] },
            { label: "Jakolasku", type: "division", difficulty: 4, topics: ["perusjakolasku"] },
            { label: "Murto-osat", type: "fractions", difficulty: 5, topics: ["perusmurto-osat"] },
            { label: "Desimaalit", type: "decimals", difficulty: 5, topics: ["perusdesimaalit"] },
            { label: "Sekamuoto", type: "mixed", difficulty: 6, topics: ["sekalaisia"] }
        ];
    }
    
    generateEasierTopics(fromNode, weaknesses) {
        const easierTopics = this.getAvailableTopics().filter(t => t.difficulty <= 2);
        return this.selectReinforcingTopics(easierTopics, weaknesses, 2);
    }
    
    generateHarderTopics(fromNode, playerStrength) {
        const harderTopics = this.getAvailableTopics().filter(t => t.difficulty >= 4);
        return this.selectChallengingTopics(harderTopics, playerStrength, 2);
    }
    
    generateBalancedTopics(fromNode, playerStrength, weaknesses) {
        const allTopics = this.getAvailableTopics();
        const balanced = [];
        
        if (weaknesses.length > 0) {
            const reinforcing = this.selectReinforcingTopics(allTopics, weaknesses, 1);
            if (reinforcing.length > 0) {
                balanced.push(reinforcing[0]);
            }
        }
        
        const currentLevel = Math.floor(2 + playerStrength.overall * 4);
        const levelTopics = allTopics.filter(t => 
            t.difficulty === currentLevel || t.difficulty === currentLevel + 1
        ).slice(0, 2);
        
        balanced.push(...levelTopics);
        
        if (balanced.length === 0) {
            balanced.push(...allTopics.filter(t => t.difficulty <= 3).slice(0, 2));
        }
        
        return balanced;
    }
    
    identifyWeaknesses() {
        const weaknesses = [];
        for (const [topic, stats] of this.playerStats.topicStrengths) {
            if (stats.accuracy < 0.6) {
                weaknesses.push(topic);
            }
        }
        return weaknesses;
    }
    
    selectReinforcingTopics(topics, weaknesses, count) {
        const reinforcing = topics.filter(t => 
            weaknesses.some(w => t.topics.some(topic => topic.includes(w)))
        );
        return reinforcing.slice(0, count).length > 0 ? 
               reinforcing.slice(0, count) : 
               topics.filter(t => t.difficulty <= 3).slice(0, count);
    }
    
    selectChallengingTopics(topics, playerStrength, count) {
        return topics
            .filter(t => !this.playerStats.topicStrengths.has(t.type) || 
                        this.playerStats.topicStrengths.get(t.type).mastery < 0.8)
            .slice(0, count);
    }
    
    connectNodes(nodes) {
        nodes.forEach(node => {
            if (node.parentId !== undefined) {
                const parent = nodes.find(n => n.id === node.parentId);
                if (parent) {
                    if (!parent.connections) parent.connections = [];
                    parent.connections.push(node.id);
                    console.log(`Connected node ${node.id} (${node.label}) to parent ${parent.id} (${parent.label})`);
                }
            }
        });
    }
    
    createGravitySystem() {
        this.mindMapData.forEach(node => {
            const difficultyLevel = this.getNodeDifficultyLevel(node);
            const gravityStrength = difficultyLevel;
            
            const particleCount = Math.min(15, 5 + (difficultyLevel * 2));
            const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            
            for (let i = 0; i < particleCount; i++) {
                let particleMaterial;
                
                switch(difficultyLevel) {
                    case 1:
                        particleMaterial = new THREE.MeshBasicMaterial({ 
                            color: 0x90EE90, 
                            transparent: true, 
                            opacity: 0.6 
                        });
                        break;
                    case 2:
                        particleMaterial = new THREE.MeshBasicMaterial({ 
                            color: 0xFFD700, 
                            transparent: true, 
                            opacity: 0.7 
                        });
                        break;
                    case 3:
                        particleMaterial = new THREE.MeshBasicMaterial({ 
                            color: 0xFF6347, 
                            transparent: true, 
                            opacity: 0.8 
                        });
                        break;
                    case 4:
                        particleMaterial = new THREE.MeshBasicMaterial({ 
                            color: 0xFF1493, 
                            transparent: true, 
                            opacity: 0.9 
                        });
                        break;
                    default:
                        particleMaterial = new THREE.MeshBasicMaterial({ 
                            color: 0x8A2BE2, 
                            transparent: true, 
                            opacity: 1.0 
                        });
                }
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                
                const angle = (i / particleCount) * Math.PI * 2;
                const radius = 3 + Math.random() * 2;
                const height = (Math.random() - 0.5) * 2;
                
                particle.position.set(
                    node.x + Math.cos(angle) * radius,
                    node.y + height,
                    node.z + Math.sin(angle) * radius
                );
                
                particle.userData = {
                    originalAngle: angle,
                    radius: radius,
                    baseHeight: height,
                    speed: 0.01 + (difficultyLevel * 0.005),
                    nodeId: node.id,
                    centerX: node.x,
                    centerY: node.y,
                    centerZ: node.z,
                    gravityStrength: gravityStrength
                };
                
                this.floatingParticles.push(particle);
                this.scene.add(particle);
            }
            
            const gravityFieldGeometry = new THREE.SphereGeometry(4, 16, 16);
            const gravityFieldMaterial = new THREE.MeshBasicMaterial({
                color: this.getDifficultyColor(difficultyLevel),
                transparent: true,
                opacity: 0.1,
                wireframe: true
            });
            
            const gravityField = new THREE.Mesh(gravityFieldGeometry, gravityFieldMaterial);
            gravityField.position.set(node.x, node.y, node.z);
            gravityField.userData = {
                nodeId: node.id,
                difficulty: difficultyLevel
            };
            
            this.gravityFields.push(gravityField);
            this.scene.add(gravityField);
        });
    }
    
    getNodeDifficultyLevel(nodeOrLabel) {
        // Jos parametri on node-objekti, käytä sen difficulty-propertyä tai labeliä
        const label = typeof nodeOrLabel === 'string' ? nodeOrLabel : nodeOrLabel.label;
        const nodeDifficulty = typeof nodeOrLabel === 'object' ? nodeOrLabel.difficulty : null;
        
        // Jos nodella on suoraan difficulty-property, käytä sitä
        if (nodeDifficulty !== null && nodeDifficulty !== undefined) {
            return nodeDifficulty;
        }
        
        // Muuten käytä labeliin perustuvaa logiikkaa
        switch(label) {
            case "Aloitus":
                return 1;
            case "Yhteenlasku":
            case "Vähennyslasku":
            case "Pienluvut":
            case "Suuremmat luvut":
                return 2;
            case "Perus+":
            case "Perus-":
                return 3;
            case "Isommat+":
            case "Isommat-":
            case "Kertotaulu 2x":
            case "Kertotaulu 5x":
            case "Kertotaulu 10x":
                return 4;
            case "Kertotaulu":
            case "Kertotaulu 3x":
            case "Kertotaulu 4x":
            case "Jakolasku":
                return 4;
            case "Murto-osat":
            case "Desimaalit":
                return 5;
            case "Matemestari":
            case "Laskutaitaja":
            case "Sekamuoto":
                return 6;
            default:
                return 2; // Oletuksena keskitaso
        }
    }
    
    getDifficultyColor(level) {
        switch(level) {
            case 1: return 0x90EE90;
            case 2: return 0xFFD700;
            case 3: return 0xFF6347;
            case 4: return 0xFF1493;
            case 5: return 0x8A2BE2;
            case 6: return 0xFF0000;
            default: return 0xFFFFFF;
        }
    }
    
    createIntelligentDust() {
        this.mindMapData.forEach(node => {
            const difficultyLevel = this.getNodeDifficultyLevel(node);
            if (difficultyLevel >= 1) {
                const dustCount = Math.min(this.maxDustPerPlanet, 5 + Math.random() * 3);
                
                for (let i = 0; i < dustCount; i++) {
                    const dustGeometry = new THREE.SphereGeometry(0.03, 6, 6);
                    const dustMaterial = new THREE.MeshBasicMaterial({
                        color: 0x00FFFF,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    const dust = new THREE.Mesh(dustGeometry, dustMaterial);
                    
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 6 + Math.random() * 3;
                    const height = (Math.random() - 0.5) * 4;
                    
                    dust.position.set(
                        node.x + Math.cos(angle) * radius,
                        node.y + height,
                        node.z + Math.sin(angle) * radius
                    );
                    
                    dust.userData = {
                        intelligence: Math.random() * 0.5 + 0.3,
                        speed: 0.02 + Math.random() * 0.03,
                        targetX: dust.position.x,
                        targetY: dust.position.y,
                        targetZ: dust.position.z,
                        homeNode: node.id,
                        homeX: node.x,
                        homeY: node.y,
                        homeZ: node.z,
                        fleeRadius: 8,
                        eaten: false,
                        pulsePhase: Math.random() * Math.PI * 2
                    };
                    
                    this.intelligentDust.push(dust);
                    this.scene.add(dust);
                }
            }
        });
    }
    
    createSpacePirate() {
        const pirateGroup = new THREE.Group();
        
        const shipGeometry = new THREE.ConeGeometry(0.5, 2, 6);
        const shipMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B0000,
            emissive: 0x330000
        });
        
        const ship = new THREE.Mesh(shipGeometry, shipMaterial);
        ship.rotation.x = Math.PI / 2;
        
        const engineGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.5, 6);
        const engineMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF4500,
            emissive: 0x662200
        });
        
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.z = -1.2;
        engine.rotation.x = Math.PI / 2;
        
        const flagGeometry = new THREE.PlaneGeometry(0.4, 0.3);
        const flagMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(0, 0.5, -0.5);
        
        pirateGroup.add(ship);
        pirateGroup.add(engine);
        pirateGroup.add(flag);
        
        const spawnRadius = 30;
        const angle = Math.random() * Math.PI * 2;
        pirateGroup.position.set(
            Math.cos(angle) * spawnRadius,
            (Math.random() - 0.5) * 20,
            Math.sin(angle) * spawnRadius
        );
        
        pirateGroup.userData = {
            speed: 0.05 + Math.random() * 0.03,
            huntingRadius: 12,
            dustConsumed: 0,
            maxDustCapacity: 5 + Math.floor(Math.random() * 5),
            state: 'hunting',
            targetDust: null,
            homePosition: pirateGroup.position.clone(),
            aggressiveness: Math.random() * 0.5 + 0.3,
            lastDirectionChange: Date.now()
        };
        
        this.spacePirates.push(pirateGroup);
        this.scene.add(pirateGroup);
        
        return pirateGroup;
    }
    
    updateSpacePirates() {
        this.spacePirates.forEach(pirate => {
            const userData = pirate.userData;
            
            if (userData.state === 'hunting') {
                if (!userData.targetDust || userData.targetDust.userData.eaten) {
                    const nearbyDust = this.findNearestDust(pirate.position, userData.huntingRadius);
                    userData.targetDust = nearbyDust;
                }
                
                if (userData.targetDust) {
                    this.movePirateTowards(pirate, userData.targetDust.position);
                    
                    const distance = pirate.position.distanceTo(userData.targetDust.position);
                    if (distance < 0.5) {
                        this.consumeDust(pirate, userData.targetDust);
                    }
                } else {
                    this.movePirateRandomly(pirate);
                }
            } else if (userData.state === 'fleeing') {
                this.movePirateAway(pirate);
                
                if (Date.now() - userData.fleeStartTime > 3000) {
                    userData.state = 'hunting';
                }
            }
            
            pirate.rotation.y += 0.02;
            pirate.children[1].material.emissive.setHSL(
                0.1, 
                1, 
                0.3 + Math.sin(Date.now() * 0.01) * 0.2
            );
        });
    }
    
    findNearestDust(position, radius) {
        let nearest = null;
        let nearestDistance = radius;
        
        this.intelligentDust.forEach(dust => {
            if (!dust.userData.eaten) {
                const distance = position.distanceTo(dust.position);
                if (distance < nearestDistance) {
                    nearest = dust;
                    nearestDistance = distance;
                }
            }
        });
        
        return nearest;
    }
    
    movePirateTowards(pirate, targetPosition) {
        const direction = new THREE.Vector3();
        direction.subVectors(targetPosition, pirate.position);
        direction.normalize();
        direction.multiplyScalar(pirate.userData.speed);
        
        pirate.position.add(direction);
        
        pirate.lookAt(targetPosition);
    }
    
    movePirateRandomly(pirate) {
        if (Date.now() - pirate.userData.lastDirectionChange > 2000) {
            pirate.userData.randomDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize();
            pirate.userData.lastDirectionChange = Date.now();
        }
        
        if (pirate.userData.randomDirection) {
            const movement = pirate.userData.randomDirection.clone();
            movement.multiplyScalar(pirate.userData.speed * 0.5);
            pirate.position.add(movement);
        }
    }
    
    movePirateAway(pirate) {
        const awayDirection = new THREE.Vector3(
            pirate.position.x,
            pirate.position.y,
            pirate.position.z
        ).normalize();
        
        awayDirection.multiplyScalar(pirate.userData.speed * 1.5);
        pirate.position.add(awayDirection);
    }
    
    consumeDust(pirate, dust) {
        dust.userData.eaten = true;
        this.scene.remove(dust);
        
        const dustIndex = this.intelligentDust.indexOf(dust);
        if (dustIndex > -1) {
            this.intelligentDust.splice(dustIndex, 1);
        }
        
        pirate.userData.dustConsumed++;
        
        this.createConsumptionEffect(dust.position);
        
        if (pirate.userData.dustConsumed >= pirate.userData.maxDustCapacity) {
            pirate.userData.state = 'fleeing';
            pirate.userData.fleeStartTime = Date.now();
        }
    }
    
    createConsumptionEffect(position) {
        const effectGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const effectMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
            transparent: true,
            opacity: 0.8
        });
        
        const effect = new THREE.Mesh(effectGeometry, effectMaterial);
        effect.position.copy(position);
        this.scene.add(effect);
        
        const tween = new TWEEN.Tween(effect.scale)
            .to({ x: 3, y: 3, z: 3 }, 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(() => {
                this.scene.remove(effect);
            });
            
        const opacityTween = new TWEEN.Tween(effect.material)
            .to({ opacity: 0 }, 500)
            .easing(TWEEN.Easing.Cubic.Out);
        
        tween.start();
        opacityTween.start();
    }
    
    updateIntelligentDust() {
        this.intelligentDust.forEach(dust => {
            if (!dust.userData.eaten) {
                const nearestPirate = this.findNearestPirate(dust.position);
                
                if (nearestPirate && dust.position.distanceTo(nearestPirate.position) < dust.userData.fleeRadius) {
                    const fleeDirection = new THREE.Vector3();
                    fleeDirection.subVectors(dust.position, nearestPirate.position);
                    fleeDirection.normalize();
                    fleeDirection.multiplyScalar(dust.userData.speed * dust.userData.intelligence);
                    
                    dust.position.add(fleeDirection);
                } else {
                    const homeDistance = dust.position.distanceTo(
                        new THREE.Vector3(dust.userData.homeX, dust.userData.homeY, dust.userData.homeZ)
                    );
                    
                    if (homeDistance > 10) {
                        const homeDirection = new THREE.Vector3();
                        homeDirection.subVectors(
                            new THREE.Vector3(dust.userData.homeX, dust.userData.homeY, dust.userData.homeZ),
                            dust.position
                        );
                        homeDirection.normalize();
                        homeDirection.multiplyScalar(dust.userData.speed * 0.3);
                        dust.position.add(homeDirection);
                    } else {
                        dust.userData.pulsePhase += 0.1;
                        dust.position.x += Math.sin(dust.userData.pulsePhase) * 0.02;
                        dust.position.y += Math.cos(dust.userData.pulsePhase * 1.3) * 0.02;
                        dust.position.z += Math.sin(dust.userData.pulsePhase * 0.7) * 0.02;
                    }
                }
                
                dust.material.opacity = 0.6 + Math.sin(Date.now() * 0.01 + dust.userData.pulsePhase) * 0.3;
                dust.rotation.x += 0.05;
                dust.rotation.y += 0.03;
            }
        });
    }
    
    findNearestPirate(position) {
        let nearest = null;
        let nearestDistance = Infinity;
        
        this.spacePirates.forEach(pirate => {
            const distance = position.distanceTo(pirate.position);
            if (distance < nearestDistance) {
                nearest = pirate;
                nearestDistance = distance;
            }
        });
        
        return nearest;
    }
    
    spawnPiratesOverTime() {
        this.pirateSpawnTimer++;
        
        if (this.pirateSpawnTimer > 600 && this.spacePirates.length < this.maxPirates) {
            this.createSpacePirate();
            this.pirateSpawnTimer = 0;
        }
        
        this.cleanupDistantPirates();
    }
    
    cleanupDistantPirates() {
        this.spacePirates = this.spacePirates.filter(pirate => {
            const distanceFromCenter = pirate.position.length();
            if (distanceFromCenter > 100) {
                this.scene.remove(pirate);
                return false;
            }
            return true;
        });
    }
    
    checkPiratePlayerInteractions() {
        // Don't check interactions until game is fully initialized
        if (!this.gameInitialized) return;
        
        const currentStarData = this.stars.find(s => s.node.id === this.currentNode);
        if (!currentStarData) return;
        
        this.spacePirates.forEach(pirate => {
            const distanceToPlayer = pirate.position.distanceTo(currentStarData.star.position);
            
            if (distanceToPlayer < 3) {
                this.triggerPirateEncounter(pirate);
            }
        });
        
        const dustAtCurrentPlanet = this.intelligentDust.filter(dust => 
            !dust.userData.eaten && dust.userData.homeNode === this.currentNode
        );
        
        if (dustAtCurrentPlanet.length < 5 && !this.dustWarningShown) {
            this.score = Math.max(0, this.score - 5);
            this.scoreElement.textContent = this.score;
            
            if (dustAtCurrentPlanet.length === 0) {
                this.feedbackElement.textContent = "⚠️ Kaikki älypöly on syöty! Lisävaikeus aktivoitu!";
                this.feedbackElement.className = "feedback-wrong";
                this.dustWarningShown = true;
                
                setTimeout(() => {
                    this.feedbackElement.textContent = "";
                    this.feedbackElement.className = "";
                    this.dustWarningShown = false;
                }, 3000);
            }
        }
    }
    
    triggerPirateEncounter(pirate) {
        if (!pirate.userData.encounterTriggered) {
            pirate.userData.encounterTriggered = true;
            pirate.userData.state = 'aggressive';
            
            this.feedbackElement.textContent = "🏴‍☠️ Avaruusmerirosvot lähestyvät!";
            this.feedbackElement.className = "feedback-wrong";
            
            pirate.children[0].material.color.setHex(0xFF0000);
            pirate.children[0].material.emissive.setHex(0x660000);
            
            setTimeout(() => {
                this.feedbackElement.textContent = "";
                this.feedbackElement.className = "";
                pirate.userData.encounterTriggered = false;
                pirate.userData.state = 'hunting';
                pirate.children[0].material.color.setHex(0x8B0000);
                pirate.children[0].material.emissive.setHex(0x330000);
            }, 3000);
        }
    }
    
    create3DMindMap() {
        this.mindMapData.forEach(node => {
            node.connections.forEach(connectionId => {
                const targetNode = this.mindMapData.find(n => n.id === connectionId);
                if (targetNode) {
                    const points = [];
                    points.push(new THREE.Vector3(node.x, node.y, node.z));
                    points.push(new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z));
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: 0x444444,
                        transparent: true,
                        opacity: 0.6
                    });
                    
                    const line = new THREE.Line(geometry, material);
                    line.userData = { type: 'connection', from: node.id, to: connectionId };
                    this.connections.push(line);
                    this.scene.add(line);
                }
            });
        });
        
        this.mindMapData.forEach(node => {
            const starGroup = new THREE.Group();
            
            const starGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            let starMaterial;
            
            if (this.visitedNodes.has(node.id)) {
                starMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffd700,
                    emissive: 0x332200,
                    shininess: 100
                });
            } else if (node.id === this.currentNode) {
                starMaterial = new THREE.MeshPhongMaterial({
                    color: 0x00ff88,
                    emissive: 0x003322,
                    shininess: 100
                });
            } else {
                starMaterial = new THREE.MeshPhongMaterial({
                    color: 0x666666,
                    emissive: 0x111111,
                    shininess: 50
                });
            }
            
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(node.x, node.y, node.z);
            star.userData = { type: 'star', nodeId: node.id, node: node };
            
            const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: node.id === this.currentNode ? 0x00ff88 : 0xffffff,
                transparent: true,
                opacity: node.id === this.currentNode ? 0.3 : 0.1
            });
            
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(node.x, node.y, node.z);
            
            starGroup.add(star);
            starGroup.add(glow);
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            
            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'white';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText(node.label, canvas.width / 2, canvas.height / 2 + 7);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const label = new THREE.Sprite(labelMaterial);
            label.position.set(node.x, node.y - 2, node.z);
            label.scale.set(4, 1, 1);
            
            starGroup.add(label);
            
            this.stars.push({ group: starGroup, star: star, glow: glow, node: node });
            this.scene.add(starGroup);
        });
    }
    
    generateNewProblem() {
        const currentNodeData = this.mindMapData.find(n => n.id === this.currentNode);
        let problem;
        
        const adaptedDifficulty = this.calculateAdaptedDifficulty(currentNodeData);
        
        switch(currentNodeData.type || currentNodeData.label) {
            case "start":
            case "Aloitus":
                problem = this.generateAddition(1);
                break;
            case "addition":
            case "Yhteenlasku":
            case "Perus+":
            case "Pienluvut":
            case "Suuremmat luvut":
                problem = this.generateAddition(adaptedDifficulty);
                break;
            case "subtraction":
            case "Vähennyslasku":
            case "Perus-":
                problem = this.generateSubtraction(adaptedDifficulty);
                break;
            case "multiplication":
                problem = this.generateAdaptedMultiplication(currentNodeData, adaptedDifficulty);
                break;
            case "division":
            case "Jakolasku":
                problem = this.generateDivision(adaptedDifficulty);
                break;
            case "fractions":
            case "Murto-osat":
                problem = this.generateFractions(adaptedDifficulty);
                break;
            case "decimals":
            case "Desimaalit":
                problem = this.generateDecimals(adaptedDifficulty);
                break;
            case "mixed":
                problem = this.generateMixedProblem(adaptedDifficulty);
                break;
            default:
                problem = this.generateAddition(adaptedDifficulty);
        }
        
        this.currentProblem = problem;
        this.currentProblem.topic = currentNodeData.type || 'general';
        this.problemElement.textContent = problem.question;
        this.answerInput.value = '';
        this.answerInput.focus();
    }
    
    calculateAdaptedDifficulty(nodeData) {
        const baseDifficulty = nodeData.difficulty || this.level;
        const playerStrength = this.calculatePlayerStrength();
        
        let adaptedDifficulty = baseDifficulty;
        
        if (playerStrength.accuracy < 0.5) {
            adaptedDifficulty = Math.max(1, baseDifficulty - 1);
        } else if (playerStrength.accuracy > 0.8 && playerStrength.streak > 5) {
            adaptedDifficulty = baseDifficulty + 1;
        }
        
        return Math.max(1, Math.min(10, adaptedDifficulty));
    }
    
    generateAdaptedMultiplication(nodeData, difficulty) {
        if (nodeData.label.includes('2x')) {
            return this.generateSpecificMultiplication(2, difficulty);
        } else if (nodeData.label.includes('3x')) {
            return this.generateSpecificMultiplication(3, difficulty);
        } else if (nodeData.label.includes('4x')) {
            return this.generateSpecificMultiplication(4, difficulty);
        } else if (nodeData.label.includes('5x')) {
            return this.generateSpecificMultiplication(5, difficulty);
        } else if (nodeData.label.includes('10x')) {
            return this.generateSpecificMultiplication(10, difficulty);
        } else {
            return this.generateMultiplication(difficulty);
        }
    }
    
    generateSpecificMultiplication(table, difficulty) {
        const maxMultiplier = Math.min(5 + difficulty, 12);
        const multiplier = Math.floor(Math.random() * maxMultiplier) + 1;
        return {
            question: `${table} × ${multiplier} = ?`,
            answer: table * multiplier
        };
    }
    
    generateMixedProblem(difficulty) {
        const problemTypes = ['addition', 'subtraction', 'multiplication'];
        const randomType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        switch(randomType) {
            case 'addition':
                return this.generateAddition(difficulty);
            case 'subtraction':
                return this.generateSubtraction(difficulty);
            case 'multiplication':
                return this.generateMultiplication(difficulty);
            default:
                return this.generateAddition(difficulty);
        }
    }
    
    generateAddition(difficulty) {
        const max = Math.min(10 + difficulty * 10, 100);
        const a = Math.floor(Math.random() * max) + 1;
        const b = Math.floor(Math.random() * max) + 1;
        return {
            question: `${a} + ${b} = ?`,
            answer: a + b
        };
    }
    
    generateSubtraction(difficulty) {
        const max = Math.min(10 + difficulty * 10, 100);
        const a = Math.floor(Math.random() * max) + 1;
        const b = Math.floor(Math.random() * a) + 1;
        return {
            question: `${a} - ${b} = ?`,
            answer: a - b
        };
    }
    
    generateMultiplication(difficulty) {
        const max = Math.min(5 + difficulty, 10);
        const a = Math.floor(Math.random() * max) + 1;
        const b = Math.floor(Math.random() * max) + 1;
        return {
            question: `${a} × ${b} = ?`,
            answer: a * b
        };
    }
    
    generateDivision(difficulty) {
        const max = Math.min(5 + difficulty, 10);
        const b = Math.floor(Math.random() * max) + 1;
        const answer = Math.floor(Math.random() * max) + 1;
        const a = b * answer;
        return {
            question: `${a} ÷ ${b} = ?`,
            answer: answer
        };
    }
    
    generateFractions(difficulty) {
        const denominator = Math.floor(Math.random() * 8) + 2;
        const numerator1 = Math.floor(Math.random() * denominator) + 1;
        const numerator2 = Math.floor(Math.random() * (denominator - numerator1)) + 1;
        return {
            question: `${numerator1}/${denominator} + ${numerator2}/${denominator} = ? (anna vastaus murto-osana, esim. 3/4)`,
            answer: `${numerator1 + numerator2}/${denominator}`
        };
    }
    
    generateDecimals(difficulty) {
        const a = (Math.random() * 10).toFixed(1);
        const b = (Math.random() * 10).toFixed(1);
        const result = (parseFloat(a) + parseFloat(b)).toFixed(1);
        return {
            question: `${a} + ${b} = ?`,
            answer: parseFloat(result)
        };
    }
    
    checkAnswer() {
        const userAnswer = this.answerInput.value.trim();
        const correct = this.isAnswerCorrect(userAnswer, this.currentProblem.answer);
        
        if (correct) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }
    
    isAnswerCorrect(userAnswer, correctAnswer) {
        if (typeof correctAnswer === 'string') {
            return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        }
        return parseFloat(userAnswer) === correctAnswer;
    }
    
    handleCorrectAnswer() {
        this.updatePlayerStats(true);
        
        const baseScore = 10 * this.level;
        const dustAtCurrentPlanet = this.intelligentDust.filter(dust => 
            !dust.userData.eaten && dust.userData.homeNode === this.currentNode
        ).length;
        
        const dustBonus = Math.floor(dustAtCurrentPlanet / 5) * 5;
        const totalScore = baseScore + dustBonus;
        
        this.score += totalScore;
        this.scoreElement.textContent = this.score;
        
        let message = "Oikein! 🎉 Loistavaa!";
        if (dustBonus > 0) {
            message += ` +${dustBonus} älypölybonusta!`;
        }
        
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = "feedback-correct";
        
        this.scareAwayPirates();
        this.animateStarSuccess();
        this.moveToNextNode();
        
        setTimeout(() => {
            this.feedbackElement.textContent = "";
            this.feedbackElement.className = "";
            this.generateNewProblem();
        }, 1500);
    }
    
    updatePlayerStats(correct) {
        if (correct) {
            this.playerStats.correctAnswers++;
            this.playerStats.streakCount++;
        } else {
            this.playerStats.wrongAnswers++;
            this.playerStats.streakCount = 0;
        }
        
        const topic = this.currentProblem.topic;
        if (!this.playerStats.topicStrengths.has(topic)) {
            this.playerStats.topicStrengths.set(topic, {
                correct: 0,
                total: 0,
                accuracy: 0,
                mastery: 0
            });
        }
        
        const topicStats = this.playerStats.topicStrengths.get(topic);
        if (correct) topicStats.correct++;
        topicStats.total++;
        topicStats.accuracy = topicStats.correct / topicStats.total;
        topicStats.mastery = Math.min(1, topicStats.accuracy * (topicStats.total / 10));
        
        this.playerStats.totalPlayTime = (Date.now() - this.gameStartTime) / 60000;
        
        const overallAccuracy = this.playerStats.correctAnswers / 
                               (this.playerStats.correctAnswers + this.playerStats.wrongAnswers);
        
        if (overallAccuracy > 0.8 && this.playerStats.streakCount > 3) {
            this.playerStats.difficultyPreference = 'hard';
        } else if (overallAccuracy < 0.5) {
            this.playerStats.difficultyPreference = 'easy';
        } else {
            this.playerStats.difficultyPreference = 'medium';
        }
        
        this.playerStats.skillLevel = Math.floor(1 + (overallAccuracy * 5) + (this.playerStats.totalPlayTime / 10));
    }
    
    scareAwayPirates() {
        const currentStarData = this.stars.find(s => s.node.id === this.currentNode);
        if (!currentStarData) return;
        
        this.spacePirates.forEach(pirate => {
            const distanceToPlayer = pirate.position.distanceTo(currentStarData.star.position);
            
            if (distanceToPlayer < 10) {
                pirate.userData.state = 'fleeing';
                pirate.userData.fleeStartTime = Date.now();
                
                pirate.children[0].material.color.setHex(0x444444);
                pirate.children[0].material.emissive.setHex(0x222222);
                
                setTimeout(() => {
                    pirate.children[0].material.color.setHex(0x8B0000);
                    pirate.children[0].material.emissive.setHex(0x330000);
                }, 2000);
            }
        });
    }
    
    handleWrongAnswer() {
        this.updatePlayerStats(false);
        
        this.feedbackElement.textContent = "Väärin. Yritä uudelleen! 🤔";
        this.feedbackElement.className = "feedback-wrong";
        
        this.animateStarError();
        
        setTimeout(() => {
            this.feedbackElement.textContent = "";
            this.feedbackElement.className = "";
        }, 1500);
    }
    
    animateStarSuccess() {
        const currentStar = this.stars.find(s => s.node.id === this.currentNode);
        if (currentStar) {
            const originalScale = currentStar.star.scale.clone();
            const tween = new TWEEN.Tween(currentStar.star.scale)
                .to({ x: 1.5, y: 1.5, z: 1.5 }, 300)
                .easing(TWEEN.Easing.Elastic.Out)
                .yoyo(true)
                .repeat(1)
                .onComplete(() => {
                    currentStar.star.scale.copy(originalScale);
                });
            tween.start();
        }
    }
    
    animateStarError() {
        const currentStar = this.stars.find(s => s.node.id === this.currentNode);
        if (currentStar) {
            const originalRotation = currentStar.star.rotation.z;
            const tween = new TWEEN.Tween(currentStar.star.rotation)
                .to({ z: originalRotation + Math.PI * 0.1 }, 100)
                .yoyo(true)
                .repeat(3)
                .onComplete(() => {
                    currentStar.star.rotation.z = originalRotation;
                });
            tween.start();
        }
    }
    
    moveToNextNode() {
        const currentNodeData = this.mindMapData.find(n => n.id === this.currentNode);
        const availableConnections = currentNodeData.connections ? 
            currentNodeData.connections.filter(id => !this.visitedNodes.has(id)) : [];
        
        console.log('Moving to next node:', {
            currentNode: this.currentNode,
            currentNodeData: currentNodeData,
            availableConnections,
            visitedNodes: Array.from(this.visitedNodes),
            allNodes: this.mindMapData.map(n => ({id: n.id, label: n.label, connections: n.connections}))
        });
        
        if (availableConnections.length > 0) {
            const nextNode = availableConnections[Math.floor(Math.random() * availableConnections.length)];
            this.currentNode = nextNode;
            this.visitedNodes.add(nextNode);
            
            if (this.visitedNodes.size % 3 === 0) {
                this.level++;
                this.levelElement.textContent = this.level;
            }
            
            console.log('Moved to node:', nextNode);
            this.updateStarMaterials();
            this.animateCameraToCurrentStar();
            this.updateConnections();
        } else {
            console.log('No available connections, expanding universe');
            this.expandUniverse();
        }
    }
    
    expandUniverse() {
        console.log('Expanding universe from current data:', this.mindMapData.length, 'planets');
        const newPlanets = this.generateNextPlanets(this.mindMapData);
        
        console.log('After generation:', newPlanets.length, 'planets total');
        
        if (newPlanets.length > this.mindMapData.length) {
            this.mindMapData = newPlanets;
            this.regenerate3DMindMap();
            
            const currentNodeData = this.mindMapData.find(n => n.id === this.currentNode);
            const availableConnections = currentNodeData.connections ? 
                currentNodeData.connections.filter(id => !this.visitedNodes.has(id)) : [];
                
            console.log('After regeneration - available connections:', availableConnections);
            
            if (availableConnections.length > 0) {
                const nextNode = availableConnections[Math.floor(Math.random() * availableConnections.length)];
                this.currentNode = nextNode;
                this.visitedNodes.add(nextNode);
                
                this.feedbackElement.textContent = "🌌 Uusia planeettoja löydetty! Seikkailu jatkuu!";
                this.feedbackElement.className = "feedback-correct";
                
                setTimeout(() => {
                    this.feedbackElement.textContent = "";
                    this.feedbackElement.className = "";
                }, 2500);
                
                this.updateStarMaterials();
                this.animateCameraToCurrentStar();
                this.updateConnections();
            } else {
                this.feedbackElement.textContent = "🏆 Onnittelut! Olet saavuttanut galaksin lopun!";
                this.feedbackElement.className = "feedback-correct";
            }
        } else {
            this.feedbackElement.textContent = "🏆 Onnittelut! Olet saavuttanut tämän polun lopun!";
            this.feedbackElement.className = "feedback-correct";
        }
    }
    
    regenerate3DMindMap() {
        this.stars.forEach(starObj => {
            this.scene.remove(starObj.group);
        });
        this.connections.forEach(connection => {
            this.scene.remove(connection);
        });
        this.gravityFields.forEach(field => {
            this.scene.remove(field);
        });
        this.floatingParticles.forEach(particle => {
            this.scene.remove(particle);
        });
        this.intelligentDust.forEach(dust => {
            this.scene.remove(dust);
        });
        
        this.stars = [];
        this.connections = [];
        this.gravityFields = [];
        this.floatingParticles = [];
        this.intelligentDust = [];
        
        this.create3DMindMap();
        this.createGravitySystem();
        this.createIntelligentDust();
    }
    
    updateStarMaterials() {
        this.stars.forEach(starObj => {
            let material;
            if (this.visitedNodes.has(starObj.node.id)) {
                material = new THREE.MeshPhongMaterial({
                    color: 0xffd700,
                    emissive: 0x332200,
                    shininess: 100
                });
            } else if (starObj.node.id === this.currentNode) {
                material = new THREE.MeshPhongMaterial({
                    color: 0x00ff88,
                    emissive: 0x003322,
                    shininess: 100
                });
                starObj.glow.material.color.setHex(0x00ff88);
                starObj.glow.material.opacity = 0.3;
            } else {
                material = new THREE.MeshPhongMaterial({
                    color: 0x666666,
                    emissive: 0x111111,
                    shininess: 50
                });
                starObj.glow.material.color.setHex(0xffffff);
                starObj.glow.material.opacity = 0.1;
            }
            starObj.star.material = material;
        });
    }
    
    updateConnections() {
        this.connections.forEach(connection => {
            const fromVisited = this.visitedNodes.has(connection.userData.from);
            const toVisited = this.visitedNodes.has(connection.userData.to);
            
            if (fromVisited && toVisited) {
                connection.material.color.setHex(0x00ff88);
                connection.material.opacity = 0.8;
            } else if (fromVisited || toVisited) {
                connection.material.color.setHex(0x888888);
                connection.material.opacity = 0.6;
            }
        });
    }
    
    animateCameraToCurrentStar() {
        const currentStar = this.stars.find(s => s.node.id === this.currentNode);
        if (currentStar) {
            const targetPosition = new THREE.Vector3(
                currentStar.node.x + 5,
                currentStar.node.y + 3,
                currentStar.node.z + 8
            );
            
            new TWEEN.Tween(this.camera.position)
                .to(targetPosition, 1500)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(() => {
                    this.controls.update();
                })
                .start();
        }
    }
    
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.frameCount++;
        
        this.controls.update();
        
        this.stars.forEach((starObj, index) => {
            if (starObj.node.id === this.currentNode) {
                starObj.glow.rotation.z += 0.01;
                starObj.star.rotation.y += 0.005;
            }
            starObj.star.rotation.x += 0.002 + index * 0.0001;
        });
        
        if (this.frameCount % 2 === 0) {
            this.floatingParticles.forEach(particle => {
                particle.userData.originalAngle += particle.userData.speed;
                
                const orbitRadius = particle.userData.radius + Math.sin(Date.now() * 0.001 + particle.userData.originalAngle) * 0.3;
                const verticalOffset = Math.sin(Date.now() * 0.002 + particle.userData.originalAngle) * 0.2;
                
                particle.position.x = particle.userData.centerX + Math.cos(particle.userData.originalAngle) * orbitRadius;
                particle.position.z = particle.userData.centerZ + Math.sin(particle.userData.originalAngle) * orbitRadius;
                particle.position.y = particle.userData.centerY + particle.userData.baseHeight + verticalOffset;
                
                particle.rotation.x += 0.01;
                particle.rotation.y += 0.02;
            });
        }
        
        if (this.frameCount % 3 === 0) {
            this.gravityFields.forEach(field => {
                field.rotation.y += 0.003;
                field.rotation.z += 0.001;
            });
        }
        
        if (this.frameCount % 4 === 0) {
            if (this.spacePirates.length > 0) {
                this.updateSpacePirates();
            }
            if (this.intelligentDust.length > 0) {
                this.updateIntelligentDust();
            }
        }
        
        if (this.frameCount % 60 === 0) {
            this.spawnPiratesOverTime();
            this.checkPiratePlayerInteractions();
            this.optimizePerformance();
        }
        
        if (typeof TWEEN !== 'undefined') {
            TWEEN.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    optimizePerformance() {
        if (this.intelligentDust.length > 50) {
            const excessDust = this.intelligentDust.splice(50);
            excessDust.forEach(dust => {
                if (dust.parent) {
                    this.scene.remove(dust);
                }
            });
        }
        
        this.intelligentDust = this.intelligentDust.filter(dust => 
            !dust.userData.eaten && dust.parent
        );
        
        if (this.floatingParticles.length > 100) {
            const excessParticles = this.floatingParticles.splice(100);
            excessParticles.forEach(particle => {
                if (particle.parent) {
                    this.scene.remove(particle);
                }
            });
        }
        
        const now = Date.now();
        if (now - this.lastPerformanceCheck > 5000) {
            console.log(`Performance: ${this.intelligentDust.length} dust, ${this.spacePirates.length} pirates, ${this.floatingParticles.length} particles`);
            this.lastPerformanceCheck = now;
        }
    }
    
    bindEvents() {
        this.submitButton.addEventListener('click', () => this.checkAnswer());
        
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        this.answerInput.addEventListener('input', () => {
            this.feedbackElement.textContent = "";
            this.feedbackElement.className = "";
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MathSpace3DGame();
});
/**
 * Category Theory Module for herta.js
 * Provides tools for working with categories, functors, and natural transformations
 */

/**
 * Creates a new category object
 * @param {Array} objects - Array of objects in the category
 * @param {Object} morphisms - Map of morphisms between objects
 * @returns {Object} - Category object with methods
 */
function createCategory(objects, morphisms) {
    // Validate that morphisms include identity for each object
    for (const obj of objects) {
        if (!morphisms[`${obj}->${obj}`]) {
            morphisms[`${obj}->${obj}`] = {
                domain: obj,
                codomain: obj,
                compose: f => f, // Identity morphism
                id: true
            };
        }
    }
    
    // Create the category object
    const category = {
        objects,
        morphisms,
        
        /**
         * Get all morphisms from one object to another
         * @param {*} domain - Source object
         * @param {*} codomain - Target object
         * @returns {Array} - Array of morphisms
         */
        hom: function(domain, codomain) {
            const result = [];
            for (const key in this.morphisms) {
                const morphism = this.morphisms[key];
                if (morphism.domain === domain && morphism.codomain === codomain) {
                    result.push(morphism);
                }
            }
            return result;
        },
        
        /**
         * Get the identity morphism for an object
         * @param {*} obj - Object
         * @returns {Object} - Identity morphism
         */
        identity: function(obj) {
            return this.morphisms[`${obj}->${obj}`];
        },
        
        /**
         * Compose two morphisms if possible
         * @param {Object} f - First morphism
         * @param {Object} g - Second morphism
         * @returns {Object|null} - Composed morphism or null if not composable
         */
        compose: function(f, g) {
            if (f.codomain !== g.domain) {
                return null; // Not composable
            }
            
            // Check if composition already exists
            const key = `${g.domain}->${f.codomain}`;
            if (this.morphisms[key]) {
                return this.morphisms[key];
            }
            
            // Create new morphism
            return {
                domain: g.domain,
                codomain: f.codomain,
                compose: h => f.compose(g.compose(h))
            };
        },
        
        /**
         * Check if the category is a monoid
         * @returns {boolean} - True if category is a monoid
         */
        isMonoid: function() {
            return this.objects.length === 1;
        },
        
        /**
         * Check if the category is a groupoid
         * @returns {boolean} - True if category is a groupoid
         */
        isGroupoid: function() {
            // Check if every morphism has an inverse
            for (const key in this.morphisms) {
                const f = this.morphisms[key];
                if (f.id) continue; // Skip identity morphisms
                
                let hasInverse = false;
                const inverseKey = `${f.codomain}->${f.domain}`;
                if (this.morphisms[inverseKey]) {
                    const g = this.morphisms[inverseKey];
                    // Check if f ∘ g = id and g ∘ f = id
                    const fg = this.compose(f, g);
                    const gf = this.compose(g, f);
                    if (fg && gf && fg.id && gf.id) {
                        hasInverse = true;
                    }
                }
                
                if (!hasInverse) return false;
            }
            return true;
        },
        
        /**
         * Get the opposite category (dual category)
         * @returns {Object} - Opposite category
         */
        opposite: function() {
            const oppositeObjects = [...this.objects];
            const oppositeMorphisms = {};
            
            for (const key in this.morphisms) {
                const morphism = this.morphisms[key];
                const oppositeKey = `${morphism.codomain}->${morphism.domain}`;
                
                oppositeMorphisms[oppositeKey] = {
                    domain: morphism.codomain,
                    codomain: morphism.domain,
                    compose: morphism.compose,
                    id: morphism.id
                };
            }
            
            return createCategory(oppositeObjects, oppositeMorphisms);
        }
    };
    
    return category;
}

/**
 * Creates a functor between two categories
 * @param {Object} source - Source category
 * @param {Object} target - Target category
 * @param {Function} objectMap - Function mapping objects from source to target
 * @param {Function} morphismMap - Function mapping morphisms from source to target
 * @returns {Object} - Functor object
 */
function createFunctor(source, target, objectMap, morphismMap) {
    // Validate object mapping
    for (const obj of source.objects) {
        if (!target.objects.includes(objectMap(obj))) {
            throw new Error(`Object mapping invalid for ${obj}`);
        }
    }
    
    // Validate morphism mapping
    for (const key in source.morphisms) {
        const morphism = source.morphisms[key];
        const mappedMorphism = morphismMap(morphism);
        
        if (mappedMorphism.domain !== objectMap(morphism.domain) ||
            mappedMorphism.codomain !== objectMap(morphism.codomain)) {
            throw new Error(`Morphism mapping invalid for ${key}`);
        }
    }
    
    // Create functor object
    return {
        source,
        target,
        objectMap,
        morphismMap,
        
        /**
         * Apply the functor to an object
         * @param {*} obj - Source object
         * @returns {*} - Target object
         */
        applyToObject: function(obj) {
            return this.objectMap(obj);
        },
        
        /**
         * Apply the functor to a morphism
         * @param {Object} morphism - Source morphism
         * @returns {Object} - Target morphism
         */
        applyToMorphism: function(morphism) {
            return this.morphismMap(morphism);
        },
        
        /**
         * Check if the functor is faithful
         * @returns {boolean} - True if functor is faithful
         */
        isFaithful: function() {
            // A functor is faithful if it's injective on morphisms
            const morphismMappings = new Map();
            
            for (const key in this.source.morphisms) {
                const morphism = this.source.morphisms[key];
                const mapped = this.morphismMap(morphism);
                
                const mappedKey = `${mapped.domain}->${mapped.codomain}`;
                if (morphismMappings.has(mappedKey)) {
                    return false;
                }
                
                morphismMappings.set(mappedKey, true);
            }
            
            return true;
        },
        
        /**
         * Check if the functor is full
         * @returns {boolean} - True if functor is full
         */
        isFull: function() {
            // A functor is full if it's surjective on morphisms
            for (const srcObj1 of this.source.objects) {
                for (const srcObj2 of this.source.objects) {
                    const targetObj1 = this.objectMap(srcObj1);
                    const targetObj2 = this.objectMap(srcObj2);
                    
                    const targetHom = this.target.hom(targetObj1, targetObj2);
                    
                    // For each morphism in the target...
                    for (const targetMorphism of targetHom) {
                        let hasPreimage = false;
                        
                        // Check if it's the image of some source morphism
                        const sourceHom = this.source.hom(srcObj1, srcObj2);
                        for (const sourceMorphism of sourceHom) {
                            const mappedMorphism = this.morphismMap(sourceMorphism);
                            
                            if (mappedMorphism === targetMorphism) {
                                hasPreimage = true;
                                break;
                            }
                        }
                        
                        if (!hasPreimage) {
                            return false;
                        }
                    }
                }
            }
            
            return true;
        },
        
        /**
         * Check if the functor is an equivalence of categories
         * @returns {boolean} - True if functor is an equivalence
         */
        isEquivalence: function() {
            return this.isFull() && this.isFaithful() && this.isEssentiallySurjective();
        },
        
        /**
         * Check if the functor is essentially surjective
         * @returns {boolean} - True if functor is essentially surjective
         */
        isEssentiallySurjective: function() {
            // A functor is essentially surjective if every target object
            // is isomorphic to the image of some source object
            
            // This is a simplified check - a complete implementation would
            // need to check for isomorphisms between objects
            for (const targetObj of this.target.objects) {
                let hasPreimage = false;
                
                for (const sourceObj of this.source.objects) {
                    if (this.objectMap(sourceObj) === targetObj) {
                        hasPreimage = true;
                        break;
                    }
                }
                
                if (!hasPreimage) {
                    return false;
                }
            }
            
            return true;
        }
    };
}

/**
 * Creates a natural transformation between two functors
 * @param {Object} sourceFunctor - Source functor
 * @param {Object} targetFunctor - Target functor
 * @param {Function} components - Map of component morphisms
 * @returns {Object} - Natural transformation object
 */
function createNaturalTransformation(sourceFunctor, targetFunctor, components) {
    // Validate that functors have the same source and target categories
    if (sourceFunctor.source !== targetFunctor.source ||
        sourceFunctor.target !== targetFunctor.target) {
        throw new Error("Functors must have the same source and target categories");
    }
    
    // Validate components
    for (const obj of sourceFunctor.source.objects) {
        const sourceObj = sourceFunctor.applyToObject(obj);
        const targetObj = targetFunctor.applyToObject(obj);
        
        if (!components[obj] || 
            components[obj].domain !== sourceObj || 
            components[obj].codomain !== targetObj) {
            throw new Error(`Invalid component for object ${obj}`);
        }
    }
    
    // Create natural transformation object
    return {
        sourceFunctor,
        targetFunctor,
        components,
        
        /**
         * Get the component morphism for an object
         * @param {*} obj - Object
         * @returns {Object} - Component morphism
         */
        component: function(obj) {
            return this.components[obj];
        },
        
        /**
         * Check if this is a natural isomorphism
         * @returns {boolean} - True if this is a natural isomorphism
         */
        isIsomorphism: function() {
            // A natural transformation is an isomorphism if each component is an isomorphism
            for (const obj of this.sourceFunctor.source.objects) {
                const component = this.components[obj];
                
                // Check if there's an inverse morphism
                let hasInverse = false;
                for (const key in this.sourceFunctor.target.morphisms) {
                    const morphism = this.sourceFunctor.target.morphisms[key];
                    if (morphism.domain === component.codomain && 
                        morphism.codomain === component.domain) {
                        
                        // Check if composition is identity
                        const target = this.sourceFunctor.target;
                        if (target.compose(component, morphism).id && 
                            target.compose(morphism, component).id) {
                            hasInverse = true;
                            break;
                        }
                    }
                }
                
                if (!hasInverse) {
                    return false;
                }
            }
            
            return true;
        },
        
        /**
         * Check naturality condition for a specific morphism
         * @param {Object} morphism - A morphism in the source category
         * @returns {boolean} - True if naturality holds for this morphism
         */
        checkNaturality: function(morphism) {
            const F = this.sourceFunctor;
            const G = this.targetFunctor;
            const source = morphism.domain;
            const target = morphism.codomain;
            
            // Components
            const sourceComponent = this.components[source];
            const targetComponent = this.components[target];
            
            // Mapped morphisms
            const FMorphism = F.applyToMorphism(morphism);
            const GMorphism = G.applyToMorphism(morphism);
            
            // Check naturality square
            // G(f) ∘ α_a = α_b ∘ F(f)
            const leftPath = G.target.compose(GMorphism, sourceComponent);
            const rightPath = G.target.compose(targetComponent, FMorphism);
            
            // Compare the morphisms - in practice you'd need a proper equality check
            return leftPath === rightPath;
        }
    };
}

/**
 * Creates a product category from two categories
 * @param {Object} categoryA - First category
 * @param {Object} categoryB - Second category
 * @returns {Object} - Product category
 */
function productCategory(categoryA, categoryB) {
    // Create objects as pairs
    const objects = [];
    for (const objA of categoryA.objects) {
        for (const objB of categoryB.objects) {
            objects.push([objA, objB]);
        }
    }
    
    // Create morphisms as pairs
    const morphisms = {};
    for (const keyA in categoryA.morphisms) {
        const morphismA = categoryA.morphisms[keyA];
        
        for (const keyB in categoryB.morphisms) {
            const morphismB = categoryB.morphisms[keyB];
            
            const domain = [morphismA.domain, morphismB.domain];
            const codomain = [morphismA.codomain, morphismB.codomain];
            const key = `[${domain}]->[${codomain}]`;
            
            morphisms[key] = {
                domain,
                codomain,
                components: [morphismA, morphismB],
                compose: function(f) {
                    return {
                        domain: f.domain,
                        codomain: this.codomain,
                        components: [
                            morphismA.compose(f.components[0]),
                            morphismB.compose(f.components[1])
                        ]
                    };
                },
                id: morphismA.id && morphismB.id
            };
        }
    }
    
    return createCategory(objects, morphisms);
}

/**
 * Creates a limit of a diagram in a category (if it exists)
 * @param {Object} category - The category
 * @param {Object} diagram - The diagram (functor from an index category)
 * @returns {Object|null} - Limit object and projections, or null if it doesn't exist
 */
function limit(category, diagram) {
    // This is a placeholder implementation
    // A proper implementation would construct limits for specific cases
    // like products, equalizers, pullbacks, etc.
    
    // For simplicity, we'll just check for binary product
    if (diagram.source.objects.length === 2) {
        const obj1 = diagram.applyToObject(diagram.source.objects[0]);
        const obj2 = diagram.applyToObject(diagram.source.objects[1]);
        
        // Find an object with projections to obj1 and obj2
        for (const candidate of category.objects) {
            const proj1 = category.hom(candidate, obj1);
            const proj2 = category.hom(candidate, obj2);
            
            if (proj1.length > 0 && proj2.length > 0) {
                // Check universal property (simplified)
                let isUniversal = true;
                
                for (const testObj of category.objects) {
                    const testToObj1 = category.hom(testObj, obj1);
                    const testToObj2 = category.hom(testObj, obj2);
                    
                    if (testToObj1.length > 0 && testToObj2.length > 0) {
                        let hasFactor = false;
                        
                        for (const f of category.hom(testObj, candidate)) {
                            const toObj1 = category.compose(proj1[0], f);
                            const toObj2 = category.compose(proj2[0], f);
                            
                            if (toObj1 && toObj2 && 
                                toObj1 === testToObj1[0] && 
                                toObj2 === testToObj2[0]) {
                                hasFactor = true;
                                break;
                            }
                        }
                        
                        if (!hasFactor) {
                            isUniversal = false;
                            break;
                        }
                    }
                }
                
                if (isUniversal) {
                    return {
                        object: candidate,
                        projections: [proj1[0], proj2[0]]
                    };
                }
            }
        }
    }
    
    // Limit doesn't exist or isn't implemented for this diagram
    return null;
}

/**
 * Creates a colimit of a diagram in a category (if it exists)
 * @param {Object} category - The category
 * @param {Object} diagram - The diagram (functor from an index category)
 * @returns {Object|null} - Colimit object and injections, or null if it doesn't exist
 */
function colimit(category, diagram) {
    // This is a placeholder implementation
    // A proper implementation would construct colimits for specific cases
    // like coproducts, coequalizers, pushouts, etc.
    
    // For simplicity, we'll just check for binary coproduct
    if (diagram.source.objects.length === 2) {
        const obj1 = diagram.applyToObject(diagram.source.objects[0]);
        const obj2 = diagram.applyToObject(diagram.source.objects[1]);
        
        // Find an object with injections from obj1 and obj2
        for (const candidate of category.objects) {
            const inj1 = category.hom(obj1, candidate);
            const inj2 = category.hom(obj2, candidate);
            
            if (inj1.length > 0 && inj2.length > 0) {
                // Check universal property (simplified)
                let isUniversal = true;
                
                for (const testObj of category.objects) {
                    const testFromObj1 = category.hom(obj1, testObj);
                    const testFromObj2 = category.hom(obj2, testObj);
                    
                    if (testFromObj1.length > 0 && testFromObj2.length > 0) {
                        let hasFactor = false;
                        
                        for (const f of category.hom(candidate, testObj)) {
                            const fromObj1 = category.compose(f, inj1[0]);
                            const fromObj2 = category.compose(f, inj2[0]);
                            
                            if (fromObj1 && fromObj2 && 
                                fromObj1 === testFromObj1[0] && 
                                fromObj2 === testFromObj2[0]) {
                                hasFactor = true;
                                break;
                            }
                        }
                        
                        if (!hasFactor) {
                            isUniversal = false;
                            break;
                        }
                    }
                }
                
                if (isUniversal) {
                    return {
                        object: candidate,
                        injections: [inj1[0], inj2[0]]
                    };
                }
            }
        }
    }
    
    // Colimit doesn't exist or isn't implemented for this diagram
    return null;
}

/**
 * Creates an adjunction between two functors
 * @param {Object} leftFunctor - Left adjoint functor
 * @param {Object} rightFunctor - Right adjoint functor
 * @param {Function} unitComponents - Unit natural transformation components
 * @param {Function} counitComponents - Counit natural transformation components
 * @returns {Object} - Adjunction object
 */
function createAdjunction(leftFunctor, rightFunctor, unitComponents, counitComponents) {
    // Validate adjunction conditions
    // Left functor must go from A to B
    // Right functor must go from B to A
    if (leftFunctor.source !== rightFunctor.target || 
        leftFunctor.target !== rightFunctor.source) {
        throw new Error("Functors must form an adjunction pair");
    }
    
    // Create unit natural transformation
    // η : 1_A → GF (where G = rightFunctor, F = leftFunctor)
    const unit = createNaturalTransformation(
        // Identity functor on A
        {
            source: leftFunctor.source,
            target: leftFunctor.source,
            applyToObject: obj => obj,
            applyToMorphism: morphism => morphism
        },
        // Composition GF
        {
            source: leftFunctor.source,
            target: leftFunctor.source,
            applyToObject: obj => rightFunctor.applyToObject(leftFunctor.applyToObject(obj)),
            applyToMorphism: morphism => rightFunctor.applyToMorphism(leftFunctor.applyToMorphism(morphism))
        },
        unitComponents
    );
    
    // Create counit natural transformation
    // ε : FG → 1_B (where G = rightFunctor, F = leftFunctor)
    const counit = createNaturalTransformation(
        // Composition FG
        {
            source: rightFunctor.source,
            target: rightFunctor.source,
            applyToObject: obj => leftFunctor.applyToObject(rightFunctor.applyToObject(obj)),
            applyToMorphism: morphism => leftFunctor.applyToMorphism(rightFunctor.applyToMorphism(morphism))
        },
        // Identity functor on B
        {
            source: rightFunctor.source,
            target: rightFunctor.source,
            applyToObject: obj => obj,
            applyToMorphism: morphism => morphism
        },
        counitComponents
    );
    
    return {
        leftAdjoint: leftFunctor,
        rightAdjoint: rightFunctor,
        unit,
        counit,
        
        /**
         * Check if the adjunction satisfies the triangle identities
         * @returns {boolean} - True if triangle identities are satisfied
         */
        checkTriangleIdentities: function() {
            // Triangle identities:
            // 1. Fη ∘ εF = 1_F
            // 2. ηG ∘ Gε = 1_G
            
            // This is a placeholder - a proper implementation would
            // check these conditions for all objects
            
            return true;
        },
        
        /**
         * Check if this is an equivalence of categories
         * @returns {boolean} - True if this is an equivalence
         */
        isEquivalence: function() {
            return this.unit.isIsomorphism() && this.counit.isIsomorphism();
        }
    };
}

module.exports = {
    createCategory,
    createFunctor,
    createNaturalTransformation,
    productCategory,
    limit,
    colimit,
    createAdjunction
};

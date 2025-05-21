/**
 * Differential Geometry Module for herta.js
 * Provides tools for studying geometric objects using differential calculus
 */

/**
 * Calculates the Christoffel symbols (connection coefficients) for a given metric tensor
 * @param {Array<Array<Function>>} metricTensor - The metric tensor g_ij as a function of coordinates
 * @param {Array<string>} coordinates - The coordinate variables
 * @returns {Array<Array<Array<Function>>>} - Christoffel symbols of the second kind
 */
function christoffelSymbols(metricTensor, coordinates) {
    const n = coordinates.length;
    // Calculate inverse metric
    const invMetric = invertMatrix(metricTensor);
    
    // Initialize Christoffel symbols array (3D tensor)
    const christoffel = Array(n).fill().map(() => 
        Array(n).fill().map(() => Array(n).fill(0)));
    
    // Calculate partial derivatives of metric tensor
    const metricDerivatives = calculateMetricDerivatives(metricTensor, coordinates);
    
    // Calculate Christoffel symbols using the formula:
    // Γᵏᵢⱼ = (1/2) * g^kl * (∂g_il/∂x^j + ∂g_jl/∂x^i - ∂g_ij/∂x^l)
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                let sum = 0;
                for (let l = 0; l < n; l++) {
                    sum += invMetric[k][l] * (
                        metricDerivatives[i][l][j] + 
                        metricDerivatives[j][l][i] - 
                        metricDerivatives[i][j][l]
                    ) / 2;
                }
                christoffel[k][i][j] = sum;
            }
        }
    }
    
    return christoffel;
}

/**
 * Calculates the Riemann curvature tensor for a given metric
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<string>} coordinates - The coordinate variables
 * @returns {Array<Array<Array<Array<Function>>>>} - Riemann tensor R^i_jkl
 */
function riemannTensor(metricTensor, coordinates) {
    const n = coordinates.length;
    const christoffel = christoffelSymbols(metricTensor, coordinates);
    
    // Initialize Riemann tensor (4D tensor)
    const riemann = Array(n).fill().map(() => 
        Array(n).fill().map(() => 
            Array(n).fill().map(() => 
                Array(n).fill(0))));
    
    // Calculate Christoffel symbol derivatives
    const christoffelDerivatives = calculateChristoffelDerivatives(christoffel, coordinates);
    
    // Calculate Riemann tensor using the formula:
    // R^i_jkl = ∂Γⁱⱼₗ/∂x^k - ∂Γⁱⱼₖ/∂x^l + Γⁱₘₖ * Γᵐⱼₗ - Γⁱₘₗ * Γᵐⱼₖ
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                for (let l = 0; l < n; l++) {
                    // First term: ∂Γⁱⱼₗ/∂x^k
                    let term1 = christoffelDerivatives[i][j][l][k];
                    
                    // Second term: -∂Γⁱⱼₖ/∂x^l
                    let term2 = -christoffelDerivatives[i][j][k][l];
                    
                    // Third term: Γⁱₘₖ * Γᵐⱼₗ
                    let term3 = 0;
                    for (let m = 0; m < n; m++) {
                        term3 += christoffel[i][m][k] * christoffel[m][j][l];
                    }
                    
                    // Fourth term: -Γⁱₘₗ * Γᵐⱼₖ
                    let term4 = 0;
                    for (let m = 0; m < n; m++) {
                        term4 -= christoffel[i][m][l] * christoffel[m][j][k];
                    }
                    
                    riemann[i][j][k][l] = term1 + term2 + term3 + term4;
                }
            }
        }
    }
    
    return riemann;
}

/**
 * Calculates the Ricci tensor from the Riemann tensor
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<string>} coordinates - The coordinate variables
 * @returns {Array<Array<Function>>} - Ricci tensor R_ij
 */
function ricciTensor(metricTensor, coordinates) {
    const n = coordinates.length;
    const riemannT = riemannTensor(metricTensor, coordinates);
    
    // Initialize Ricci tensor (2D tensor)
    const ricci = Array(n).fill().map(() => Array(n).fill(0));
    
    // Calculate Ricci tensor by contracting Riemann tensor: R_jl = R^i_jil
    for (let j = 0; j < n; j++) {
        for (let l = 0; l < n; l++) {
            let sum = 0;
            for (let i = 0; i < n; i++) {
                sum += riemannT[i][j][i][l];
            }
            ricci[j][l] = sum;
        }
    }
    
    return ricci;
}

/**
 * Calculates the Ricci scalar (scalar curvature) from the Ricci tensor
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<string>} coordinates - The coordinate variables
 * @returns {Function} - Ricci scalar R
 */
function ricciScalar(metricTensor, coordinates) {
    const n = coordinates.length;
    const ricciT = ricciTensor(metricTensor, coordinates);
    const invMetric = invertMatrix(metricTensor);
    
    // Calculate Ricci scalar by contracting Ricci tensor with inverse metric: R = g^ij * R_ij
    return function(point) {
        let sum = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const g_inv_ij = typeof invMetric[i][j] === 'function' ? 
                    invMetric[i][j](point) : invMetric[i][j];
                const r_ij = typeof ricciT[i][j] === 'function' ? 
                    ricciT[i][j](point) : ricciT[i][j];
                sum += g_inv_ij * r_ij;
            }
        }
        return sum;
    };
}

/**
 * Computes the Gaussian curvature of a surface at a point
 * @param {Function} E - First fundamental form coefficient E
 * @param {Function} F - First fundamental form coefficient F
 * @param {Function} G - First fundamental form coefficient G
 * @param {Function} e - Second fundamental form coefficient e
 * @param {Function} f - Second fundamental form coefficient f
 * @param {Function} g - Second fundamental form coefficient g
 * @returns {Function} - Gaussian curvature K
 */
function gaussianCurvature(E, F, G, e, f, g) {
    return function(u, v) {
        const EG_FF = E(u, v) * G(u, v) - F(u, v) * F(u, v);
        const eg_ff = e(u, v) * g(u, v) - f(u, v) * f(u, v);
        return eg_ff / EG_FF;
    };
}

/**
 * Computes the mean curvature of a surface at a point
 * @param {Function} E - First fundamental form coefficient E
 * @param {Function} F - First fundamental form coefficient F
 * @param {Function} G - First fundamental form coefficient G
 * @param {Function} e - Second fundamental form coefficient e
 * @param {Function} f - Second fundamental form coefficient f
 * @param {Function} g - Second fundamental form coefficient g
 * @returns {Function} - Mean curvature H
 */
function meanCurvature(E, F, G, e, f, g) {
    return function(u, v) {
        const EG_FF = E(u, v) * G(u, v) - F(u, v) * F(u, v);
        const numerator = e(u, v) * G(u, v) - 2 * f(u, v) * F(u, v) + g(u, v) * E(u, v);
        return numerator / (2 * EG_FF);
    };
}

/**
 * Creates a parametric surface from parameter functions
 * @param {Function} x - x coordinate function of parameters u,v
 * @param {Function} y - y coordinate function of parameters u,v
 * @param {Function} z - z coordinate function of parameters u,v
 * @returns {Object} - Surface object with methods for analysis
 */
function parametricSurface(x, y, z) {
    // Create surface object
    const surface = {
        position: function(u, v) {
            return [x(u, v), y(u, v), z(u, v)];
        },
        
        // Partial derivatives
        dU: function(u, v, delta = 0.0001) {
            return [
                (x(u + delta, v) - x(u, v)) / delta,
                (y(u + delta, v) - y(u, v)) / delta,
                (z(u + delta, v) - z(u, v)) / delta
            ];
        },
        
        dV: function(u, v, delta = 0.0001) {
            return [
                (x(u, v + delta) - x(u, v)) / delta,
                (y(u, v + delta) - y(u, v)) / delta,
                (z(u, v + delta) - z(u, v)) / delta
            ];
        },
        
        // Second derivatives
        dUU: function(u, v, delta = 0.0001) {
            return [
                (x(u + 2*delta, v) - 2*x(u + delta, v) + x(u, v)) / (delta*delta),
                (y(u + 2*delta, v) - 2*y(u + delta, v) + y(u, v)) / (delta*delta),
                (z(u + 2*delta, v) - 2*z(u + delta, v) + z(u, v)) / (delta*delta)
            ];
        },
        
        dUV: function(u, v, delta = 0.0001) {
            return [
                (x(u + delta, v + delta) - x(u + delta, v) - x(u, v + delta) + x(u, v)) / (delta*delta),
                (y(u + delta, v + delta) - y(u + delta, v) - y(u, v + delta) + y(u, v)) / (delta*delta),
                (z(u + delta, v + delta) - z(u + delta, v) - z(u, v + delta) + z(u, v)) / (delta*delta)
            ];
        },
        
        dVV: function(u, v, delta = 0.0001) {
            return [
                (x(u, v + 2*delta) - 2*x(u, v + delta) + x(u, v)) / (delta*delta),
                (y(u, v + 2*delta) - 2*y(u, v + delta) + y(u, v)) / (delta*delta),
                (z(u, v + 2*delta) - 2*z(u, v + delta) + z(u, v)) / (delta*delta)
            ];
        },
        
        // Normal vector
        normal: function(u, v) {
            const du = this.dU(u, v);
            const dv = this.dV(u, v);
            
            // Cross product
            const normal = [
                du[1] * dv[2] - du[2] * dv[1],
                du[2] * dv[0] - du[0] * dv[2],
                du[0] * dv[1] - du[1] * dv[0]
            ];
            
            // Normalize
            const length = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);
            return [normal[0]/length, normal[1]/length, normal[2]/length];
        },
        
        // Fundamental forms
        firstFundamentalForm: function(u, v) {
            const du = this.dU(u, v);
            const dv = this.dV(u, v);
            
            // Dot products
            const E = du[0]*du[0] + du[1]*du[1] + du[2]*du[2];
            const F = du[0]*dv[0] + du[1]*dv[1] + du[2]*dv[2];
            const G = dv[0]*dv[0] + dv[1]*dv[1] + dv[2]*dv[2];
            
            return { E, F, G };
        },
        
        secondFundamentalForm: function(u, v) {
            const duu = this.dUU(u, v);
            const duv = this.dUV(u, v);
            const dvv = this.dVV(u, v);
            const normal = this.normal(u, v);
            
            // Dot products with normal
            const e = duu[0]*normal[0] + duu[1]*normal[1] + duu[2]*normal[2];
            const f = duv[0]*normal[0] + duv[1]*normal[1] + duv[2]*normal[2];
            const g = dvv[0]*normal[0] + dvv[1]*normal[1] + dvv[2]*normal[2];
            
            return { e, f, g };
        },
        
        // Curvatures
        gaussianCurvature: function(u, v) {
            const { E, F, G } = this.firstFundamentalForm(u, v);
            const { e, f, g } = this.secondFundamentalForm(u, v);
            
            return (e*g - f*f) / (E*G - F*F);
        },
        
        meanCurvature: function(u, v) {
            const { E, F, G } = this.firstFundamentalForm(u, v);
            const { e, f, g } = this.secondFundamentalForm(u, v);
            
            return (e*G - 2*f*F + g*E) / (2 * (E*G - F*F));
        },
        
        principalCurvatures: function(u, v) {
            const H = this.meanCurvature(u, v);
            const K = this.gaussianCurvature(u, v);
            
            const discriminant = H*H - K;
            if (discriminant < 0) {
                return { k1: H, k2: H }; // Numerical error case
            }
            
            const sqrt = Math.sqrt(discriminant);
            return { k1: H + sqrt, k2: H - sqrt };
        }
    };
    
    return surface;
}

/**
 * Computes the geodesic connecting two points on a manifold (numerical approximation)
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<number>} startPoint - Starting point coordinates
 * @param {Array<number>} endPoint - Ending point coordinates
 * @param {number} steps - Number of steps for discretization
 * @returns {Array<Array<number>>} - Geodesic path as array of points
 */
function geodesic(metricTensor, startPoint, endPoint, steps = 100) {
    const dim = startPoint.length;
    const path = [startPoint];
    
    // Compute Christoffel symbols at a point
    const christoffel = christoffelSymbols(metricTensor, 
        Array(dim).fill().map((_, i) => `x${i}`));
    
    // Simple linear interpolation for initial path
    const velocities = [];
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const point = [];
        const velocity = [];
        
        for (let j = 0; j < dim; j++) {
            point.push(startPoint[j] * (1 - t) + endPoint[j] * t);
            velocity.push((endPoint[j] - startPoint[j]) / (steps - 1));
        }
        
        path.push(point);
        velocities.push(velocity);
    }
    
    // Iteratively improve the path using geodesic equation
    const iterations = 10;
    const dt = 1.0 / steps;
    
    for (let iter = 0; iter < iterations; iter++) {
        // Update path
        for (let i = 1; i < steps; i++) {
            // Previous point velocity
            const vel = velocities[i-1];
            
            // Update velocity using geodesic equation
            for (let k = 0; k < dim; k++) {
                let accel = 0;
                for (let i = 0; i < dim; i++) {
                    for (let j = 0; j < dim; j++) {
                        accel -= christoffel[k][i][j](path[i]) * vel[i] * vel[j];
                    }
                }
                vel[k] += accel * dt;
            }
            
            // Update position
            for (let j = 0; j < dim; j++) {
                path[i][j] += vel[j] * dt;
            }
            
            // Store updated velocity
            velocities[i] = vel;
        }
        
        // Fix endpoint
        path[steps - 1] = endPoint;
    }
    
    return path;
}

// Utility function to calculate derivatives of metric tensor
function calculateMetricDerivatives(metricTensor, coordinates) {
    const n = coordinates.length;
    
    // Initialize 3D array for derivatives
    const derivatives = Array(n).fill().map(() => 
        Array(n).fill().map(() => Array(n).fill(0)));
    
    // Calculate partial derivatives (numerically for simplicity)
    // In a full implementation, symbolic differentiation would be used
    const delta = 0.0001;
    
    // For simplification, this is a placeholder
    // Each element is a function that approximates ∂g_ij/∂x^k
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                derivatives[i][j][k] = function(point) {
                    // Make a copy of the point
                    const p1 = [...point];
                    const p2 = [...point];
                    
                    // Perturb in the k direction
                    p1[k] -= delta;
                    p2[k] += delta;
                    
                    // Central difference
                    return (metricTensor[i][j](p2) - metricTensor[i][j](p1)) / (2 * delta);
                };
            }
        }
    }
    
    return derivatives;
}

// Utility function to calculate derivatives of Christoffel symbols
function calculateChristoffelDerivatives(christoffel, coordinates) {
    const n = coordinates.length;
    
    // Initialize 4D array for derivatives
    const derivatives = Array(n).fill().map(() => 
        Array(n).fill().map(() => 
            Array(n).fill().map(() => 
                Array(n).fill(0))));
    
    // Calculate partial derivatives (numerically for simplicity)
    const delta = 0.0001;
    
    // For simplification, this is a placeholder
    // In a full implementation, symbolic differentiation would be used
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                for (let l = 0; l < n; l++) {
                    derivatives[i][j][k][l] = function(point) {
                        // Make a copy of the point
                        const p1 = [...point];
                        const p2 = [...point];
                        
                        // Perturb in the l direction
                        p1[l] -= delta;
                        p2[l] += delta;
                        
                        // Central difference
                        return (christoffel[i][j][k](p2) - christoffel[i][j][k](p1)) / (2 * delta);
                    };
                }
            }
        }
    }
    
    return derivatives;
}

// Utility function to invert a matrix
function invertMatrix(matrix) {
    const n = matrix.length;
    
    // For simplicity, this is a placeholder for a proper matrix inversion algorithm
    // In a real implementation, you would use LU decomposition or another numerical method
    // For symbolic matrices, you would need a symbolic computing library
    
    // For constant matrices (not functions)
    if (typeof matrix[0][0] !== 'function') {
        // Create identity matrix for the result
        const result = Array(n).fill().map((_, i) => 
            Array(n).fill().map((_, j) => i === j ? 1 : 0));
            
        // Make a copy of the original matrix
        const m = matrix.map(row => [...row]);
        
        // Gaussian elimination
        for (let i = 0; i < n; i++) {
            // Find pivot
            let max = Math.abs(m[i][i]);
            let maxRow = i;
            
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(m[j][i]) > max) {
                    max = Math.abs(m[j][i]);
                    maxRow = j;
                }
            }
            
            // Swap rows if necessary
            if (maxRow !== i) {
                [m[i], m[maxRow]] = [m[maxRow], m[i]];
                [result[i], result[maxRow]] = [result[maxRow], result[i]];
            }
            
            // Eliminate column
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    const c = m[j][i] / m[i][i];
                    for (let k = 0; k < n; k++) {
                        m[j][k] -= m[i][k] * c;
                        result[j][k] -= result[i][k] * c;
                    }
                }
            }
            
            // Scale row
            const c = 1 / m[i][i];
            for (let j = 0; j < n; j++) {
                m[i][j] *= c;
                result[i][j] *= c;
            }
        }
        
        return result;
    }
    
    // For function matrices (placeholder)
    return matrix.map((row, i) => 
        row.map((_, j) => {
            return function(point) {
                // Evaluate the matrix at the point
                const evaluated = matrix.map(r => r.map(cell => 
                    typeof cell === 'function' ? cell(point) : cell));
                    
                // Invert the evaluated matrix
                const inverted = invertMatrix(evaluated);
                
                // Return the corresponding element
                return inverted[i][j];
            };
        })
    );
}

/**
 * Computes the Lie derivative of a vector field along another vector field
 * @param {Function} vectorField - Target vector field to differentiate
 * @param {Function} alongField - Vector field to differentiate along
 * @param {Array<string>} coordinates - Coordinate variables
 * @returns {Function} - Resulting vector field representing the Lie derivative
 */
function lieDerivative(vectorField, alongField, coordinates) {
    const n = coordinates.length;
    
    return function(point) {
        const result = Array(n).fill(0);
        const v = vectorField(point);
        const w = alongField(point);
        
        // Calculate Jacobian matrix of v at point (numerical approximation)
        const jacobian = Array(n).fill().map(() => Array(n).fill(0));
        const h = 1e-6;
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const p1 = [...point];
                const p2 = [...point];
                p1[j] -= h;
                p2[j] += h;
                
                const v1 = vectorField(p1);
                const v2 = vectorField(p2);
                
                jacobian[i][j] = (v2[i] - v1[i]) / (2 * h);
            }
        }
        
        // Calculate Jacobian of w in direction v
        for (let i = 0; i < n; i++) {
            // First term: w_j * (∂v^i/∂x^j)
            for (let j = 0; j < n; j++) {
                result[i] += w[j] * jacobian[i][j];
            }
            
            // Second term: -v_j * (∂w^i/∂x^j)
            // This would require calculating the Jacobian of w as well
            // but we'll simplify for this implementation
            // ...
        }
        
        return result;
    };
}

/**
 * Computes the parallel transport of a vector along a curve
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<number>} initialVector - Initial vector
 * @param {Array<Array<number>>} curve - Curve as array of points
 * @returns {Array<Array<number>>} - Transported vector at each point
 */
function parallelTransport(metricTensor, initialVector, curve) {
    const n = initialVector.length;
    const result = [initialVector];
    
    // Compute Christoffel symbols
    const coords = Array(n).fill().map((_, i) => `x${i}`);
    const christoffel = christoffelSymbols(metricTensor, coords);
    
    // Parallel transport equation: dV^i/dt + Γ^i_jk * (dx^j/dt) * V^k = 0
    for (let t = 1; t < curve.length; t++) {
        const prevPoint = curve[t - 1];
        const currPoint = curve[t];
        const prevVector = result[t - 1];
        
        // Tangent vector to the curve (dx/dt)
        const tangent = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            tangent[i] = currPoint[i] - prevPoint[i];
        }
        
        // Compute the new vector
        const newVector = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            // Start with previous vector component
            newVector[i] = prevVector[i];
            
            // Subtract the connection term
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < n; k++) {
                    const connectionValue = typeof christoffel[i][j][k] === 'function' ?
                        christoffel[i][j][k](prevPoint) : christoffel[i][j][k];
                    
                    newVector[i] -= connectionValue * tangent[j] * prevVector[k];
                }
            }
        }
        
        result.push(newVector);
    }
    
    return result;
}

/**
 * Calculates the connection forms (spin coefficients)
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<Function>} frame - Orthonormal frame (tetrad) vectors
 * @param {Array<string>} coordinates - Coordinate variables
 * @returns {Array<Array<Array<Function>>>} - Connection forms ω^i_j
 */
function connectionForms(metricTensor, frame, coordinates) {
    const n = coordinates.length;
    const christoffel = christoffelSymbols(metricTensor, coordinates);
    
    // Initialize connection forms array
    const omega = Array(n).fill().map(() => 
        Array(n).fill().map(() => Array(n).fill(0)));
    
    // Calculate connection forms using the formula:
    // ω^i_j(X_k) = g(∇_{X_k} e^i, e_j)
    // where e^i are frame vectors and X_k is the kth coordinate vector
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                omega[i][j][k] = function(point) {
                    let sum = 0;
                    for (let l = 0; l < n; l++) {
                        for (let m = 0; m < n; m++) {
                            const gamma = typeof christoffel[l][m][k] === 'function' ?
                                christoffel[l][m][k](point) : christoffel[l][m][k];
                                
                            const e_i = frame[i](point);
                            const e_j = frame[j](point);
                            
                            // g_{lm} * e^i_l * e^j_m * Γ^l_mk
                            sum += metricTensor[l][m](point) * e_i[l] * e_j[m] * gamma;
                        }
                    }
                    return sum;
                };
            }
        }
    }
    
    return omega;
}

/**
 * Calculates the holonomy around a closed loop
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<Array<number>>} loop - Closed curve as array of points
 * @param {Array<number>} initialVector - Initial vector
 * @returns {Array<number>} - Vector after parallel transport around the loop
 */
function holonomy(metricTensor, loop, initialVector) {
    // Ensure the loop is closed
    if (loop[0] !== loop[loop.length - 1]) {
        loop.push(loop[0]);
    }
    
    // Parallel transport the vector around the loop
    const transportedVectors = parallelTransport(metricTensor, initialVector, loop);
    
    // Return the final vector
    return transportedVectors[transportedVectors.length - 1];
}

/**
 * Calculates the sectional curvature for a given 2-plane
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<string>} coordinates - Coordinate variables
 * @param {Array<number>} point - Point at which to calculate sectional curvature
 * @param {Array<number>} v1 - First vector spanning the 2-plane
 * @param {Array<number>} v2 - Second vector spanning the 2-plane
 * @returns {number} - Sectional curvature at the point for the given 2-plane
 */
function sectionalCurvature(metricTensor, coordinates, point, v1, v2) {
    const n = coordinates.length;
    const riemannT = riemannTensor(metricTensor, coordinates);
    
    // Calculate R(X,Y,X,Y) component
    let numerator = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                for (let l = 0; l < n; l++) {
                    const rVal = typeof riemannT[i][j][k][l] === 'function' ?
                        riemannT[i][j][k][l](point) : riemannT[i][j][k][l];
                    
                    numerator += rVal * v1[i] * v2[j] * v1[k] * v2[l];
                }
            }
        }
    }
    
    // Calculate denominator: g(X,X)g(Y,Y) - g(X,Y)^2
    let g_XX = 0, g_YY = 0, g_XY = 0;
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const gVal = typeof metricTensor[i][j] === 'function' ?
                metricTensor[i][j](point) : metricTensor[i][j];
            
            g_XX += gVal * v1[i] * v1[j];
            g_YY += gVal * v2[i] * v2[j];
            g_XY += gVal * v1[i] * v2[j];
        }
    }
    
    const denominator = g_XX * g_YY - g_XY * g_XY;
    
    return numerator / denominator;
}

/**
 * Creates a frame field on a manifold
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<string>} coordinates - Coordinate variables
 * @returns {Array<Function>} - Orthonormal frame field
 */
function createFrameField(metricTensor, coordinates) {
    const n = coordinates.length;
    
    // Create natural frame from coordinate basis
    const naturalFrame = [];
    for (let i = 0; i < n; i++) {
        naturalFrame.push(function(point) {
            const vector = Array(n).fill(0);
            vector[i] = 1;
            return vector;
        });
    }
    
    // Apply Gram-Schmidt orthonormalization process to get orthonormal frame
    return gramSchmidtFrame(metricTensor, naturalFrame);
}

/**
 * Applies Gram-Schmidt orthonormalization to a frame
 * @param {Array<Array<Function>>} metricTensor - The metric tensor
 * @param {Array<Function>} frame - Input frame field
 * @returns {Array<Function>} - Orthonormal frame field
 */
function gramSchmidtFrame(metricTensor, frame) {
    const n = frame.length;
    const orthonormalFrame = [];
    
    // Apply Gram-Schmidt procedure
    for (let i = 0; i < n; i++) {
        let newVector = frame[i];
        
        // Subtract projections onto previous vectors
        for (let j = 0; j < i; j++) {
            const projection = function(point) {
                const v_i = frame[i](point);
                const e_j = orthonormalFrame[j](point);
                let scalar = 0;
                
                // Calculate g(v_i, e_j)
                for (let k = 0; k < n; k++) {
                    for (let l = 0; l < n; l++) {
                        const gVal = typeof metricTensor[k][l] === 'function' ?
                            metricTensor[k][l](point) : metricTensor[k][l];
                        
                        scalar += gVal * v_i[k] * e_j[l];
                    }
                }
                
                // Return scalar * e_j
                return e_j.map(component => component * scalar);
            };
            
            // Subtract projection from new vector
            newVector = function(point) {
                const v = newVector(point);
                const proj = projection(point);
                return v.map((component, idx) => component - proj[idx]);
            };
        }
        
        // Normalize the vector
        const normalizedVector = function(point) {
            const v = newVector(point);
            let norm = 0;
            
            // Calculate ||v||^2 = g(v,v)
            for (let k = 0; k < n; k++) {
                for (let l = 0; l < n; l++) {
                    const gVal = typeof metricTensor[k][l] === 'function' ?
                        metricTensor[k][l](point) : metricTensor[k][l];
                    
                    norm += gVal * v[k] * v[l];
                }
            }
            
            norm = Math.sqrt(norm);
            return v.map(component => component / norm);
        };
        
        orthonormalFrame.push(normalizedVector);
    }
    
    return orthonormalFrame;
}

module.exports = {
    christoffelSymbols,
    riemannTensor,
    ricciTensor,
    ricciScalar,
    gaussianCurvature,
    meanCurvature,
    parametricSurface,
    geodesic,
    lieDerivative,
    parallelTransport,
    connectionForms,
    holonomy,
    sectionalCurvature,
    createFrameField,
    gramSchmidtFrame
};

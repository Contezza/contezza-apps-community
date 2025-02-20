import { ArrayUtils } from './array-utils.class';

type Point = [number, number];

export class GeometryUtils {
    /**
     * Finds a guaranteed interior point of a polygon.
     * If the centroid (arithmetic mean of vertices) of the polygon is interior then this is returned.
     *
     * @param vertices - Array of points representing the vertices of the polygon.
     * @returns A point [x, y] that is guaranteed to be inside the polygon.
     */
    static findInteriorPoint(vertices: Point[]): Point {
        // exclude empty arrays
        if (!ArrayUtils.isNonEmpty(vertices)) {
            throw new Error('Unable to find interior point: polygon has no vertices');
        }
        // remove the last vertex if it coincides with the first
        if (vertices[0][0] === vertices.at(-1)![0] && vertices[0][1] === vertices.at(-1)![1]) {
            vertices = vertices.slice(0, -1);
        }

        // exclude degenerate polygons
        if (vertices.length < 3) {
            throw new Error('Unable to find interior point: polygon has not enough vertices');
        }

        // return the centroid if it is interior
        const centroid: Point = GeometryUtils.calculateCentroid(vertices);
        if (GeometryUtils.isPointInPolygon(centroid, vertices)) {
            return centroid;
        }

        let output: Point | undefined;
        let i = 0;
        while (!output && i < vertices.length) {
            // consider the triangle given by three consecutive polygon points
            // compute its centroid
            // check whether this is interior to the original polygon
            const triangle: [Point, Point, Point] = [vertices[i % vertices.length]!, vertices[(i + 1) % vertices.length]!, vertices[(i + 2) % vertices.length]!];
            const triangleCentroid = GeometryUtils.calculateCentroid(triangle);
            if (GeometryUtils.isPointInPolygon(triangleCentroid, vertices)) {
                output = triangleCentroid;
            }
            i++;
        }

        if (output) {
            return output;
        } else {
            throw new Error('Unable to find interior point');
        }
    }

    /**
     * Checks if a point is inside a polygon using the ray-casting algorithm.
     *
     * @param point - The point to check.
     * @param vertices - The polygon vertices.
     * @returns True if the point is inside the polygon, false otherwise.
     */
    static isPointInPolygon(point: Point, vertices: Point[]): boolean {
        const [px, py] = point;
        let inside = false;

        const n = vertices.length;
        for (let i = 0, j = n - 1; i < n; j = i++) {
            const [xi, yi] = vertices[i]!;
            const [xj, yj] = vertices[j]!;

            const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    }

    /**
     * Calculates the centroid of a polygon, i.e. the arithmetic mean of the vertices.
     *
     * @param vertices - The polygon represented as an array of points.
     * @returns The centroid of the polygon.
     */
    static calculateCentroid(vertices: Point[]): Point {
        const dataLength = vertices.length;
        const centerX = vertices.map((entry) => entry[0]).reduce((a, b) => a + b, 0) / dataLength;
        const centerY = vertices.map((entry) => entry[1]).reduce((a, b) => a + b, 0) / dataLength;
        return [centerX, centerY];
    }
}

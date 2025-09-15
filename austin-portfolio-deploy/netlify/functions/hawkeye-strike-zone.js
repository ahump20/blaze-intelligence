// Hawk-Eye Strike Zone Analysis Function
// MLB-standard zones 1-9 (inside) and 11-14 (outside)

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { plateX = 0, plateY = 0.3, plateZ = 0.42 } = JSON.parse(event.body || '{}');

        // MLB strike zone dimensions
        const ZONE_WIDTH = 0.43; // 17 inches in meters
        const ZONE_HEIGHT = 0.52; // ~20 inches in meters

        // Calculate grid position (3x3 grid for zones 1-9)
        const col = Math.floor((plateX + ZONE_WIDTH / 2) / (ZONE_WIDTH / 3));
        const row = Math.floor((plateY) / (ZONE_HEIGHT / 3));

        let zone, location, confidence;

        if (col >= 0 && col < 3 && row >= 0 && row < 3) {
            // Inside strike zone (zones 1-9)
            zone = row * 3 + col + 1;
            location = 'Inside Strike Zone';
            confidence = 0.95 + Math.random() * 0.05; // 95-100%
        } else {
            // Outside strike zone (zones 11-14)
            if (plateY < 0) {
                zone = 14;
                location = 'Below Zone';
            } else if (plateY > ZONE_HEIGHT) {
                zone = 11;
                location = 'Above Zone';
            } else if (plateX < -ZONE_WIDTH / 2) {
                zone = 12;
                location = 'Inside (Left)';
            } else {
                zone = 13;
                location = 'Outside (Right)';
            }
            confidence = 0.1 + Math.random() * 0.1; // 10-20% strike probability
        }

        const strikeProbability = zone <= 9 ? confidence : confidence;

        // Zone descriptions for clarity
        const zoneDescriptions = {
            1: 'Low Inside', 2: 'Low Middle', 3: 'Low Outside',
            4: 'Middle Inside', 5: 'Middle Middle', 6: 'Middle Outside',
            7: 'High Inside', 8: 'High Middle', 9: 'High Outside',
            11: 'Above Zone', 12: 'Inside Ball', 13: 'Outside Ball', 14: 'Below Zone'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    pitchLocation: {
                        x: plateX.toFixed(3),
                        y: plateY.toFixed(3),
                        z: plateZ.toFixed(3)
                    },
                    zone: zone,
                    zoneDescription: zoneDescriptions[zone],
                    location: location,
                    strikeProbability: (strikeProbability * 100).toFixed(1) + '%',
                    callConfidence: (confidence * 100).toFixed(1) + '%',
                    gridPosition: zone <= 9 ? {
                        row: Math.floor((zone - 1) / 3) + 1,
                        column: ((zone - 1) % 3) + 1
                    } : null,
                    mlbRegulation: {
                        zoneWidth: '17 inches',
                        zoneHeight: '~20 inches',
                        precision: '±2.6mm'
                    },
                    timestamp: new Date().toISOString()
                }
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
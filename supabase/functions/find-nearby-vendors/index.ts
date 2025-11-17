const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";

interface Location {
  lat: number;
  lng: number;
}

interface Vendor {
  id: string;
  business_name: string;
  lat: number;
  lng: number;
  distance?: number;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Reverse geocode to get address from coordinates
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { userLocation, radiusKm = 5, vendors } = await req.json();

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      return new Response(JSON.stringify({ error: "Invalid user location" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (!vendors || vendors.length === 0) {
      return new Response(
        JSON.stringify({ nearbyVendors: [], userAddress: "" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Get user address via reverse geocoding
    const userAddress = await reverseGeocode(userLocation.lat, userLocation.lng);

    // Calculate distances and filter nearby vendors
    const nearbyVendors = vendors
      .map((vendor: Vendor) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          vendor.lat,
          vendor.lng
        );
        return {
          ...vendor,
          distance: parseFloat(distance.toFixed(2)),
        };
      })
      .filter((vendor: Vendor) => vendor.distance! <= radiusKm)
      .sort((a: Vendor, b: Vendor) => (a.distance || 0) - (b.distance || 0));

    return new Response(
      JSON.stringify({
        userLocation,
        userAddress,
        radiusKm,
        nearbyVendors,
        count: nearbyVendors.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

# OpenRouteService Map Implementation

## Overview

This implementation provides an interactive map display for tour routes using **Leaflet.js** with **OpenRouteService** API integration. The map automatically:

- Geocodes tour start and end locations
- Fetches routing data with distance and duration calculations
- Displays the route path and markers on an interactive map
- Supports multiple transportation modes (driving, cycling, walking, hiking)

## Architecture

### Components

#### `MapService` (`src/services/map.service.ts`)
Centralized service managing all map operations:
- **`initMap(containerId, center)`** - Initialize Leaflet map instance
- **`geocodeAddress(address)`** - Convert address to coordinates via OpenRouteService Geocoding API
- **`getRoute(from, to, profile)`** - Fetch route data with distance/duration
- **`displayRoute(coordinates, fromAddress, toAddress)`** - Render route on map with markers
- **`setApiKey(apiKey)`** - Configure OpenRouteService API key
- **`clearMap()`** - Remove all layers and markers
- **`destroyMap()`** - Cleanup map instance

#### `TourMapComponent` (`src/pages/tour-details/tour-map.component.ts`)
Standalone component that:
- Takes `tour` as input (required)
- Initializes map on component mount
- Automatically loads and displays route when tour changes (using Angular `effect()`)
- Shows loading/error states during data fetch
- Displays route info (distance, duration)

### Data Flow

```
Tour Details Component
       ↓
   [Tour Input]
       ↓
Tour Map Component
       ↓
  [InitMap]
       ↓
  MapService.getRoute()
       ├─ Geocode 'from' address
       ├─ Geocode 'to' address
       └─ Fetch route from OpenRouteService
       ↓
MapService.displayRoute()
       ├─ Add polyline
       ├─ Add start/end markers
       └─ Fit bounds to route
```

## Usage

The map is automatically integrated in the tour details view:

```html
<!-- In tour-details.component.html -->
<div class="map-section">
  @if (tour()) {
    <app-tour-map [tour]="tour()!" />
  }
</div>
```

## Transportation Profiles

The implementation supports these OpenRouteService profiles:

| Transport Type | ORS Profile     | Use Case               |
|---|---|---|
| **driving**    | driving-car     | Car routes with roads  |
| **cycling**    | cycling-regular | Bicycle-friendly paths |
| **walking**    | foot-walking    | Pedestrian routes      |
| **hiking**     | foot-hiking     | Trail and hiking paths |

## Styling

### Map Container
- Default height: `500px`
- Full width of parent container
- Rounded corners with shadow
- Responsive design

### Custom Markers
- Start point: Green marker (#2ECC71)
- End point: Red marker (#E74C3C)
- SVG-based icons for crisp rendering

### Route Line
- Color: Red (#FF6B6B)
- Weight: 4px
- Opacity: 0.8

## Error Handling

The component gracefully handles errors:

| Error Type | Cause | User Message |
|---|---|---|
| **Geocoding Failed** | Invalid address | "No results found for address: X" |
| **No Route Found** | No valid route between points | "No route found" |
| **Network Error** | API unreachable | "Failed to load route..." |

Users are prompted to verify that start/end locations are valid.

## Dependencies

```json
{
  "leaflet": "^1.x.x",
  "@types/leaflet": "^1.x.x"
}
```

Install via:
```bash
npm install leaflet
npm install --save-dev @types/leaflet
```

## Performance Considerations

1. **Caching**: Consider caching geocoding results for frequent locations
2. **Lazy Loading**: Map loads only when tour details component is accessed
3. **Cleanup**: MapService properly destroys map instance on component destroy
4. **API Rate Limiting**: Monitor OpenRouteService usage limits with your key

## Limitations

- **Geocoding Accuracy**: Results depend on OpenRouteService database coverage
- **Route Optimization**: Uses shortest path, not fastest path (can be configured in ORS request)
- **Offline Mode**: Requires internet connection for both tiles and routing data
- **Browser Support**: Modern browsers with WebGL support for optimal performance

## Future Enhancements

Potential improvements:

1. **Elevation Profile**: Display elevation changes along route
2. **Multiple Routes**: Show alternative routing options
3. **Offline Maps**: Cache tiles for offline viewing
4. **Route Editing**: Allow users to manually adjust waypoints
5. **Weather Overlay**: Show weather conditions along route
6. **Traffic Data**: Display real-time traffic (if ORS plan includes it)

## Troubleshooting

### "Map not found" Error
- Ensure container element `id="tour-map"` exists
- Check that map is initialized before use

### "Geocoding failed" Error
- Verify address format (street, city, country)
- Try with less specific address
- Check API quota hasn't been exceeded

### Map doesn't display route
- Verify both locations are in OpenRouteService database
- Check API key is valid and not expired
- Review browser console for detailed error messages
- Check network tab to see API requests

### Slow map loading
- Use smaller route distances
- Reduce zoom level complexity
- Consider caching geocoding results
- Monitor API rate limits

import { LatLngBounds } from 'leaflet'
import { FeatureGroup, MapContainer, Rectangle, TileLayer } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import { Location } from './types'

export function MapSelector({ position, selection, handleRectangleChange }: {
  position: Location,
  selection: LatLngBounds,
  handleRectangleChange: (bound: LatLngBounds) => void
}) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={16}
      maxZoom={18}
      minZoom={4}
      scrollWheelZoom={true}
      worldCopyJump={true}
      className={'h-100'}
    >
      {/* Display the selected rectangle */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* EditControl for drawing and editing rectangles */}
      <FeatureGroup>
        <EditControl
          position="topright"
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: false,
          }}
          edit={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: false,
          }}
          onEditResize={(e) => handleRectangleChange(e.layer.getBounds())}
          onEditMove={(e) => handleRectangleChange(e.layer.getBounds())}
        />
      </FeatureGroup>

      {selection && (
        // @ts-expect-error - type not recognised by ts
        <Rectangle bounds={selection} pathOptions={{ color: 'blue', weight: 2 }} editable={true}
                   onEdit={handleRectangleChange} />
      )}
    </MapContainer>
  )

}